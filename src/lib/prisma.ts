import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const { Pool } = pg;

function createClient() {
  const connectionString =
    process.env.NODE_ENV === "production"
      ? process.env.DATABASE_URL || process.env.DIRECT_URL
      : process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pool = new Pool({
    connectionString,
    max: process.env.NODE_ENV === "production" ? 4 : 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
