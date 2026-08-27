import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";
import { Cover } from "@/components/Cover";
import { SongActions } from "@/components/song/SongActions";
import {
  CommentSection,
  type CommentItem,
} from "@/components/song/CommentSection";

export const dynamic = "force-dynamic";

export default async function SongDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const song = await prisma.song.findUnique({
    where: { id },
    include: {
      artist: { select: { id: true, name: true, debutYear: true } },
      comments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!song) notFound();

  const comments: CommentItem[] = song.comments.map((c) => ({
    id: c.id,
    nickname: c.nickname,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
  }));

  const decade = Math.floor(song.year / 10) * 10;

  return (
    <div className="mx-auto max-w-6xl animate-fade-up px-4 py-8 sm:py-12">
      <Link href="/songs" className="mb-5 inline-flex items-center gap-1 text-sm text-cream/50 transition hover:text-gold-light sm:mb-6">
        ← 返回金曲库
      </Link>

      <div className="mb-12 grid gap-8 sm:mb-14 sm:gap-10 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/* 封面 */}
        <div className="flex flex-col items-center">
          <div className="relative h-60 w-60 sm:h-[340px] sm:w-[340px]">
            {/* 唱机底座 */}
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10 sm:h-[420px] sm:w-[420px]" />
            <div className="vinyl relative h-full w-full">
              <Cover seed={song.title} rounded="full" className="relative z-10" />
            </div>
            <span className="absolute left-1/2 top-1/2 z-20 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/90 shadow-[0_0_18px_rgba(217,164,65,0.9)] sm:h-9 sm:w-9" />
          </div>
          <p className="mt-5 text-center text-[10px] tracking-[0.3em] text-cream/35 sm:mt-8 sm:text-xs sm:tracking-[0.35em]">
            {song.year} · {song.album ?? "未收录专辑"}
          </p>
        </div>

        {/* 信息 */}
        <div className="flex flex-col justify-center">
          <p className="mb-2 text-[10px] tracking-[0.3em] text-neon neon-pink sm:text-xs sm:tracking-[0.35em]">
            CANTONESE GOLDEN SONG · {decade}s
          </p>
          <h1 className="font-display text-3xl font-bold text-cream sm:text-4xl lg:text-5xl">
            {song.title}
          </h1>
          <Link
            href={`/artists/${song.artist.id}`}
            className="mt-3 w-fit text-base text-gold-light transition hover:underline sm:text-lg"
          >
            {song.artist.name}
          </Link>

          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-cream/55 sm:mt-6 sm:text-sm">
            <span>发行年份 {song.year}</span>
            <span>时长 {formatDuration(song.duration)}</span>
            <span>专辑 {song.album ?? "—"}</span>
          </div>

          <div className="mt-6 sm:mt-8">
            <SongActions
              song={{
                id: song.id,
                title: song.title,
                artist: song.artist.name,
                audioUrl: song.audioUrl,
                duration: song.duration,
                year: song.year,
              }}
              initialLikes={song.likes}
              plays={song.plays}
            />
          </div>

          {/* 金句/点评 */}
          {song.lyrics && (
            <div className="relative mt-8 overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-ink-3 to-ink-2 p-5 sm:mt-10 sm:p-6">
              <span className="pointer-events-none absolute -right-6 -top-8 font-calli text-8xl text-gold/10">&ldquo;</span>
              <p className="text-[10px] tracking-[0.25em] text-cream/40 sm:text-xs sm:tracking-[0.3em]">这首歌 · 一句话</p>
              <p className="mt-3 font-display text-base leading-relaxed text-gold-light sm:text-lg">
                {song.lyrics}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 评论区 */}
      <div className="mx-auto max-w-3xl">
        <CommentSection songId={song.id} initialComments={comments} />
      </div>
    </div>
  );
}
