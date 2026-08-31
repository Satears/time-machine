import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: pg.Pool;
};

const { Pool } = pg;

/**
 * 判断一个错误是否是「连接被意外终止」这类瞬态错误，
 * 这类错误通常是：Supabase PgBouncer 杀掉了空闲连接、
 * Vercel 热函数重启后 pool 中保留了僵尸连接等场景，
 * 重试一次往往可以自愈。
 */
export function isTransientDbError(e: unknown): boolean {
  if (!e) return false;
  const msg =
    (e as Error).message ||
    (e as { code?: string }).code ||
    String(e);
  return (
    typeof msg === "string" &&
    (/connection terminated unexpectedly/i.test(msg) ||
      /connection (?:refused|reset|closed)/i.test(msg) ||
      /terminating connection due to administrator command/i.test(msg) ||
      /too many connections/i.test(msg) ||
      /could not (?:receive|send) any data/i.test(msg) ||
      /ETIMEDOUT|ECONNRESET|ECONNREFUSED|EPIPE/.test(msg) ||
      /the connection pool was closed/i.test(msg))
  );
}

/**
 * 当遇到连接错误时，主动销毁 pg.Pool 中的所有空闲连接，
 * 避免下一次请求继续命中 PgBouncer 已经回收的僵尸连接。
 */
export async function purgeDbPool(): Promise<void> {
  const pool = globalForPrisma.pool;
  if (!pool) return;
  try {
    await pool.end();
  } catch {
    /* ignore */
  }
  globalForPrisma.pool = undefined;
  globalForPrisma.prisma = undefined;
}

function createClient(): PrismaClient {
  const connectionString =
    process.env.NODE_ENV === "production"
      ? process.env.DATABASE_URL || process.env.DIRECT_URL
      : process.env.DIRECT_URL || process.env.DATABASE_URL;

  // PgBouncer (Supabase pooler) 自己已经做了连接复用，
  // 这里 pg.Pool 只保留很少的连接数，避免僵尸连接问题。
  const isProd = process.env.NODE_ENV === "production";
  const pool = new Pool({
    connectionString,
    max: isProd ? 2 : 10,
    idleTimeoutMillis: isProd ? 15_000 : 30_000,
    connectionTimeoutMillis: 15_000,
    // 在空闲时允许进程退出；同时让客户端立刻放弃长时间空闲的连接
    allowExitOnIdle: true,
    keepAlive: !isProd,
    keepAliveInitialDelayMillis: isProd ? 0 : 10_000,
  });

  pool.on("error", () => {
    // 连接池层面的错误（典型：PgBouncer 切断所有连接）→ 清空连接
    purgeDbPool().catch(() => void 0);
  });

  pool.on("remove", () => {
    // 连接被移除时无需处理，提示一下 pool 的健康度
  });

  globalForPrisma.pool = pool;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

export const prisma: PrismaClient = getPrisma();

/**
 * 带 1 次重试的数据库执行包装：
 * 第一次遇到连接类瞬态错误 → purge 掉僵尸池 → 新建池并重试 1 次。
 */
export async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (firstErr) {
    if (!isTransientDbError(firstErr)) {
      throw firstErr;
    }
    // 清理僵尸连接 + 新建池并重试
    await purgeDbPool();
    // 触发重新创建 PrismaClient + Pool
    getPrisma();
    try {
      return await fn();
    } catch (secondErr) {
      throw secondErr;
    }
  }
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
