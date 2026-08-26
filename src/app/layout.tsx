import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { PlayerProvider } from "@/components/player/PlayerProvider";

export const metadata: Metadata = {
  title: {
    default: "港乐时光机 · 回到金曲年代",
    template: "%s · 港乐时光机",
  },
  description:
    "穿梭半个世纪的香港流行音乐：年代大事记、经典歌手、传世金曲，一键回到港乐黄金年代。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-full bg-ink text-cream antialiased" suppressHydrationWarning>
        <PlayerProvider>
          <Nav />
          <main className="pb-36">{children}</main>
        </PlayerProvider>
      </body>
    </html>
  );
}
