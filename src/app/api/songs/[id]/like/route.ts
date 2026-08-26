import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, ctx: RouteContext<"/api/songs/[id]/like">) {
  const { id } = await ctx.params;
  try {
    const updated = await prisma.song.update({
      where: { id },
      data: { likes: { increment: 1 } },
      select: { likes: true },
    });
    return Response.json({ ok: true, likes: updated.likes });
  } catch {
    return Response.json({ ok: false, error: "歌曲不存在" }, { status: 404 });
  }
}
