import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SongList, type SongRowItem } from "@/components/SongRow";

const DECADES = [1970, 1980, 1990, 2000, 2010, 2020];

const DECADE_INTRO: Record<number, string> = {
  1970: "从《鬼马双星》开始，粤语歌终于唱出了自己的腔调。市井、奋斗与家国情怀，在这一代生根发芽。",
  1980: "港乐的黄金十年。谭咏麟与张国荣的争霸、梅艳芳的百变舞台、Beyond 的摇滚呐喊，群星璀璨到让整个华语世界仰望。",
  1990: "四大天王时代，红馆演唱会一票难求。偶像工业登峰造极，港乐的影响力辐射整个亚洲。",
  2000: "张国荣与梅艳芳的离去让乐坛陷入悲伤，但陈奕迅、容祖儿、杨千嬅们接过了话筒，港乐完成世代交接。",
  2010: "唱片业寒冬之下，「广东歌」在流媒体时代被重新翻找出来，年轻乐迷高呼「广东歌永不会死」。",
  2020: "MIRROR 现象与新一代唱作人带来新浪潮，港乐在社交媒体与演唱会文化中迎来复兴。",
};

export const dynamic = "force-dynamic";

export default async function TunnelPage({
  searchParams,
}: {
  searchParams: Promise<{ decade?: string }>;
}) {
  const { decade: decadeParam } = await searchParams;
  const active = DECADES.includes(Number(decadeParam)) ? Number(decadeParam) : 1980;

  const [events, songs] = await Promise.all([
    prisma.decadeEvent.findMany({
      where: { decade: active },
      orderBy: { year: "asc" },
    }),
    prisma.song.findMany({
      where: { year: { gte: active, lt: active + 10 } },
      orderBy: [{ year: "asc" }, { plays: "desc" }],
      include: { artist: { select: { name: true } } },
    }),
  ]);

  const decadeSongs: SongRowItem[] = songs.map((s) => ({
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

  return (
    <div className="mx-auto max-w-6xl animate-fade-up px-4 py-8 sm:py-12">
      {/* 页头 */}
      <header className="mb-8 text-center sm:mb-10">
        <p className="mb-2 text-[10px] tracking-[0.35em] text-neon neon-pink sm:text-xs sm:tracking-[0.4em]">THE TIME TUNNEL</p>
        <h1 className="font-calli text-4xl text-cream sm:text-6xl">
          <span className="neon-gold">时光</span>
          <span className="neon-cyan">隧道</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-cream/60 sm:mt-4 sm:text-sm">
          穿过这扇门，你会听见那个年代的声音 —— 从黑胶唱机的沙沙声，到红馆的万人合唱。
        </p>
      </header>

      {/* 年代切换 */}
      <nav className="mb-8 flex flex-wrap justify-center gap-2 sm:mb-10">
        {DECADES.map((d) => {
          const isActive = d === active;
          return (
            <Link
              key={d}
              href={`/tunnel?decade=${d}`}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition sm:px-5 sm:py-2 sm:text-sm ${
                isActive
                  ? "border-gold bg-gold/20 text-gold-light glow-gold"
                  : "border-white/10 text-cream/60 hover:border-gold/40 hover:text-gold-light"
              }`}
            >
              {d}s
            </Link>
          );
        })}
      </nav>

      {/* 年代介绍 */}
      <section className="mb-10 overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-ink-3 via-ink-2 to-velvet/40 p-6 text-center sm:mb-12 sm:p-10">
        <p className="font-display text-5xl font-black leading-none text-gold-light/20 sm:text-7xl">
          {active}s
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-cream sm:text-3xl">{active}s · 年代之声</h2>
        <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-cream/65 sm:text-sm">
          {DECADE_INTRO[active]}
        </p>
        <div className="mx-auto mt-6 grid max-w-lg grid-cols-3 gap-2 text-center sm:gap-4">
          <div className="rounded-2xl bg-ink/50 p-2 sm:p-3">
            <p className="font-display text-xl font-bold text-gold-light sm:text-2xl">{events.length}</p>
            <p className="text-[10px] text-cream/45 sm:text-[11px]">件大事记</p>
          </div>
          <div className="rounded-2xl bg-ink/50 p-2 sm:p-3">
            <p className="font-display text-xl font-bold text-gold-light sm:text-2xl">{decadeSongs.length}</p>
            <p className="text-[10px] text-cream/45 sm:text-[11px]">首收录金曲</p>
          </div>
          <div className="rounded-2xl bg-ink/50 p-2 sm:p-3">
            <p className="font-display text-xl font-bold text-gold-light sm:text-2xl">
              {new Set(events.map((e) => e.year)).size}
            </p>
            <p className="text-[10px] text-cream/45 sm:text-[11px]">个年份节点</p>
          </div>
        </div>
      </section>

      {/* 时间轴 */}
      <section className="mb-12 sm:mb-14">
        <h2 className="mb-5 flex items-center gap-3 font-display text-xl font-bold text-cream sm:mb-6 sm:text-2xl">
          <span className="text-neon">◆</span> 大事记时间轴
        </h2>
        <div className="relative border-l border-gold/25 pl-6 sm:pl-8">
          {events.map((e, i) => (
            <div key={e.id} className="relative pb-6 last:pb-0 sm:pb-8">
              {/* 节点 */}
              <span
                className={`absolute -left-[27px] top-1 grid h-3.5 w-3.5 place-items-center rounded-full border sm:-left-[37px] sm:h-4 sm:w-4 ${
                  i % 2 === 0
                    ? "border-gold bg-gold/30 glow-gold"
                    : "border-neon bg-neon/30 glow-pink"
                }`}
              >
                <span className="h-1 w-1 rounded-full bg-cream/90 sm:h-1.5 sm:w-1.5" />
              </span>
              <div className="rounded-2xl border border-white/8 bg-ink-2/50 p-4 transition hover:border-gold/30 sm:p-5">
                <div className="flex items-baseline gap-2 sm:gap-3">
                  <span className="font-display text-xl font-black text-gold-light sm:text-2xl">{e.year}</span>
                  <h3 className="text-sm font-semibold text-cream sm:text-base">{e.title}</h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-cream/55 sm:text-sm">{e.content}</p>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <p className="py-6 text-sm text-cream/40">该年代暂无收录大事记。</p>
          )}
        </div>
      </section>

      {/* 年代金曲 */}
      <section>
        <h2 className="mb-5 flex items-center gap-3 font-display text-xl font-bold text-cream sm:mb-6 sm:text-2xl">
          <span className="text-cyan">♪</span> {active}s 金曲精选
        </h2>
        <div className="rounded-2xl border border-white/8 bg-ink-2/40 p-2">
          <SongList songs={decadeSongs} />
        </div>
      </section>
    </div>
  );
}
