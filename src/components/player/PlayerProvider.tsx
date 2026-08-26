"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  coverGradient,
  formatDuration,
  type PlayerSong,
} from "@/lib/utils";

interface PlayerContextValue {
  current: PlayerSong | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  notice: string | null;
  playSong: (song: PlayerSong, queue?: PlayerSong[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (t: number) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function isDemoAudio(url?: string | null): boolean {
  return !!url && url.includes("soundhelix.com");
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<PlayerSong | null>(null);
  const [queue, setQueue] = useState<PlayerSong[]>([]);
  const [idx, setIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [showQueue, setShowQueue] = useState(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashNotice = useCallback((msg: string) => {
    setNotice(msg);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 2600);
  }, []);

  const playSong = useCallback(
    (song: PlayerSong, list?: PlayerSong[]) => {
      if (!song.audioUrl) {
        flashNotice(`「${song.title}」暂无试听源（演示版仅部分金曲可试听）`);
        return;
      }
      const q = list && list.length > 0 ? list : [song];
      const newIdx = q.findIndex((s) => s.id === song.id);
      setQueue(q);
      setIdx(newIdx >= 0 ? newIdx : 0);
      setCurrent(q[newIdx >= 0 ? newIdx : 0]);
      setIsPlaying(true);
    },
    [flashNotice]
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [current]);

  const next = useCallback(() => {
    if (queue.length === 0) return;
    const nextIdx = (idx + 1) % queue.length;
    setIdx(nextIdx);
    setCurrent(queue[nextIdx]);
    setIsPlaying(true);
  }, [queue, idx]);

  const prev = useCallback(() => {
    if (queue.length === 0) return;
    const prevIdx = (idx - 1 + queue.length) % queue.length;
    setIdx(prevIdx);
    setCurrent(queue[prevIdx]);
    setIsPlaying(true);
  }, [queue, idx]);

  const seek = useCallback((t: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = t;
    setCurrentTime(t);
  }, []);

  // 切换 current 时更新 audio 源
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current?.audioUrl) return;
    audio.src = current.audioUrl;
    audio.load();
    audio.play().catch(() => setIsPlaying(false));
  }, [current]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => next();
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [next]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <PlayerContext.Provider
      value={{
        current,
        isPlaying,
        currentTime,
        duration,
        notice,
        playSong,
        toggle,
        next,
        prev,
        seek,
      }}
    >
      <audio ref={audioRef} preload="metadata" />

      {/* 全局提示 */}
      {notice && (
        <div className="fixed left-1/2 top-16 z-[60] max-w-[90vw] -translate-x-1/2 rounded-full border border-neon/40 bg-ink-2/95 px-4 py-2 text-center text-xs text-cream shadow-2xl sm:top-20 sm:px-5 sm:py-2.5 sm:text-sm">
          {notice}
        </div>
      )}

      {/* 底部播放器 */}
      {current && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/25 bg-ink-2/92 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-3 py-2 sm:px-4 sm:py-3">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* 封面 + 信息 */}
              <Link
                href={`/songs/${current.id}`}
                className="flex min-w-0 flex-1 items-center gap-2.5 sm:flex-none sm:gap-3"
              >
                <div
                  className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full sm:h-12 sm:w-12"
                  style={{ background: coverGradient(current.title) }}
                >
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold text-cream/90 sm:h-9 sm:w-9 sm:text-[11px] ${
                      isPlaying ? "animate-spin-slow" : ""
                    }`}
                    style={{
                      background:
                        "repeating-radial-gradient(circle at center, #0c0c14 0 2px, #16161f 2px 4px)",
                    }}
                  >
                    {current.title.slice(0, 1)}
                  </span>
                  <span className="absolute h-2.5 w-2.5 rounded-full bg-gold/90 shadow-[0_0_8px_rgba(217,164,65,.8)] sm:h-3 sm:w-3" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-cream sm:text-sm">
                    {current.title}
                    {isDemoAudio(current.audioUrl) && (
                      <span className="ml-1.5 hidden rounded border border-cyan/40 px-1 py-px text-[10px] text-cyan sm:inline">
                        演示音频
                      </span>
                    )}
                  </p>
                  <p className="truncate text-[11px] text-cream/50 sm:text-xs">{current.artist}</p>
                </div>
              </Link>

              {/* 控制区 */}
              <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-1 sm:items-center">
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={prev}
                    aria-label="上一首"
                    className="text-cream/60 transition hover:text-gold-light"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="sm:h-5 sm:w-5">
                      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                    </svg>
                  </button>
                  <button
                    onClick={toggle}
                    aria-label={isPlaying ? "暂停" : "播放"}
                    className="grid h-9 w-9 place-items-center rounded-full border border-gold/50 bg-gold/15 text-gold-light transition hover:scale-105 hover:bg-gold/25 glow-gold sm:h-11 sm:w-11"
                  >
                    {isPlaying ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="sm:h-[18px] sm:w-[18px]">
                        <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="sm:h-[18px] sm:w-[18px]">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={next}
                    aria-label="下一首"
                    className="text-cream/60 transition hover:text-gold-light"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="sm:h-5 sm:w-5">
                      <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowQueue((v) => !v)}
                    aria-label="播放列表"
                    className={`hidden text-xs transition sm:block ${
                      showQueue ? "text-gold-light" : "text-cream/60 hover:text-gold-light"
                    }`}
                  >
                    {queue.length}首
                  </button>
                </div>

                {/* 大屏进度条 */}
                <div className="hidden w-full items-center gap-2 text-[10px] text-cream/50 sm:flex">
                  <span className="w-9 text-right">{formatDuration(Math.floor(currentTime))}</span>
                  <button
                    className="group relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = (e.clientX - rect.left) / rect.width;
                      seek(ratio * duration);
                    }}
                    aria-label="拖动进度"
                  >
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold to-neon"
                      style={{ width: `${progress}%` }}
                    />
                  </button>
                  <span className="w-9">{formatDuration(Math.floor(duration))}</span>
                </div>
              </div>
            </div>

            {/* 小屏进度条 - 铺满整行 */}
            <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-cream/50 sm:hidden">
              <span className="tabular-nums">{formatDuration(Math.floor(currentTime))}</span>
              <button
                className="group relative h-1 flex-1 overflow-hidden rounded-full bg-white/10"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = (e.clientX - rect.left) / rect.width;
                  seek(ratio * duration);
                }}
                aria-label="拖动进度"
              >
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold to-neon"
                  style={{ width: `${progress}%` }}
                />
              </button>
              <span className="tabular-nums">{formatDuration(Math.floor(duration))}</span>
            </div>
          </div>

          {/* 播放列表展开 */}
          {showQueue && queue.length > 0 && (
            <div className="border-t border-white/5 bg-ink-3/95">
              <ul className="mx-auto max-w-6xl px-3 py-2 sm:px-4">
                {queue.map((s, i) => (
                  <li key={s.id}>
                    <button
                      onClick={() => {
                        setIdx(i);
                        setCurrent(s);
                        setIsPlaying(true);
                      }}
                      className={`flex w-full items-center gap-3 rounded px-2 py-1.5 text-left text-sm transition hover:bg-white/5 ${
                        i === idx ? "text-gold-light" : "text-cream/70"
                      }`}
                    >
                      <span className="w-5 shrink-0 text-right text-xs text-cream/40">{i + 1}</span>
                      <span className="truncate">{s.title}</span>
                      <span className="ml-auto shrink-0 truncate pl-3 text-xs text-cream/40">{s.artist}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {children}
    </PlayerContext.Provider>
  );
}
