import { ImageResponse } from "next/og";

export const runtime = "edge";

function sanitize(s, max = 60) {
  const x = String(s ?? "");
  return x.length > max ? x.slice(0, max - 1) + "…" : x;
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const store = sanitize(searchParams.get("store"), 24) || "Halifax Deals";
  const discount = sanitize(searchParams.get("discount"), 26) || "折扣";
  const expires = sanitize(searchParams.get("expiresAt"), 18) || "";
  const area = sanitize(searchParams.get("area"), 18) || "";
  const address = sanitize(searchParams.get("address"), 42) || "";
  const totalPrice = searchParams.get("totalPrice") || "";
  const unitPrice = searchParams.get("unitPrice") || "";

  const subtitleBits = [];
  if (area) subtitleBits.push(area);
  if (address) subtitleBits.push(address);

  const subtitle = subtitleBits.join(" / ");
  const lines = [];
  if (totalPrice) lines.push(`总价：${totalPrice}`);
  if (unitPrice) lines.push(`单价：${unitPrice}`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px",
          backgroundColor: "#ffffff",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial'
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ fontSize: 44, fontWeight: 800, color: "#0f172a" }}>{store}</div>
          <div style={{ fontSize: 56, fontWeight: 900, color: "#2563eb" }}>
            折扣：{discount}
          </div>
          {subtitle ? (
            <div style={{ fontSize: 34, fontWeight: 600, color: "#334155" }}>{subtitle}</div>
          ) : null}
          {expires ? (
            <div style={{ fontSize: 34, fontWeight: 700, color: "#0f172a" }}>
              截止日期：{expires}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {lines.length ? (
            <div style={{ fontSize: 30, fontWeight: 700, color: "#334155" }}>
              {lines.map((t, idx) => (
                <div key={idx}>{t}</div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 30, fontWeight: 700, color: "#334155" }}>拍照上传，App 帮你读取关键信息</div>
          )}
          <div style={{ fontSize: 26, fontWeight: 600, color: "#64748b" }}>
            Halifax 华人群折扣分享（原型）
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}

