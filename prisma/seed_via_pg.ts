// 使用原生 pg 驱动直接连 Supabase PostgreSQL 建表 + 写种子数据
// 绕过 Prisma 7 driver adapter 的安装问题（npm 网络慢）
import "dotenv/config";
import pg from "pg";
import { randomUUID } from "crypto";
import { ARTISTS, EVENTS, DEMO_AUDIOS } from "./seed_data";

const { Pool } = pg;

const CREATE_SCHEMA_SQL = `
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "Artist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "birthYear" INTEGER,
    "debutYear" INTEGER,
    "genre" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Song" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "album" TEXT,
    "year" INTEGER NOT NULL,
    "duration" INTEGER,
    "cover" TEXT,
    "audioUrl" TEXT,
    "lyrics" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "plays" INTEGER NOT NULL DEFAULT 0,
    "artistId" TEXT NOT NULL REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "DecadeEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "decade" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "songId" TEXT NOT NULL REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Artist_name_idx" ON "Artist"("name");
CREATE INDEX IF NOT EXISTS "Song_year_idx" ON "Song"("year");
CREATE INDEX IF NOT EXISTS "Song_title_idx" ON "Song"("title");
CREATE INDEX IF NOT EXISTS "DecadeEvent_decade_idx" ON "DecadeEvent"("decade");
CREATE INDEX IF NOT EXISTS "Comment_songId_idx" ON "Comment"("songId");
`;

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DIRECT_URL 或 DATABASE_URL 未设置");
  }
  console.log("连接数据库…");
  const pool = new Pool({ connectionString, connectionTimeoutMillis: 30000 });

  try {
    // 1. 建表
    console.log("执行建表 SQL…");
    await pool.query(CREATE_SCHEMA_SQL);
    console.log("✅ 表结构创建成功");

    // 2. 清空旧数据（按依赖顺序）
    console.log("清空旧数据…");
    await pool.query('DELETE FROM "Comment"');
    await pool.query('DELETE FROM "Song"');
    await pool.query('DELETE FROM "Artist"');
    await pool.query('DELETE FROM "DecadeEvent"');

    // 3. 写入歌手 + 歌曲
    console.log(`开始写入 ${ARTISTS.length} 位歌手和对应歌曲…`);
    let demoIdx = 0;
    let songCount = 0;
    for (const a of ARTISTS) {
      const artistId = randomUUID();
      await pool.query(
        `
        INSERT INTO "Artist" ("id", "name", "nameEn", "avatar", "bio", "birthYear", "debutYear", "genre")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [artistId, a.name, a.nameEn, null, a.bio, a.birthYear ?? null, a.debutYear, a.genre]
      );

      for (const s of a.songs) {
        const songId = randomUUID();
        await pool.query(
          `
          INSERT INTO "Song" ("id", "title", "album", "year", "duration", "cover", "audioUrl", "lyrics", "likes", "plays", "artistId")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `,
          [
            songId,
            s.title,
            s.album,
            s.year,
            s.duration,
            null,
            s.demo ? DEMO_AUDIOS[demoIdx++ % DEMO_AUDIOS.length] : null,
            s.note,
            s.likes,
            s.plays,
            artistId,
          ]
        );
        songCount++;
      }
    }
    console.log(`✅ 写入 ${ARTISTS.length} 位歌手，${songCount} 首歌曲`);

    // 4. 写入大事记
    console.log(`开始写入 ${EVENTS.length} 条大事记…`);
    for (const e of EVENTS) {
      await pool.query(
        `
        INSERT INTO "DecadeEvent" ("id", "decade", "year", "title", "content")
        VALUES ($1, $2, $3, $4, $5)
        `,
        [randomUUID(), e.decade, e.year, e.title, e.content]
      );
    }
    console.log(`✅ 写入 ${EVENTS.length} 条大事记`);

    // 5. 统计
    const ac = await pool.query(`SELECT COUNT(*) as n FROM "Artist"`);
    const sc = await pool.query(`SELECT COUNT(*) as n FROM "Song"`);
    const ec = await pool.query(`SELECT COUNT(*) as n FROM "DecadeEvent"`);
    console.log(
      `\n🎉 全部完成！Artist=${ac.rows[0].n}, Song=${sc.rows[0].n}, DecadeEvent=${ec.rows[0].n}`
    );
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error("❌ 执行失败：", e);
  process.exit(1);
});
