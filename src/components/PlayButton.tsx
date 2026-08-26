"use client";

import { usePlayer } from "@/components/player/PlayerProvider";
import type { PlayerSong } from "@/lib/utils";

interface PlayButtonProps {
  song: PlayerSong;
  queue?: PlayerSong[];
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PlayButton({ song, queue, size = "md", className = "" }: PlayButtonProps) {
  const { playSong } = usePlayer();

  const dims = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  }[size];

  const icon = {
    sm: 14,
    md: 16,
    lg: 22,
  }[size];

  return (
    <button
      onClick={() => playSong(song, queue)}
      aria-label={`播放 ${song.title}`}
      className={`group grid ${dims} place-items-center rounded-full border border-gold/60 bg-gold/15 text-gold-light transition hover:scale-105 hover:bg-gold/30 glow-gold ${className}`}
    >
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill="currentColor"
        className="translate-x-[1px]"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>
  );
}
