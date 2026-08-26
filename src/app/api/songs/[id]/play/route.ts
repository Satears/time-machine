import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, ctx: RouteContext<"/api/songs/[id]/play">) {
  const { id } = await ctx.params;
  try {
    const updated = await prisma.song.update({
      where: { id },
      data: { plays: { increment: 1 } },
      select: { plays: true },
    });
    return Response.json({ ok: true, plays: updated.plays });
  } catch {
    return Response.json({ ok: false, error: "歌曲不存在" }, { status: 404 });
  }
}
