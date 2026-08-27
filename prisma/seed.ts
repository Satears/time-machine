import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import pg from "pg";
import { ARTISTS, EVENTS, DEMO_AUDIOS } from "./seed_data";

const { Pool } = pg;

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL is not set in .env");
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("开始写入种子数据…");

  // 清空旧数据
  await prisma.comment.deleteMany();
  await prisma.song.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.decadeEvent.deleteMany();

  // 歌手与歌曲
  let demoIdx = 0;
  for (const a of ARTISTS) {
    const artist = await prisma.artist.create({
      data: {
        name: a.name,
        nameEn: a.nameEn,
        bio: a.bio,
        birthYear: a.birthYear,
        debutYear: a.debutYear,
        genre: a.genre,
      },
    });

    for (const s of a.songs) {
      await prisma.song.create({
        data: {
          title: s.title,
          album: s.album,
          year: s.year,
          duration: s.duration,
          likes: s.likes,
          plays: s.plays,
          lyrics: s.note,
          audioUrl: s.demo ? DEMO_AUDIOS[demoIdx++ % DEMO_AUDIOS.length] : null,
          artistId: artist.id,
        },
      });
    }
  }

  // 大事记
  for (const e of EVENTS) {
    await prisma.decadeEvent.create({ data: e });
  }

  const songCount = await prisma.song.count();
  const artistCount = await prisma.artist.count();
  const eventCount = await prisma.decadeEvent.count();
  console.log(`完成：${artistCount} 位歌手，${songCount} 首歌曲，${eventCount} 条大事记。`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
