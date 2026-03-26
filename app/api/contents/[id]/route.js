import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function GET(req, { params }) {
  const supabase = getSupabaseAdmin();
  const { id } = params;

  const { data: content, error } = await supabase
    .from("contents")
    .select("id, author_id, author_display_name, store, area, address, total_price, unit_price, discount, expires_at, note, created_at")
    .eq("id", id)
    .single();

  if (error || !content) {
    return NextResponse.json({ error: error?.message || "Not found" }, { status: 404 });
  }

  const [favCounts, likeCounts, shareCounts, comments] = await Promise.all([
    supabase.from("favorites").select("*", { count: "exact", head: true }).eq("content_id", id),
    supabase.from("likes").select("*", { count: "exact", head: true }).eq("content_id", id),
    supabase.from("share_opens").select("*", { count: "exact", head: true }).eq("content_id", id),
    supabase
      .from("comments")
      .select("id, user_display_name, text, created_at")
      .eq("content_id", id)
      .order("created_at", { ascending: false })
      .limit(50)
  ]);

  return NextResponse.json({
    content,
    favorite_count: favCounts.count || 0,
    like_count: likeCounts.count || 0,
    share_open_count: shareCounts.count || 0,
    comments: comments || []
  });
}

