"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  basePath: string;
  defaultValue?: string;
  placeholder?: string;
}

export function SearchBar({ basePath, defaultValue = "", placeholder }: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `${basePath}?q=${encodeURIComponent(q)}` : basePath);
  };

  return (
    <form onSubmit={submit} className="relative w-full max-w-md">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? "搜索…"}
        className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-16 text-sm text-cream placeholder:text-cream/30 outline-none transition focus:border-gold/60 focus:bg-white/10"
      />
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/40"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-gold/20 px-3 py-1.5 text-xs text-gold-light transition hover:bg-gold/35"
      >
        搜索
      </button>
    </form>
  );
}
