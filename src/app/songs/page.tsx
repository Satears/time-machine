import Link from "next/link";
import { prisma, withDbRetry } from "@/lib/prisma";
import { SearchBar } from "@/components/SearchBar";
import { SortSelect } from "@/components/SortSelect";
import { SongList, type SongRowItem } from "@/components/SongRow";
import type { Prisma } from "@/generated/prisma/client";

const DECADES = [1970, 1980, 1990, 2000, 2010, 2020];

export const dynamic = "force-dynamic";

export default async function SongsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; decade?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const decade = DECADES.includes(Number(sp.decade)) ? Number(sp.decade) : null;
  const sort = sp.sort ?? "plays";

  const where: Prisma.SongWhereInput = {
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { album: { contains: q } },
            { artist: { name: { contains: q } } },
          ],
        }
      : {}),
    ...(decade ? { year: { gte: decade, lt: decade + 10 } } : {}),
  };

  const orderBy: Prisma.SongOrderByWithRelationInput =
    sort === "likes"
      ? { likes: "desc" }
      : sort === "year_desc"
        ? { year: "desc" }
        : sort === "year_asc"
          ? { year: "asc" }
          : sort === "title"
            ? { title: "asc" }
            : { plays: "desc" };

  const songs = await withDbRetry(() =>
    prisma.song.findMany({
      where,
      orderBy,
      include: { artist: { select: { name: true } } },
    })
  );

  const items: SongRowItem[] = songs.map((s) => ({
    id: s.id,
    title: s.title,
    artistName: s.artist.name,
    album: s.album,
    year: s.year,
    duration: s.duration,
    likes: s.likes,
    plays: s.plays,
    audioUrl: s.audioUrl,
  }));

  const params = `${q ? `q=${encodeURIComponent(q)}` : ""}${
    decade ? `${q ? "&" : ""}decade=${decade}` : ""
  }`;

  return (
    <div className="mx-auto max-w-6xl animate-fade-up px-4 py-8 sm:py-12">
      <header className="mb-8 text-center">
        <p className="mb-2 text-[10px] tracking-[0.35em] text-neon neon-pink sm:text-xs sm:tracking-[0.4em]">GOLDEN SONGS</p>
        <h1 className="font-calli text-4xl text-cream sm:text-6xl">
          <span className="neon-gold">金曲</span>库
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-xs text-cream/60 sm:mt-4 sm:text-sm">
          搜索歌名、专辑或歌手，筛选年代，找到属于你的那首歌。
        </p>
        <div className="mt-5 flex justify-center sm:mt-6">
          <SearchBar basePath="/songs" defaultValue={q} placeholder="搜索歌名 / 专辑 / 歌手…" />
        </div>
      </header>

      {/* 筛选栏 */}
      <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:mb-8 sm:flex-row sm:gap-4">
        <nav className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
          <Link
            href="/songs"
            className={`rounded-full border px-3 py-1.5 text-xs transition sm:px-4 ${
              !decade
                ? "border-gold bg-gold/20 text-gold-light"
                : "border-white/10 text-cream/60 hover:border-gold/40"
            }`}
          >
            全部
          </Link>
          {DECADES.map((d) => (
            <Link
              key={d}
              href={`/songs?${params}${params ? "&" : ""}decade=${d}`}
              className={`rounded-full border px-3 py-1.5 text-xs transition sm:px-4 ${
                decade === d
                  ? "border-gold bg-gold/20 text-gold-light"
                  : "border-white/10 text-cream/60 hover:border-gold/40"
              }`}
            >
              {d}s
            </Link>
          ))}
        </nav>
        <SortSelect basePath="/songs" current={sort} params={params} />
      </div>

      <p className="mb-3 text-xs text-cream/50 sm:mb-4 sm:text-sm">
        共 <span className="text-gold-light">{items.length}</span> 首金曲
        {q && <> · 关键词「{q}」</>}
        {decade && <> · {decade}s</>}
      </p>

      <div className="rounded-2xl border border-white/8 bg-ink-2/40 p-2">
        <SongList songs={items} />
      </div>
    </div>
  );
}
