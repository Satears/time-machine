import Link from "next/link";
import { prisma, withDbRetry } from "@/lib/prisma";
import { SectionTitle } from "@/components/SectionTitle";
import { SongList, type SongRowItem } from "@/components/SongRow";
import { ArtistCard, type ArtistCardItem } from "@/components/ArtistCard";

const HERO_IMG =
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=" +
  encodeURIComponent(
    "1980s Hong Kong neon city street at night, glowing retro Chinese shop signs, vinyl records and cassette tapes scattered, synthwave purple pink and gold tones, cinematic film grain, nostalgic atmosphere, high detail"
  ) +
  "&image_size=landscape_16_9";

const MARQUEE_ITEMS = [
  "海阔天空", "千千阙歌", "富士山下", "光辉岁月", "沧海一声笑", "偏偏喜欢你",
  "红日", "浪子心声", "浮夸", "狮子山下", "真的爱你", "一生中最爱", "吻别",
  "女人花", "少女的祈祷", "喜帖街", "沉默是金", "每天爱你多一些",
];

const DECADES = [
  { d: 1970, tag: "开山立派", desc: "粤语歌元年" },
  { d: 1980, tag: "黄金年代", desc: "谭张争霸 · 群星璀璨" },
  { d: 1990, tag: "天王时代", desc: "四大天王 · 红馆盛世" },
  { d: 2000, tag: "世代交接", desc: "Eason 登基 · K歌时代" },
  { d: 2010, tag: "低谷与复兴", desc: "广东歌不死" },
  { d: 2020, tag: "新浪潮", desc: "MIRROR · 唱作新血" },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [topSongs, topArtists, songCount, artistCount] = await withDbRetry(
    () =>
      Promise.all([
        prisma.song.findMany({
          orderBy: { plays: "desc" },
          take: 8,
          include: { artist: { select: { name: true } } },
        }),
        prisma.artist.findMany({
          orderBy: { songs: { _count: "desc" } },
          take: 8,
          include: { _count: { select: { songs: true } } },
        }),
        prisma.song.count(),
        prisma.artist.count(),
      ])
  );

  const hotSongs: SongRowItem[] = topSongs.map((s) => ({
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

  const artists: ArtistCardItem[] = topArtists.map((a) => ({
    id: a.id,
    name: a.name,
    nameEn: a.nameEn,
    genre: a.genre,
    debutYear: a.debutYear,
    songCount: a._count.songs,
  }));

  return (
    <div className="animate-fade-up">
      {/* ===== HERO ===== */}
      <section className="grain relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${HERO_IMG}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/55 to-ink" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-16 pt-14 text-center sm:pb-24 sm:pt-28">
          <p className="mb-3 text-[10px] tracking-[0.4em] text-cyan neon-cyan sm:mb-4 sm:text-xs sm:tracking-[0.5em]">
            ── 1970s — 2020s ──
          </p>
          <h1 className="font-calli text-5xl leading-tight text-cream sm:text-7xl lg:text-8xl">
            <span className="neon-gold">港乐</span>
            <span className="neon-pink">时光机</span>
          </h1>
          <p className="mt-4 max-w-xl text-xs leading-relaxed text-cream/70 sm:mt-5 sm:text-sm lg:text-base">
            半个世纪的香港流行音乐，浓缩在一台时光机里。
            从狮子山下的打拼岁月，到红馆的万人大合唱 ——
            选一个年代，按下播放，回到金曲响起的那个晚上。
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-9 sm:gap-4">
            <Link
              href="/tunnel"
              className="rounded-full border border-gold bg-gold/15 px-5 py-2.5 text-xs font-medium text-gold-light transition hover:scale-105 hover:bg-gold/30 glow-gold sm:px-7 sm:py-3 sm:text-sm"
            >
              进入时光隧道
            </Link>
            <Link
              href="/songs"
              className="rounded-full border border-neon/60 bg-neon/10 px-5 py-2.5 text-xs font-medium text-cream transition hover:scale-105 hover:bg-neon/25 sm:px-7 sm:py-3 sm:text-sm"
            >
              浏览金曲库
            </Link>
          </div>

          <div className="mt-10 grid w-full max-w-md grid-cols-3 gap-4 text-center sm:mt-12 sm:max-w-none sm:gap-8">
            {[
              { n: "6", l: "个年代" },
              { n: `${artistCount}`, l: "位传奇歌手" },
              { n: `${songCount}`, l: "首传世金曲" },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-2xl font-bold text-gold-light neon-gold sm:text-4xl">
                  {s.n}
                </p>
                <p className="mt-1 text-[10px] tracking-widest text-cream/50 sm:text-xs">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 跑马灯 ===== */}
      <section className="overflow-hidden border-y border-gold/20 bg-ink-2/60 py-2.5 sm:py-3">
        <div className="marquee-track text-xs tracking-[0.25em] text-gold-light/70 sm:text-sm sm:tracking-[0.3em]">
          {[0, 1].map((k) => (
            <span key={k} className="flex shrink-0 items-center">
              {MARQUEE_ITEMS.map((t) => (
                <span key={`${k}-${t}`} className="flex items-center">
                  <span className="px-3 sm:px-4">{t}</span>
                  <span className="text-neon/60">♪</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </section>

      {/* ===== 时光隧道入口 ===== */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
        <SectionTitle
          index="CH 01 · TIME TUNNEL"
          title="选择你的年代"
          sub="每个年代，都有它的声音与心跳"
          href="/tunnel"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {DECADES.map(({ d, tag, desc }) => (
            <Link
              key={d}
              href={`/tunnel?decade=${d}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-ink-3 to-ink-2 p-4 transition hover:-translate-y-1 hover:border-gold/50 sm:p-5"
            >
              <p className="font-display text-2xl font-bold text-cream transition group-hover:text-gold-light sm:text-3xl">
                {d}
                <span className="ml-0.5 text-sm text-cream/40 sm:text-base">s</span>
              </p>
              <p className="mt-1 text-[11px] text-gold-light sm:text-xs">{tag}</p>
              <p className="mt-1 text-[10px] text-cream/40 sm:text-[11px]">{desc}</p>
              <span className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gold/10 blur-xl transition group-hover:bg-neon/20" />
            </Link>
          ))}
        </div>
      </section>

      {/* ===== 热门金曲 ===== */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <SectionTitle
          index="CH 02 · TOP HITS"
          title="点播榜 · 最热金曲"
          sub="按播放热度排序，一键连播"
          href="/songs"
        />
        <div className="rounded-2xl border border-white/8 bg-ink-2/40 p-2">
          <SongList songs={hotSongs} />
        </div>
      </section>

      {/* ===== 传奇歌手 ===== */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <SectionTitle
          index="CH 03 · LEGENDS"
          title="传奇歌手"
          sub="他们定义了港乐的黄金时代"
          href="/artists"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {artists.map((a) => (
            <ArtistCard key={a.id} artist={a} />
          ))}
        </div>
      </section>

      {/* ===== 页脚说明 ===== */}
      <footer className="mx-auto max-w-6xl px-4 pb-8 pt-4">
        <div className="divider-gold" />
        <p className="mt-5 text-center text-[11px] leading-relaxed text-cream/35 sm:mt-6 sm:text-xs">
          港乐时光机 · 致敬香港流行音乐黄金年代　|　数据为演示内容，歌曲试听使用无版权演示音频，
          版权归原版权方所有。一键回到金曲年代，谨以此致敬港乐。
        </p>
      </footer>
    </div>
  );
}
