import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(req) {
  const supabase = getSupabaseAdmin();
  const body = await req.json().catch(() => ({}));
  const { viewerId, viewerDisplayName, contentId, sharerId } = body || {};

  if (!viewerId || !contentId) {
    return NextResponse.json({ error: "Missing viewerId/contentId" }, { status: 400 });
  }

  if (viewerDisplayName) {
    await supabase
      .from("users")
      .upsert({ id: viewerId, display_name: String(viewerDisplayName).trim() }, { onConflict: "id" })
      .catch(() => {});
  } else {
    // Ensure viewer exists (proto)
    await supabase.from("users").upsert({ id: viewerId, display_name: "Anonymous" }, { onConflict: "id" }).catch(() => {});
  }

  const sharerFinal = sharerId || null;
  if (sharerFinal) {
    await supabase
      .from("users")
      .upsert({ id: sharerFinal, display_name: "Sharer" }, { onConflict: "id" })
      .catch(() => {});
  }

  // Dedup: unique(viewer_id, content_id)
  const { error } = await supabase.from("share_opens").insert({
    viewer_id: viewerId,
    sharer_id: sharerFinal,
    content_id: contentId
  });

  if (error) {
    // If unique constraint hits, we can ignore
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}

