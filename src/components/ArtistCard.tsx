import Link from "next/link";
import { Cover } from "@/components/Cover";

export interface ArtistCardItem {
  id: string;
  name: string;
  nameEn?: string | null;
  genre?: string | null;
  songCount: number;
  debutYear?: number | null;
}

export function ArtistCard({ artist }: { artist: ArtistCardItem }) {
  return (
    <Link
      href={`/artists/${artist.id}`}
      className="group flex flex-col items-center gap-2.5 rounded-2xl border border-white/8 bg-ink-2/60 p-4 text-center transition hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_10px_40px_rgba(217,164,65,0.12)] sm:gap-3 sm:p-5"
    >
      <div className="relative">
        <Cover seed={artist.name} size={72} rounded="full" className="sm:!h-[84px] sm:!w-[84px]" />
        <span className="absolute inset-0 rounded-full shadow-[inset_0_0_0_2px_rgba(217,164,65,0)] transition group-hover:shadow-[inset_0_0_0_2px_rgba(217,164,65,0.6)]" />
      </div>
      <div className="min-w-0">
        <p className="font-display text-base font-bold text-cream transition group-hover:text-gold-light sm:text-lg">
          {artist.name}
        </p>
        {artist.nameEn && (
          <p className="truncate text-[10px] tracking-widest text-cream/40 sm:text-[11px]">{artist.nameEn}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-cream/50 sm:text-[11px]">
        {artist.genre && (
          <span className="rounded-full border border-white/10 px-2 py-0.5">{artist.genre.split(" / ")[0]}</span>
        )}
        <span className="rounded-full bg-gold/10 px-2 py-0.5 text-gold-light">
          {artist.songCount} 首金曲
        </span>
      </div>
    </Link>
  );
}
