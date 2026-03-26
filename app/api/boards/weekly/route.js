import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

function toNumber(v) {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function computeTimeDecay(ageHours) {
  return 1 / (1 + ageHours / 24);
}

export async function GET(req) {
  const url = new URL(req.url);
  const days = Math.max(1, Math.min(Number(url.searchParams.get("days") || 7), 14));

  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const startIso = start.toISOString();

  const supabase = getSupabaseAdmin();

  // 1) 拿到周期内的内容（参与作者周榜计算）
  const { data: contents, error: contentsErr } = await supabase
    .from("contents")
    .select("id, author_id, author_display_name, quality, created_at")
    .gte("created_at", startIso);

  if (contentsErr) {
    return NextResponse.json({ error: contentsErr.message || "Failed" }, { status: 400 });
  }

  const contentIds = (contents || []).map((c) => c.id);
  if (contentIds.length === 0) {
    return NextResponse.json({ top: [], startAt: startIso, endAt: end.toISOString() });
  }

  // 2) 周期内的热度事件计数（分享打开优先）
  const [shareRows, favRows, likeRows, commentRows] = await Promise.all([
    supabase
      .from("share_opens")
      .select("content_id")
      .in("content_id", contentIds)
      .gte("created_at", startIso),
    supabase
      .from("favorites")
      .select("content_id")
      .in("content_id", contentIds)
      .gte("created_at", startIso),
    supabase
      .from("likes")
      .select("content_id")
      .in("content_id", contentIds)
      .gte("created_at", startIso),
    supabase
      .from("comments")
      .select("content_id")
      .in("content_id", contentIds)
      .gte("created_at", startIso)
  ]);

  const countBy = (rows) => {
    const m = new Map();
    for (const r of rows?.data || []) {
      const id = r.content_id;
      m.set(id, (m.get(id) || 0) + 1);
    }
    return m;
  };

  const shareCountMap = countBy(shareRows);
  const favoriteCountMap = countBy(favRows);
  const likeCountMap = countBy(likeRows);
  const commentCountMap = countBy(commentRows);

  // 3) 计算内容分 -> 聚合到用户分
  const userScoreMap = new Map();
  const userMetaMap = new Map();

  for (const c of contents || []) {
    const quality = toNumber(c.quality);
    const share = shareCountMap.get(c.id) || 0;
    const fav = favoriteCountMap.get(c.id) || 0;
    const like = likeCountMap.get(c.id) || 0;
    const comment = commentCountMap.get(c.id) || 0;

    // Heat：分享打开 > 收藏 > 点赞 > 评论
    const heatScore = 3.0 * share + 1.5 * fav + 0.5 * like + 0.2 * comment;

    // 时间衰减：越新越高（48小时内更明显）
    const createdAt = c.created_at ? new Date(c.created_at) : null;
    const ageHours = createdAt ? Math.max(0, (end.getTime() - createdAt.getTime()) / (1000 * 60 * 60)) : 0;
    const timeDecay = computeTimeDecay(ageHours);

    const contentScore = (0.65 * quality + 0.35 * heatScore) * timeDecay;

    const userId = c.author_id;
    userScoreMap.set(userId, (userScoreMap.get(userId) || 0) + contentScore);
    userMetaMap.set(userId, {
      userId,
      displayName: c.author_display_name || "Anonymous",
      dealCount: (userMetaMap.get(userId)?.dealCount || 0) + 1
    });
  }

  const top = [...userScoreMap.entries()]
    .map(([userId, score]) => ({ ...userMetaMap.get(userId), score: Math.round(score * 10) / 10 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return NextResponse.json({
    top,
    startAt: startIso,
    endAt: end.toISOString(),
    scoring: {
      windowDays: days,
      note: "share_opens 优先；收藏/点赞/评论为热度补充；并按发布时间做时间衰减"
    }
  });
}

