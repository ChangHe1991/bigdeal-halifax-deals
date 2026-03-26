import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(req) {
  const supabase = getSupabaseAdmin();
  const body = await req.json().catch(() => ({}));
  const { userId, contentId } = body || {};
  if (!userId || !contentId) return NextResponse.json({ error: "Missing userId/contentId" }, { status: 400 });

  const { data: existing } = await supabase
    .from("likes")
    .select("content_id")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .maybeSingle();

  if (existing) {
    await supabase.from("likes").delete().eq("user_id", userId).eq("content_id", contentId);
  } else {
    await supabase.from("likes").insert({ user_id: userId, content_id: contentId });
  }

  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("content_id", contentId);

  return NextResponse.json({ ok: true, like_count: count || 0 });
}

