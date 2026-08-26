/** 将秒数格式化为 mm:ss */
export function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** 由字符串生成稳定的 0-360 色相，用于程序化封面配色 */
export function hashHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) % 360;
  }
  return h;
}

/** 程序化黑胶封面渐变（无外部图片依赖，配色稳定） */
export function coverGradient(seed: string): string {
  const hue = hashHue(seed);
  const hue2 = (hue + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue} 55% 22%) 0%, hsl(${hue2} 60% 12%) 60%, #0a0a12 100%)`;
}

export interface PlayerSong {
  id: string;
  title: string;
  artist: string;
  cover?: string | null;
  audioUrl?: string | null;
  year?: number | null;
  duration?: number | null;
}

/** 播放次数格式化 */
export function formatPlays(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

/** 年代标签 */
export function decadeOf(year: number): number {
  return Math.floor(year / 10) * 10;
}

export function decadeLabel(decade: number): string {
  return `${decade}s`;
}
