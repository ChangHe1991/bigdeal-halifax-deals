import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { computeQuality, isReasonableDeal } from "../../../lib/quality";

export async function GET(req) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") || 20), 50);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("contents")
    .select(
      "id, store, area, address, discount, expires_at, created_at, quality, field_count"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ items: [], error: error.message }, { status: 400 });

  const ids = (data || []).map((d) => d.id);
  if (ids.length === 0) return NextResponse.json({ items: [] });

  // Quick counts (prototype-friendly)
  const [favCounts, likeCounts, shareCounts] = await Promise.all([
    supabase.from("favorites").select("content_id").in("content_id", ids),
    supabase.from("likes").select("content_id").in("content_id", ids),
    supabase.from("share_opens").select("content_id").in("content_id", ids)
  ]);

  const favMap = new Map((favCounts.data || []).map((r) => [r.content_id, 1]));
  // Above would overwrite; count properly:
  const favCountMap = new Map();
  for (const r of favCounts.data || []) favCountMap.set(r.content_id, (favCountMap.get(r.content_id) || 0) + 1);
  const likeCountMap = new Map();
  for (const r of likeCounts.data || []) likeCountMap.set(r.content_id, (likeCountMap.get(r.content_id) || 0) + 1);
  const shareCountMap = new Map();
  for (const r of shareCounts.data || []) shareCountMap.set(r.content_id, (shareCountMap.get(r.content_id) || 0) + 1);

  const items = (data || []).map((d) => ({
    id: d.id,
    store: d.store,
    area: d.area,
    address: d.address,
    discount: d.discount,
    expires_at: d.expires_at,
    created_at: d.created_at,
    share_open_count: shareCountMap.get(d.id) || 0,
    favorite_count: favCountMap.get(d.id) || 0,
    like_count: likeCountMap.get(d.id) || 0
  }));

  return NextResponse.json({ items });
}

export async function POST(req) {
  const supabase = getSupabaseAdmin();
  const body = await req.json().catch(() => ({}));

  const {
    authorId,
    authorDisplayName,
    store,
    area,
    address,
    totalPrice,
    unitPrice,
    discount,
    expiresAt,
    note,
    quality,
    fieldCount
  } = body || {};

  if (!authorId || !authorDisplayName || !store || !area || !address) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // 保存/更新用户（供后续评论/收藏计数）
  await supabase
    .from("users")
    .upsert({ id: authorId, display_name: String(authorDisplayName) }, { onConflict: "id" });

  const parsed = {
    totalPrice: totalPrice === null || totalPrice === undefined ? null : Number(totalPrice),
    unitPrice: unitPrice === null || unitPrice === undefined ? null : Number(unitPrice),
    discount: discount === null || discount === undefined ? null : Number(discount),
    expiresAt: expiresAt ? String(expiresAt) : null
  };

  // 允许原型先“手填”，质量根据字段齐全计算
  const computed = computeQuality({
    totalPrice: parsed.totalPrice,
    unitPrice: parsed.unitPrice,
    discount: parsed.discount,
    expiresAt: parsed.expiresAt,
    editFactor: 1
  });

  // 原型：如果字段不合理，也仍可保存（但 quality=0），避免新手被拦截
  const reasonable = isReasonableDeal(parsed);
  const finalQuality = reasonable ? computed.quality : 0;

  const payload = {
    author_id: authorId,
    author_display_name: String(authorDisplayName),
    store: String(store),
    area: String(area),
    address: String(address),
    total_price: parsed.totalPrice,
    unit_price: parsed.unitPrice,
    discount: parsed.discount,
    expires_at: parsed.expiresAt,
    note: note ? String(note) : null,
    field_count: computed.fieldCount,
    quality: finalQuality
  };

  const { data, error } = await supabase.from("contents").insert(payload).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id });
}

