import { prisma, withDbRetry } from "@/lib/prisma";
import { SearchBar } from "@/components/SearchBar";
import { ArtistCard, type ArtistCardItem } from "@/components/ArtistCard";

export const dynamic = "force-dynamic";

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const keyword = q.trim();

  const artists = await withDbRetry(() =>
    prisma.artist.findMany({
      where: keyword
        ? {
            OR: [
              { name: { contains: keyword } },
              { nameEn: { contains: keyword } },
              { genre: { contains: keyword } },
            ],
          }
        : undefined,
      orderBy: [{ debutYear: "asc" }],
      include: { _count: { select: { songs: true } } },
    })
  );

  const items: ArtistCardItem[] = artists.map((a) => ({
    id: a.id,
    name: a.name,
    nameEn: a.nameEn,
    genre: a.genre,
    debutYear: a.debutYear,
    songCount: a._count.songs,
  }));

  return (
    <div className="mx-auto max-w-6xl animate-fade-up px-4 py-8 sm:py-12">
      <header className="mb-8 text-center">
        <p className="mb-2 text-[10px] tracking-[0.35em] text-neon neon-pink sm:text-xs sm:tracking-[0.4em]">HALL OF LEGENDS</p>
        <h1 className="font-calli text-4xl text-cream sm:text-6xl">
          <span className="neon-gold">歌手</span>库
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-xs text-cream/60 sm:mt-4 sm:text-sm">
          从开山鼻祖许冠杰，到新世代唱作人 —— 港乐群星，尽在此处。
        </p>
        <div className="mt-5 flex justify-center sm:mt-6">
          <SearchBar basePath="/artists" defaultValue={q} placeholder="搜索歌手名 / 英文名 / 曲风…" />
        </div>
      </header>

      {keyword && (
        <p className="mb-6 text-center text-xs text-cream/50 sm:text-sm">
          搜索「{keyword}」，共找到 <span className="text-gold-light">{items.length}</span> 位歌手
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {items.map((a) => (
          <ArtistCard key={a.id} artist={a} />
        ))}
      </div>

      {items.length === 0 && (
        <p className="py-16 text-center text-sm text-cream/40">没有找到匹配的歌手，换个关键词试试。</p>
      )}
    </div>
  );
}
