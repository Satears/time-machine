import Link from "next/link";

const LINKS = [
  { href: "/", label: "首页" },
  { href: "/tunnel", label: "时光隧道" },
  { href: "/artists", label: "歌手库" },
  { href: "/songs", label: "金曲库" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-4">
        <Link href="/" className="group flex min-w-0 items-center gap-2 sm:gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/60 bg-gold/10 font-calli text-lg text-gold-light glow-gold transition-transform group-hover:rotate-12 sm:h-9 sm:w-9 sm:text-xl">
            港
          </span>
          <span className="leading-tight">
            <span className="block truncate font-display text-base font-bold tracking-widest neon-gold sm:text-lg">
              港乐时光机
            </span>
            <span className="hidden break-all text-[10px] tracking-[0.3em] text-cream/50 sm:block">
              CANTONESE MUSIC TIME MACHINE
            </span>
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-2.5 py-1.5 text-xs text-cream/70 transition hover:bg-white/5 hover:text-gold-light sm:px-4 sm:text-sm"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
