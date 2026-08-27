"use client";

import { useEffect, useState } from "react";
import { usePlayer, isDemoAudio } from "@/components/player/PlayerProvider";
import { formatPlays, type PlayerSong } from "@/lib/utils";

interface SongActionsProps {
  song: PlayerSong;
  initialLikes: number;
  plays: number;
}

const FAV_KEY = "glsj-favs";

function readFavFromStorage(songId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const favs: string[] = JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]");
    return favs.includes(songId);
  } catch {
    return false;
  }
}

export function SongActions({ song, initialLikes, plays }: SongActionsProps) {
  const { playSong, isPlaying, current, toggle } = usePlayer();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [fav, setFav] = useState<boolean>(() => readFavFromStorage(song.id));

  const isCurrent = current?.id === song.id;

  // song 切换时重新读取收藏状态（微任务避免同步 setState 导致的级联渲染告警）
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setFav(readFavFromStorage(song.id));
    });
    return () => {
      cancelled = true;
    };
  }, [song.id]);

  const toggleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await fetch(`/api/songs/${song.id}/like`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setLikes(data.likes);
        setLiked(true);
      }
    } finally {
      setLiking(false);
    }
  };

  const toggleFav = () => {
    try {
      const favs: string[] = JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]");
      const next = favs.includes(song.id)
        ? favs.filter((x) => x !== song.id)
        : [...favs, song.id];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      setFav(next.includes(song.id));
    } catch {
      /* ignore */
    }
  };

  const externalUrl = `https://music.163.com/#/search/m/?s=${encodeURIComponent(
    `${song.title} ${song.artist}`
  )}`;

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {/* 播放/暂停 */}
      <button
        onClick={() => {
          if (isCurrent && isPlaying) {
            toggle();
          } else if (isCurrent) {
            toggle();
          } else {
            playSong(song);
          }
        }}
        className="flex items-center gap-2 rounded-full border border-gold bg-gold/20 px-5 py-2.5 text-xs font-medium text-gold-light transition hover:scale-105 hover:bg-gold/35 glow-gold sm:px-6 sm:py-3 sm:text-sm"
      >
        {isCurrent && isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="sm:h-4 sm:w-4">
            <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="sm:h-4 sm:w-4">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
        {isCurrent && isPlaying ? "暂停" : isCurrent ? "继续播放" : "播放"}
        {isDemoAudio(song.audioUrl) && (
          <span className="rounded border border-cyan/50 px-1 text-[10px] text-cyan">演示</span>
        )}
      </button>

      {/* 点赞 */}
      <button
        onClick={toggleLike}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-2.5 text-xs transition sm:px-4 sm:py-3 sm:text-sm ${
          liked
            ? "border-neon bg-neon/20 text-neon"
            : "border-white/15 text-cream/70 hover:border-neon/60 hover:text-neon"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="sm:h-4 sm:w-4">
          <path d="M12 21s-6.7-4.3-9.3-8.5C.9 9.6 2.6 6 6 6c2.2 0 3.7 1.2 4.6 2.5h2.8C14.3 7.2 15.8 6 18 6c3.4 0 5.1 3.6 3.3 6.5C18.7 16.7 12 21 12 21z" />
        </svg>
        {likes.toLocaleString()}
      </button>

      {/* 收藏 */}
      <button
        onClick={toggleFav}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-2.5 text-xs transition sm:px-4 sm:py-3 sm:text-sm ${
          fav
            ? "border-gold bg-gold/20 text-gold-light"
            : "border-white/15 text-cream/70 hover:border-gold/60 hover:text-gold-light"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="sm:h-4 sm:w-4">
          <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17l-6.1 3.6 1.4-6.8L2.2 9.1l6.9-.8z" />
        </svg>
        {fav ? "已收藏" : "收藏"}
      </button>

      {/* 去听原曲 */}
      <a
        href={externalUrl}
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-cyan/40 bg-cyan/10 px-3 py-2.5 text-xs text-cyan transition hover:bg-cyan/20 sm:px-4 sm:py-3 sm:text-sm"
      >
        去听原曲 ↗
      </a>

      <span className="w-full text-left text-[11px] text-cream/40 sm:w-auto sm:ml-auto sm:text-xs">
        点播 {formatPlays(plays)}
      </span>
    </div>
  );
}
