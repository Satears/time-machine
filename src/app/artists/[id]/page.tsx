import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Cover } from "@/components/Cover";
import { SongList, type SongRowItem } from "@/components/SongRow";

export const dynamic = "force-dynamic";

export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const artist = await prisma.artist.findUnique({
    where: { id },
    include: {
      songs: {
        orderBy: [{ year: "asc" }, { plays: "desc" }],
      },
    },
  });

  if (!artist) notFound();

  const songs: SongRowItem[] = artist.songs.map((s) => ({
    id: s.id,
    title: s.title,
    artistName: artist.name,
    album: s.album,
    year: s.year,
    duration: s.duration,
    likes: s.likes,
    plays: s.plays,
    audioUrl: s.audioUrl,
  }));

  const debutDecade = artist.debutYear ? Math.floor(artist.debutYear / 10) * 10 : null;
  const totalPlays = artist.songs.reduce((sum, s) => sum + s.plays, 0);
  const avgYear =
    artist.songs.length > 0
      ? Math.round(artist.songs.reduce((sum, s) => sum + s.year, 0) / artist.songs.length)
      : null;

  return (
    <div className="mx-auto max-w-6xl animate-fade-up px-4 py-8 sm:py-12">
      {/* 歌手卡 */}
      <section className="mb-10 overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-ink-3 via-ink-2 to-velvet/50 sm:mb-12">
        <div className="relative p-6 sm:p-8 lg:p-10">
          <span className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-16 left-1/4 h-40 w-40 rounded-full bg-neon/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="shrink-0">
              <div className="relative h-28 w-28 sm:h-[150px] sm:w-[150px]">
                <Cover seed={artist.name} rounded="full" className="h-full w-full" />
                <span className="absolute inset-0 rounded-full shadow-[inset_0_0_0_3px_rgba(217,164,65,0.5)]" />
              </div>
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="mb-1 text-[10px] tracking-[0.3em] text-neon neon-pink sm:text-xs sm:tracking-[0.35em]">
                {artist.genre ?? "CANTONESE POP"}
              </p>
              <h1 className="font-display text-3xl font-bold text-cream sm:text-4xl">
                {artist.name}
                {artist.nameEn && (
                  <span className="ml-2 align-middle text-sm font-normal text-cream/40 sm:ml-3 sm:text-lg">
                    {artist.nameEn}
                  </span>
                )}
              </h1>
              <p className="mt-3 max-w-2xl text-xs leading-relaxed text-cream/65 sm:mt-4 sm:text-sm">{artist.bio}</p>

              <div className="mt-5 flex flex-wrap justify-center gap-2 text-center sm:mt-6 sm:justify-start sm:gap-3">
                {artist.birthYear && (
                  <div className="rounded-2xl border border-white/10 bg-ink/40 px-3 py-1.5 sm:px-4 sm:py-2">
                    <p className="text-[10px] text-cream/45 sm:text-xs">出生年份</p>
                    <p className="font-display text-base font-bold text-gold-light sm:text-lg">{artist.birthYear}</p>
                  </div>
                )}
                {artist.debutYear && (
                  <div className="rounded-2xl border border-white/10 bg-ink/40 px-3 py-1.5 sm:px-4 sm:py-2">
                    <p className="text-[10px] text-cream/45 sm:text-xs">出道年份</p>
                    <p className="font-display text-base font-bold text-gold-light sm:text-lg">{artist.debutYear}</p>
                  </div>
                )}
                <div className="rounded-2xl border border-white/10 bg-ink/40 px-3 py-1.5 sm:px-4 sm:py-2">
                  <p className="text-[10px] text-cream/45 sm:text-xs">收录金曲</p>
                  <p className="font-display text-base font-bold text-gold-light sm:text-lg">{artist.songs.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-ink/40 px-3 py-1.5 sm:px-4 sm:py-2">
                  <p className="text-[10px] text-cream/45 sm:text-xs">累计点播</p>
                  <p className="font-display text-base font-bold text-gold-light sm:text-lg">
                    {totalPlays >= 10000 ? `${(totalPlays / 10000).toFixed(1)}万` : totalPlays}
                  </p>
                </div>
              </div>

              {debutDecade && avgYear && (
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:mt-5 sm:justify-start">
                  <Link
                    href={`/tunnel?decade=${debutDecade}`}
                    className="rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 text-xs text-cyan transition hover:bg-cyan/20"
                  >
                    {debutDecade}s 出道
                  </Link>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-cream/50">
                    活跃年代 ≈ {Math.floor(avgYear / 10) * 10}s
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 金曲 */}
      <section>
        <h2 className="mb-5 flex items-center gap-3 font-display text-xl font-bold text-cream sm:mb-6 sm:text-2xl">
          <span className="text-cyan">♪</span> {artist.name} 的代表作
        </h2>
        <div className="rounded-2xl border border-white/8 bg-ink-2/40 p-2">
          <SongList songs={songs} />
        </div>
      </section>
    </div>
  );
}
