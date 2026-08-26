import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, ctx: RouteContext<"/api/songs/[id]/comments">) {
  const { id } = await ctx.params;
  const comments = await prisma.comment.findMany({
    where: { songId: id },
    orderBy: { createdAt: "desc" },
  });
  return Response.json({ ok: true, comments });
}

export async function POST(req: Request, ctx: RouteContext<"/api/songs/[id]/comments">) {
  const { id } = await ctx.params;
  let body: { nickname?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "请求格式错误" }, { status: 400 });
  }

  const nickname = (body.nickname ?? "").trim().slice(0, 20);
  const content = (body.content ?? "").trim().slice(0, 500);

  if (!nickname || !content) {
    return Response.json({ ok: false, error: "昵称与评论内容不能为空" }, { status: 400 });
  }

  try {
    const comment = await prisma.comment.create({
      data: { songId: id, nickname, content },
    });
    return Response.json({ ok: true, comment }, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "歌曲不存在" }, { status: 404 });
  }
}
