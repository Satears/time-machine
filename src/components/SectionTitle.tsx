import Link from "next/link";

interface SectionTitleProps {
  index: string;
  title: string;
  sub?: string;
  href?: string;
  linkLabel?: string;
}

export function SectionTitle({
  index,
  title,
  sub,
  href,
  linkLabel = "查看全部 →",
}: SectionTitleProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3 sm:mb-6 sm:gap-4">
      <div className="min-w-0">
        <p className="mb-1 text-[10px] tracking-[0.3em] text-neon neon-pink sm:text-xs sm:tracking-[0.35em]">{index}</p>
        <h2 className="font-display text-xl font-bold tracking-wide text-cream sm:text-2xl lg:text-3xl">
          {title}
        </h2>
        {sub && <p className="mt-1 text-xs text-cream/50 sm:text-sm">{sub}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 rounded-full border border-gold/40 px-3 py-1.5 text-xs text-gold-light transition hover:bg-gold/10 sm:px-4 sm:text-sm"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
