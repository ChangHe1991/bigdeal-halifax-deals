"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function getOrCreateAnonUserId() {
  try {
    const key = "bd_anon_user_id";
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const v = crypto.randomUUID();
    localStorage.setItem(key, v);
    return v;
  } catch {
    const key = "bd_anon_user_id";
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const v = String(Date.now()) + "_" + String(Math.random()).slice(2);
    localStorage.setItem(key, v);
    return v;
  }
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status} ${t}`);
  }
  return res.json();
}

function formatMaybeNumber(v) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  // 只保留两位小数，避免显示 0.199999
  return n.toFixed(2).replace(/\.00$/, "");
}

export default function DealClient({ content, sharedBy }) {
  const sp = useSearchParams();
  const sharedByFromQuery = sp.get("sharedBy");
  const [viewerId, setViewerId] = useState(null);

  const [displayName, setDisplayName] = useState("");
  const [savingOpen, setSavingOpen] = useState(false);

  const [favoriteCount, setFavoriteCount] = useState(content.favorite_count || 0);
  const [likeCount, setLikeCount] = useState(content.like_count || 0);
  const [shareOpenCount, setShareOpenCount] = useState(content.share_open_count || 0);

  const [favBusy, setFavBusy] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  const [comments, setComments] = useState(content.comments || []);
  const [commentText, setCommentText] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem("bd_display_name") || "";
    setDisplayName(savedName);
  }, []);

  useEffect(() => {
    // 在客户端环境生成匿名用户 id（避免首屏渲染时 window 不存在）
    setViewerId(getOrCreateAnonUserId());
  }, []);

  // 记录“分享打开”事件：依赖分享链接参数 sharedBy（你选 A：打开落地页计入）
  useEffect(() => {
    if (!viewerId) return;
    const sharerId = sharedByFromQuery || sharedBy || null;
    const viewerDisplayName = displayName || "Anonymous";
    if (!sharerId) return;

    let cancelled = false;
    async function track() {
      try {
        setSavingOpen(true);
        await postJson("/api/track/open", {
          viewerId,
          viewerDisplayName,
          contentId: content.id,
          sharerId
        });
        // 由后续刷新/列表刷新展示真实热度；本地不强行 +1，避免唯一去重导致的偏差
        const res = await fetch(`/api/contents/${content.id}`);
        const data = await res.json().catch(() => null);
        if (data) {
          setShareOpenCount(data.share_open_count || 0);
        }
      } catch {
        // 忽略失败（原型级容错）
      } finally {
        if (!cancelled) setSavingOpen(false);
      }
    }
    track();
    return () => {
      cancelled = true;
    };
  }, [viewerId, content.id, displayName, sharedByFromQuery, sharedBy]);

  function buildShareLink() {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    const u = new URL(origin + `/c/${content.id}`);
    // 归因：是谁分享了这条内容
    if (content.author_id) u.searchParams.set("sharedBy", content.author_id);

    // OG 参数：让微信抓取预览卡时无需依赖数据库（更稳）
    if (content.store) u.searchParams.set("ogStore", content.store);
    if (content.discount !== null && content.discount !== undefined) u.searchParams.set("ogDiscount", String(content.discount));
    if (content.expires_at) u.searchParams.set("ogExpiresAt", String(content.expires_at));
    if (content.total_price !== null && content.total_price !== undefined) u.searchParams.set("ogTotalPrice", String(content.total_price));
    if (content.unit_price !== null && content.unit_price !== undefined) u.searchParams.set("ogUnitPrice", String(content.unit_price));
    if (content.area) u.searchParams.set("ogArea", content.area);
    if (content.address) u.searchParams.set("ogAddress", content.address);
    return u.toString();
  }

  async function copyShare() {
    const shareLink = buildShareLink();
    try {
      await navigator.clipboard.writeText(shareLink);
      alert("分享链接已复制：到微信群里发送即可看到预览卡。");
    } catch {
      prompt("请复制分享链接：", shareLink);
    }
  }

  async function onToggleFavorite() {
    if (favBusy) return;
    if (!viewerId) return;
    setFavBusy(true);
    try {
      const { favorite_count } = await postJson("/api/favorites/toggle", {
        userId: viewerId,
        contentId: content.id
      });
      setFavoriteCount(favorite_count || 0);
    } finally {
      setFavBusy(false);
    }
  }

  async function onToggleLike() {
    if (likeBusy) return;
    if (!viewerId) return;
    setLikeBusy(true);
    try {
      const { like_count } = await postJson("/api/likes/toggle", {
        userId: viewerId,
        contentId: content.id
      });
      setLikeCount(like_count || 0);
    } finally {
      setLikeBusy(false);
    }
  }

  async function onAddComment() {
    if (commentBusy) return;
    const text = commentText.trim();
    if (!text) return;
    if (!viewerId) return;
    setCommentBusy(true);
    try {
      const name = (displayName || "Anonymous").trim();
      await postJson("/api/comments/create", {
        userId: viewerId,
        userDisplayName: name,
        contentId: content.id,
        text
      });
      setCommentText("");
      // 简单刷新：重新拉一次 comments
      const res = await fetch(`/api/contents/${content.id}`);
      const data = await res.json();
      setComments(data.comments || []);
    } finally {
      setCommentBusy(false);
    }
  }

  return (
    <div className="wrap">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: "0 0 6px 0", fontSize: 20 }}>折扣详情</h1>
          <div className="hint">
            {content.store} · {content.area}
          </div>
        </div>
        <div className="card" style={{ minWidth: 320 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>分享卡（微信预览）</div>
          <div className="hint" style={{ marginBottom: 10 }}>
            点击复制链接后，发到群里即可在聊天里看到预览卡。
          </div>
          <button className="primary" onClick={copyShare} disabled={savingOpen}>
            {savingOpen ? "正在统计分享打开..." : "复制微信分享链接"}
          </button>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="card">
        <div style={{ fontWeight: 900, fontSize: 26, marginBottom: 8 }}>
          {content.store} 折扣：{content.discount ?? "—"}
        </div>
        <div className="hint" style={{ marginBottom: 10 }}>
          截止：{content.expires_at || "—"} · 地点：{content.area} / {content.address}
        </div>
        <div className="row" style={{ marginBottom: 12 }}>
          <div className="hint">总价：{formatMaybeNumber(content.total_price)}</div>
          <div className="hint">单价：{formatMaybeNumber(content.unit_price)}</div>
        </div>
        {content.note ? (
          <div className="hint" style={{ marginBottom: 12 }}>
            备注：{content.note}
          </div>
        ) : null}

        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="row">
            <button className="ghost" onClick={onToggleFavorite} disabled={favBusy}>
              收藏（私有）{favoriteCount ? ` · ${favoriteCount}` : ""}
            </button>
            <button className="ghost" onClick={onToggleLike} disabled={likeBusy}>
              点赞 · {likeCount}
            </button>
          </div>
          <div className="hint">
            分享打开热度：{shareOpenCount}
          </div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="grid">
        <div className="card">
          <div style={{ fontWeight: 800, marginBottom: 10 }}>评论（热度因子）</div>
          <div className="hint" style={{ marginBottom: 10 }}>
            原型：评论不做“是否有用”判断，只作为热度参考。
          </div>

          <div className="row">
            <input
              className="input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="写点建议：还有货吗？具体多少？"
              maxLength={240}
              style={{ flex: 1 }}
            />
            <button className="primary" onClick={onAddComment} disabled={commentBusy || !commentText.trim()}>
              {commentBusy ? "发送中..." : "发送"}
            </button>
          </div>

          <div style={{ height: 14 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {comments.length === 0 ? (
              <div className="hint">暂无评论。</div>
            ) : (
              comments.map((c, idx) => (
                <div key={c.id || idx} className="card" style={{ padding: 12, background: "#fff" }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{c.user_display_name}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.5 }}>{c.text}</div>
                  <div className="hint" style={{ marginTop: 6 }}>
                    {c.created_at ? String(c.created_at).slice(0, 19).replace("T", " ") : ""}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 800, marginBottom: 10 }}>这条内容的热度</div>
          <div className="hint">分享打开（来自微信点开）：{shareOpenCount}</div>
          <div className="hint" style={{ marginTop: 6 }}>收藏（私有）：{favoriteCount}</div>
          <div className="hint" style={{ marginTop: 6 }}>点赞：{likeCount}</div>
          <div className="hint" style={{ marginTop: 6 }}>评论数：{comments.length}</div>

          <div style={{ height: 12 }} />
          <div className="hint">
            提示：你可以把分享链接发到群里，看看“分享打开热度”是否上升，再决定要不要接入积分/等级/榜单更完整的体系。
          </div>
        </div>
      </div>
    </div>
  );
}

