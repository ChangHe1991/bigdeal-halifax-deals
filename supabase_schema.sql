-- Halifax 折扣分享原型（v0.2）- Supabase 表结构
-- 使用场景：v0.2 先跑通分享链路（OG 预览卡 + 内容详情 + 收藏/点赞/评论 + 分享打开计数）

-- 需要 pgcrypto 用于 gen_random_uuid()（Supabase 通常已启用）
create extension if not exists pgcrypto;

-- users：匿名用户 + 显示名
create table if not exists public.users (
  id uuid primary key,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- contents：折扣内容（由用户拍照/手填创建）
create table if not exists public.contents (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete cascade,
  author_display_name text not null,

  store text not null,
  area text not null,
  address text not null,

  total_price numeric,
  unit_price numeric,
  discount numeric,
  expires_at date,

  note text,
  field_count int not null default 0,
  quality numeric not null default 0,

  created_at timestamptz not null default now()
);

create index if not exists idx_contents_created_at on public.contents(created_at desc);

-- favorites：私有收藏（用户私有清单）
create table if not exists public.favorites (
  user_id uuid not null references public.users(id) on delete cascade,
  content_id uuid not null references public.contents(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

-- likes：点赞热度
create table if not exists public.likes (
  user_id uuid not null references public.users(id) on delete cascade,
  content_id uuid not null references public.contents(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

-- comments：评论热度
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  user_display_name text not null,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_comments_content_id_created_at on public.comments(content_id, created_at desc);

-- share_opens：分享打开统计
-- 去重：同一个 viewer 对同一 content 只算一次（unique(viewer_id, content_id)）
create table if not exists public.share_opens (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  sharer_id uuid references public.users(id) on delete set null,
  viewer_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (viewer_id, content_id)
);

create index if not exists idx_share_opens_content_id on public.share_opens(content_id);

