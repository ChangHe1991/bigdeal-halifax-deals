import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import DealClient from "./DealClient";

function baseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    `http://localhost:${process.env.PORT || 3000}`
  );
}

async function fetchContentWithCounts(id) {
  const supabase = getSupabaseAdmin();

  const { data: content, error: contentErr } = await supabase
    .from("contents")
    .select(
      "id, author_id, author_display_name, store, area, address, total_price, unit_price, discount, expires_at, note, created_at"
    )
    .eq("id", id)
    .single();

  if (contentErr || !content) return null;

  const [{ count: favCount }, { count: likeCount }, { count: shareCount }, { data: comments }] =
    await Promise.all([
      supabase.from("favorites").select("id", { count: "exact", head: true }).eq("content_id", id),
      supabase.from("likes").select("id", { count: "exact", head: true }).eq("content_id", id),
      supabase.from("share_opens").select("id", { count: "exact", head: true }).eq("content_id", id),
      supabase
        .from("comments")
        .select("user_display_name, text, created_at")
        .eq("content_id", id)
        .order("created_at", { ascending: false })
        .limit(20)
    ]);

  return {
    ...content,
    favorite_count: favCount || 0,
    like_count: likeCount || 0,
    share_open_count: shareCount || 0,
    comments: comments || []
  };
}

export async function generateMetadata({ params, searchParams }) {
  const contentId = params.id;

  // 如果分享链接带了 OG 参数，就优先用它们（避免 OG 生成再依赖数据库）
  const store = searchParams?.ogStore || null;
  const discount = searchParams?.ogDiscount || null;
  const expiresAt = searchParams?.ogExpiresAt || null;
  const totalPrice = searchParams?.ogTotalPrice || null;
  const unitPrice = searchParams?.ogUnitPrice || null;
  const area = searchParams?.ogArea || null;
  const address = searchParams?.ogAddress || null;

  let meta = { store, discount, expiresAt, totalPrice, unitPrice, area, address };

  const hasAnyOg = Object.values(meta).some((v) => v !== null && v !== undefined && String(v).trim() !== "");
  if (!hasAnyOg) {
    const data = await fetchContentWithCounts(contentId);
    if (data) {
      meta = {
        store: data.store,
        discount: data.discount,
        expiresAt: data.expires_at,
        totalPrice: data.total_price,
        unitPrice: data.unit_price,
        area: data.area,
        address: data.address
      };
    }
  }

  const search = new URLSearchParams();
  if (meta.store) search.set("store", String(meta.store));
  if (meta.discount !== null && meta.discount !== undefined) search.set("discount", String(meta.discount));
  if (meta.expiresAt) search.set("expiresAt", String(meta.expiresAt));
  if (meta.totalPrice !== null && meta.totalPrice !== undefined) search.set("totalPrice", String(meta.totalPrice));
  if (meta.unitPrice !== null && meta.unitPrice !== undefined) search.set("unitPrice", String(meta.unitPrice));
  if (meta.area) search.set("area", String(meta.area));
  if (meta.address) search.set("address", String(meta.address));

  const url = `${baseUrl()}/og?${search.toString()}`;

  return {
    title: meta.store ? `${meta.store} 折扣` : "Halifax 折扣分享",
    description: meta.expiresAt ? `截止：${meta.expiresAt}` : "Halifax 折扣分享",
    openGraph: {
      title: meta.store ? `${meta.store} 折扣` : "Halifax 折扣分享",
      description: meta.expiresAt ? `截止：${meta.expiresAt}` : "Halifax 折扣分享",
      type: "website",
      images: [{ url, width: 1200, height: 630, alt: "Deal card" }]
    }
  };
}

export default async function DealPage({ params, searchParams }) {
  const data = await fetchContentWithCounts(params.id);
  if (!data) {
    return (
      <div className="wrap">
        <div className="card">
          <div style={{ fontWeight: 800, marginBottom: 6 }}>内容不存在</div>
          <a href="/">返回首页</a>
        </div>
      </div>
    );
  }

  return (
    <DealClient
      content={data}
      // 搜索参数用于“分享成功统计归因”
      sharedBy={searchParams?.sharedBy || null}
    />
  );
}

