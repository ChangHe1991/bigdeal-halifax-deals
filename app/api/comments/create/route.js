import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(req) {
  const supabase = getSupabaseAdmin();
  const body = await req.json().catch(() => ({}));
  const { userId, userDisplayName, contentId, text } = body || {};

  if (!userId || !userDisplayName || !contentId || !text) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const safeText = String(text).slice(0, 500);
  if (!safeText.trim()) return NextResponse.json({ error: "Empty text" }, { status: 400 });

  await supabase
    .from("users")
    .upsert({ id: userId, display_name: String(userDisplayName).trim() }, { onConflict: "id" });

  const { error } = await supabase.from("comments").insert({
    content_id: contentId,
    user_id: userId,
    user_display_name: String(userDisplayName).trim(),
    text: safeText
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

