import { coverGradient } from "@/lib/utils";

interface CoverProps {
  seed: string;
  /** 传入固定像素尺寸；若不传，则由 className 控制宽高（响应式） */
  size?: number;
  className?: string;
  rounded?: "full" | "lg";
}

/** 程序化黑胶封面：稳定配色 + 首字，无需外部图片 */
export function Cover({
  seed,
  size,
  className = "",
  rounded = "lg",
}: CoverProps) {
  const hasFixedSize = typeof size === "number" && size > 0;
  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden border border-white/10 ${hasFixedSize ? "" : "h-full w-full"} ${className}`}
      style={{
        ...(hasFixedSize ? { width: size, height: size } : { containerType: "size" }),
        background: coverGradient(seed),
        borderRadius: rounded === "full" ? "50%" : 12,
      }}
    >
      <span
        className="font-calli font-bold text-cream/90"
        style={{ fontSize: hasFixedSize ? size! * 0.34 : "34cqi" }}
      >
        {seed.slice(0, 1)}
      </span>
      <span
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25), transparent 60%)",
        }}
      />
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_18px_rgba(0,0,0,0.55)]" />
    </div>
  );
}
