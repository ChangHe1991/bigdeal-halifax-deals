import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(req) {
  const supabase = getSupabaseAdmin();
  const body = await req.json().catch(() => ({}));
  const { userId, contentId } = body || {};
  if (!userId || !contentId) return NextResponse.json({ error: "Missing userId/contentId" }, { status: 400 });

  // upsert-toggle: check exists then delete/insert
  const { data: existing } = await supabase
    .from("favorites")
    .select("content_id")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("user_id", userId).eq("content_id", contentId);
  } else {
    await supabase.from("favorites").insert({ user_id: userId, content_id: contentId });
  }

  const { count } = await supabase
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("content_id", contentId);

  return NextResponse.json({ ok: true, favorite_count: count || 0 });
}

