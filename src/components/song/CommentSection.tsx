"use client";

import { useState } from "react";

export interface CommentItem {
  id: string;
  nickname: string;
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  songId: string;
  initialComments: CommentItem[];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  return `${d} 天前`;
}

export function CommentSection({ songId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!nickname.trim() || !content.trim()) {
      setError("请填写昵称和留言");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/songs/${songId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, content }),
      });
      const data = await res.json();
      if (data.ok) {
        setComments((prev) => [data.comment, ...prev]);
        setContent("");
      } else {
        setError(data.error ?? "发布失败，请稍后再试");
      }
    } catch {
      setError("网络异常，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <h2 className="mb-5 flex items-center gap-3 font-display text-xl font-bold text-cream sm:mb-6 sm:text-2xl">
        <span className="text-neon">♪</span> 乐迷留言
        <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-normal text-gold-light">
          {comments.length}
        </span>
      </h2>

      {/* 留言表单 */}
      <form
        onSubmit={submit}
        className="mb-6 rounded-2xl border border-white/10 bg-ink-2/60 p-4 sm:mb-8 sm:p-5"
      >
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="你的昵称"
          maxLength={20}
          className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 outline-none transition focus:border-gold/60 sm:px-4 sm:py-2.5"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="分享你对这首歌的记忆与感受……"
          maxLength={500}
          rows={3}
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cream placeholder:text-cream/30 outline-none transition focus:border-gold/60 sm:px-4 sm:py-3"
        />
        {error && <p className="mt-2 text-xs text-neon">{error}</p>}
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-[11px] text-cream/35 sm:text-xs">{content.length}/500</span>
          <button
            type="submit"
            disabled={submitting}
            className="shrink-0 rounded-full border border-gold bg-gold/20 px-5 py-2 text-xs text-gold-light transition hover:bg-gold/35 disabled:opacity-50 sm:px-6 sm:text-sm"
          >
            {submitting ? "发布中…" : "发布留言"}
          </button>
        </div>
      </form>

      {/* 留言列表 */}
      {comments.length === 0 ? (
        <p className="py-8 text-center text-sm text-cream/40">
          还没有留言，来抢沙发，说说你与这首歌的故事。
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {(expanded ? comments : comments.slice(0, 8)).map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-white/8 bg-ink-2/40 p-3 sm:p-4"
            >
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/15 text-xs font-bold text-gold-light">
                  {c.nickname.slice(0, 1)}
                </span>
                <span className="truncate text-sm font-medium text-cream">{c.nickname}</span>
                <span className="ml-auto shrink-0 text-[11px] text-cream/35">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-cream/70">{c.content}</p>
            </li>
          ))}
        </ul>
      )}

      {!expanded && comments.length > 8 && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-4 w-full rounded-full border border-white/10 py-2.5 text-sm text-cream/60 transition hover:border-gold/40 hover:text-gold-light"
        >
          查看全部 {comments.length} 条留言 ↓
        </button>
      )}
    </section>
  );
}
