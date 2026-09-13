# 港乐时光机 · Cantonese Music Time Machine

> 半个世纪的香港流行音乐，浓缩在一台时光机里。
> 从狮子山下的打拼岁月，到红馆的万人大合唱 —— 选一个年代，按下播放，回到金曲响起的那个晚上。

一个以香港流行音乐（粤语歌）为主题的时间轴式音乐浏览站点，覆盖 1970s–2020s 六个年代，提供年代大事记、金曲库、歌手库、在线试听与乐迷评论。

**在线访问**：<https://www.time-machine.asia>

---

## 功能特性

- **时光隧道** — 按年代（1970s / 1980s / 1990s / 2000s / 2010s / 2020s）浏览，每个年代配大事记时间轴与代表金曲
- **金曲库** — 全部歌曲列表，支持搜索、按年份/点播量排序
- **歌手库** — 歌手档案卡片、详情页及其金曲作品
- **在线播放** — 全局播放器（`PlayerProvider`），跨页面保持播放状态，自动累计播放次数
- **点赞与评论** — 歌曲点赞、乐迷评论区
- **响应式布局** — 适配桌面与移动端

## 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | Next.js 16（App Router） |
| 语言 | TypeScript 5 |
| UI | React 19 + Tailwind CSS 4 |
| 数据库 | PostgreSQL（Supabase） |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| 部署 | Vercel（区域 `hnd1`） |

## 项目结构

```
├── prisma/
│   ├── schema.prisma            # 数据模型（Artist / Song / DecadeEvent / Comment）
│   ├── migrations/              # 数据库迁移
│   ├── seed.ts                  # 种子数据写入脚本
│   └── seed_data.ts             # 种子数据源（歌手、歌曲、年代大事记）
├── src/
│   ├── app/
│   │   ├── page.tsx             # 首页：年代入口 + 点播榜 + 传奇歌手
│   │   ├── tunnel/page.tsx      # 时光隧道（年代大事记 + 年代金曲）
│   │   ├── songs/               # 金曲库列表 / 歌曲详情
│   │   ├── artists/             # 歌手库列表 / 歌手详情
│   │   └── api/songs/[id]/
│   │       ├── play/route.ts    # 播放计数
│   │       ├── like/route.ts    # 点赞
│   │       └── comments/route.ts# 评论读写
│   ├── components/              # 导航、播放器、歌曲行、卡片、搜索、排序等
│   └── lib/
│       ├── prisma.ts            # Prisma 客户端 + 连接池 + 重试封装
│       ├── supabase.ts          # Supabase 客户端（浏览器端 / 服务端）
│       └── utils.ts
├── vercel.json                  # Vercel 构建设置
└── prisma.config.ts             # Prisma 配置（schema 路径、seed 命令）
```

## 快速开始

### 环境要求

- Node.js 20+
- 一个 PostgreSQL 数据库（推荐 Supabase）

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env`：

```dotenv
# Supabase 连接池地址（PgBouncer，端口 6543）— 应用运行时使用
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@<host>:6543/postgres?pgbouncer=true"

# Supabase 直连地址（端口 5432）— 迁移与种子脚本使用
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@<host>:5432/postgres"

# Supabase 项目地址与公开密钥
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"

# 服务端专用密钥（仅在服务端使用，切勿暴露到客户端）
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
```

### 3. 初始化数据库

```bash
npm run db:generate   # 生成 Prisma Client
npm run db:migrate    # 应用数据库迁移
npm run db:seed       # 写入种子数据（会先清空现有数据）
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 <http://localhost:3000> 查看效果。

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | ESLint 检查 |
| `npm run db:generate` | 生成 Prisma Client |
| `npm run db:migrate` | 创建/应用数据库迁移 |
| `npm run db:seed` | 写入种子数据 |

## 数据模型

| 模型 | 说明 | 关键字段 |
| --- | --- | --- |
| `Artist` | 歌手 | `name`、`nameEn`、`bio`、`birthYear`、`debutYear`、`genre` |
| `Song` | 歌曲 | `title`、`album`、`year`、`duration`、`likes`、`plays`、`artistId` |
| `DecadeEvent` | 年代大事记 | `decade`、`year`、`title`、`content` |
| `Comment` | 乐迷评论 | `content`、`nickname`、`songId` |

`Song` 通过 `artistId` 关联 `Artist`（级联删除），`Comment` 通过 `songId` 关联 `Song`（级联删除）。

## 部署

项目部署于 Vercel，推送到 `main` 分支即触发生产部署。

构建命令由 [`vercel.json`](vercel.json) 指定：

```json
{
  "buildCommand": "prisma generate && next build",
  "regions": ["hnd1"]
}
```

部署前请确认 Vercel 项目已配置以下环境变量（Production / Preview）：

`DATABASE_URL`、`DIRECT_URL`、`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`

## 实现要点

**数据库连接稳定性。** 应用运行在 Serverless 环境中，Supabase PgBouncer 会回收空闲连接，导致长期存活的函数命中"僵尸连接"并抛出 `Connection terminated unexpectedly`。为此 [`src/lib/prisma.ts`](src/lib/prisma.ts) 做了两层处理：

- 限制 `pg.Pool` 连接数与空闲超时，配合 `allowExitOnIdle` 主动释放连接
- 提供 `withDbRetry` 封装：识别瞬态连接错误后销毁并重建连接池，再重试一次查询

所有页面与 API 的数据库查询均通过 `withDbRetry` 执行。

**生产环境不使用 `postinstall`。** Vercel 在安装依赖阶段尚未注入环境变量，`prisma generate` 无法读取 `DATABASE_URL` 而失败，因此生成动作统一放在 `buildCommand` 中执行。

## 版权说明

站内数据为演示内容，歌曲试听使用无版权演示音频。音乐作品版权归原版权方所有，本项目仅作技术演示与致敬之用。
