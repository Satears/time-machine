"use client";

import { useRouter } from "next/navigation";

const OPTIONS = [
  { value: "plays", label: "点播最多" },
  { value: "likes", label: "点赞最多" },
  { value: "year_desc", label: "最新发行" },
  { value: "year_asc", label: "最早发行" },
  { value: "title", label: "按歌名" },
];

interface SortSelectProps {
  basePath: string;
  current: string;
  params: string;
}

export function SortSelect({ basePath, current, params }: SortSelectProps) {
  const router = useRouter();

  return (
    <select
      value={OPTIONS.some((o) => o.value === current) ? current : "plays"}
      onChange={(e) => {
        const url = `${basePath}?${params}${params ? "&" : ""}sort=${e.target.value}`;
        router.push(url);
      }}
      className="rounded-full border border-white/10 bg-ink-3 px-4 py-2.5 text-sm text-cream outline-none transition focus:border-gold/60"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
