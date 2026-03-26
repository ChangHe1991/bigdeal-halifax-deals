"use client";

import { useEffect, useMemo, useState } from "react";
import { computeQuality } from "../lib/quality";

function getOrCreateAnonUserId() {
  try {
    const key = "bd_anon_user_id";
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const v = crypto.randomUUID();
    localStorage.setItem(key, v);
    return v;
  } catch {
    // Fallback for environments without crypto.randomUUID
    const key = "bd_anon_user_id";
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const v = String(Date.now()) + "_" + String(Math.random()).slice(2);
    localStorage.setItem(key, v);
    return v;
  }
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status} ${text}`);
  }
  return res.json();
}

export default function HomePage() {
  const [anonUserId, setAnonUserId] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [store, setStore] = useState("Walmart");
  const [area, setArea] = useState("Halifax");
  const [address, setAddress] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [note, setNote] = useState("");

  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  const [list, setList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const [weeklyTop, setWeeklyTop] = useState([]);
  const [loadingWeekly, setLoadingWeekly] = useState(true);

  useEffect(() => {
    const id = getOrCreateAnonUserId();
    setAnonUserId(id);
    const savedName = localStorage.getItem("bd_display_name") || "";
    setDisplayName(savedName);
  }, []);

  async function refreshList() {
    setLoadingList(true);
    try {
      const data = await fetchJson("/api/contents?limit=20", { method: "GET" });
      setList(Array.isArray(data.items) ? data.items : []);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    refreshList().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function loadWeekly() {
      setLoadingWeekly(true);
      try {
        const data = await fetchJson("/api/boards/weekly?days=7", { method: "GET" });
        setWeeklyTop(Array.isArray(data?.top) ? data.top : []);
      } catch {
        setWeeklyTop([]);
      } finally {
        setLoadingWeekly(false);
      }
    }
    loadWeekly().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = useMemo(() => {
    // 这里只做宽松校验：字段由 server 再严格校验
    return anonUserId && displayName.trim().length > 0 && address.trim().length > 0;
  }, [anonUserId, displayName, address]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!canSubmit) {
      setErr("请先填写昵称和地址。");
      return;
    }
    setUploading(true);
    try {
      localStorage.setItem("bd_display_name", displayName.trim());
      // input[type=date] returns YYYY-MM-DD，避免时区导致日期偏移
      const expires = expiresAt ? String(expiresAt) : "";
      const computed = computeQuality({
        totalPrice,
        unitPrice,
        discount,
        expiresAt: expires,
        editFactor: 1
      });

      const payload = {
        authorId: anonUserId,
        authorDisplayName: displayName.trim(),
        store,
        area,
        address: address.trim(),
        totalPrice: totalPrice === "" ? null : Number(totalPrice),
        unitPrice: unitPrice === "" ? null : Number(unitPrice),
        discount: discount === "" ? null : Number(discount),
        expiresAt: expires ? expires : null,
        note: note.trim(),
        quality: computed.quality,
        fieldCount: computed.fieldCount
      };

      const created = await fetchJson("/api/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // reset minimal fields
      setNote("");
      setTotalPrice("");
      setUnitPrice("");
      setDiscount("");
      setExpiresAt("");
      await refreshList();

      if (created?.id) {
        window.location.href = `/c/${created.id}`;
      }
    } catch (ex) {
      setErr(ex?.message || "提交失败");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="wrap">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: "0 0 6px 0", fontSize: 20 }}>Halifax 折扣分享（原型 v0.2）</h1>
          <div className="hint">
            你要的链路：拍图/手填 -> 生成可分享链接 -> 详情页显示“群预览卡”（OG）
          </div>
        </div>
        <div className="card" style={{ minWidth: 280 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>快捷入口</div>
          <div className="hint">本原型先用手动字段，后续接 OCR 自动填充。</div>
          <div className="hint">分享卡会包含 store/折扣/截止日期。</div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="grid">
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>上传/分享一个折扣</div>
          <form onSubmit={onSubmit} className="grid">
            <div className="field">
              <div className="label">昵称（显示在详情页）</div>
              <input
                className="input"
                value={displayName}
                onChange={(ev) => setDisplayName(ev.target.value)}
                placeholder="例如：小李"
                maxLength={20}
              />
            </div>
            <div className="field">
              <div className="label">商家</div>
              <select className="select" value={store} onChange={(ev) => setStore(ev.target.value)}>
                <option>Superstore</option>
                <option>Sobeys</option>
                <option>Walmart</option>
                <option>Costco</option>
              </select>
            </div>

            <div className="field">
              <div className="label">区域</div>
              <select className="select" value={area} onChange={(ev) => setArea(ev.target.value)}>
                <option>Halifax</option>
                <option>Bedford</option>
              </select>
            </div>

            <div className="field">
              <div className="label">地址（用于他人跟买）</div>
              <input
                className="input"
                value={address}
                onChange={(ev) => setAddress(ev.target.value)}
                placeholder="例如：Halifax / Quinpool Rd"
                maxLength={80}
              />
            </div>

            <div className="field">
              <div className="label">总价（可选）</div>
              <input className="input" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} placeholder="例如：18.99" />
            </div>
            <div className="field">
              <div className="label">单价（可选）</div>
              <input className="input" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="例如：3.80" />
            </div>
            <div className="field">
              <div className="label">折扣（必填建议）</div>
              <input className="input" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="例如：0.25（25% off）或 5（$5 off）" />
              <div className="hint">原型把折扣当作数字展示（暂不区分“折扣额/折扣率”）。</div>
            </div>
            <div className="field">
              <div className="label">截止日期（必填建议）</div>
              <input className="input" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>

            <div className="field" style={{ minWidth: "100%" }}>
              <div className="label">备注/评论（可选）</div>
              <textarea
                className="textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="例如：今天上午还有货，限量..."
              />
            </div>

            {err ? (
              <div style={{ color: "#b91c1c", fontSize: 13, marginTop: 6 }}>
                {err}
              </div>
            ) : null}

            <div style={{ minWidth: "100%" }} className="row">
              <button className="primary" type="submit" disabled={uploading || !canSubmit}>
                {uploading ? "提交中..." : "保存并生成分享卡"}
              </button>
              <div className="hint">保存后可以在详情页复制微信分享链接。</div>
            </div>
          </form>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>本周周榜 Top3（分享打开为主）</div>
          {loadingWeekly ? (
            <div className="hint">加载中...</div>
          ) : weeklyTop.length === 0 ? (
            <div className="hint">本周还没有足够数据。</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              {weeklyTop.map((u, idx) => (
                <div
                  key={u.userId}
                  className="card"
                  style={{
                    padding: 12,
                    background: "#fff",
                    borderColor: idx === 0 ? "#2563eb" : undefined
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontWeight: 900 }}>
                      {idx + 1}. {u.displayName}
                    </div>
                    <div style={{ fontWeight: 800, color: "#0f172a" }}>{u.score}</div>
                  </div>
                  <div className="hint" style={{ marginTop: 6 }}>
                    本周内容数：{u.dealCount}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ fontWeight: 700, marginBottom: 10 }}>精选/最新折扣（20条）</div>
          {loadingList ? (
            <div className="hint">加载中...</div>
          ) : list.length === 0 ? (
            <div className="hint">还没有内容，先发布一条吧。</div>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: "1fr", gap: 10 }}>
              {list.map((it) => (
                <a key={it.id} className="card" style={{ padding: 12 }} href={`/c/${it.id}`}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>
                    {it.store} - 折扣 {it.discount}
                  </div>
                  <div className="hint">截止：{it.expires_at || "—"}</div>
                  <div className="hint">地点：{it.area} / {it.address}</div>
                  <div className="hint">热度：分享打开 {it.share_open_count || 0} / 收藏 {it.favorite_count || 0} / 点赞 {it.like_count || 0}</div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

