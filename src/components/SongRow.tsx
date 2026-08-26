import Link from "next/link";
import { Cover } from "@/components/Cover";
import { PlayButton } from "@/components/PlayButton";
import { formatDuration, type PlayerSong } from "@/lib/utils";

export interface SongRowItem {
  id: string;
  title: string;
  artistName: string;
  album?: string | null;
  year: number;
  duration?: number | null;
  likes: number;
  plays: number;
  audioUrl?: string | null;
}

export function toPlayerSong(s: SongRowItem): PlayerSong {
  return {
    id: s.id,
    title: s.title,
    artist: s.artistName,
    audioUrl: s.audioUrl,
    duration: s.duration,
  };
}

interface SongRowProps {
  song: SongRowItem;
  index?: number;
  queue?: SongRowItem[];
}

export function SongRow({ song, index, queue }: SongRowProps) {
  const q = queue?.map(toPlayerSong);
  return (
    <div className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/5">
      <span className="hidden w-8 shrink-0 text-center text-sm text-cream/40 sm:block">
        {index ?? ""}
      </span>
      <Link href={`/songs/${song.id}`} className="shrink-0">
        <Cover seed={song.title} size={44} />
      </Link>
      <PlayButton song={toPlayerSong(song)} queue={q} size="sm" className="shrink-0 sm:hidden" />
      <div className="min-w-0 flex-1">
        <Link
          href={`/songs/${song.id}`}
          className="block truncate text-sm font-medium text-cream transition hover:text-gold-light"
        >
          {song.title}
        </Link>
        <p className="truncate text-xs text-cream/45">{song.artistName}</p>
      </div>
      <span className="hidden w-40 truncate text-xs text-cream/45 md:block">
        {song.album ?? "—"}
      </span>
      <span className="hidden w-12 text-right text-xs text-cream/45 sm:block">{song.year}</span>
      <span className="hidden w-16 text-right text-xs text-cream/45 lg:block">
        {formatDuration(song.duration)}
      </span>
      <PlayButton song={toPlayerSong(song)} queue={q} size="sm" className="hidden sm:grid" />
    </div>
  );
}

interface SongListProps {
  songs: SongRowItem[];
}

export function SongList({ songs }: SongListProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {songs.map((s, i) => (
        <SongRow key={s.id} song={s} index={i + 1} queue={songs} />
      ))}
      {songs.length === 0 && (
        <p className="py-8 text-center text-sm text-cream/40">没有找到匹配的金曲。</p>
      )}
    </div>
  );
}
