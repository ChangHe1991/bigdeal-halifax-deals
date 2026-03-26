# BigDeal Halifax（原型 v0.2）

这个原型用于验证你的核心链路：
`拍照/手填折扣 -> 生成微信可预览分享链接（OG） -> 别人打开详情页 -> 计入“分享打开热度” -> 可收藏/点赞/评论`

> 当前 v0.2：先用“手动字段”完成流程；后续接 OCR 自动填充即可（不影响分享卡与热度链路）。

## 1. 准备：Supabase 建库
1. 新建一个 Supabase project（免费即可）
2. 在 SQL Editor 里执行：`supabase_schema.sql`
3. 记录环境变量：
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`（用于服务端写入）

## 2. 本地运行（建议）
需要本机安装 Node.js（含 npm）。

```bash
cd /Users/hxg/Desktop/BigDeal
npm install
npm run dev
```

然后在浏览器打开 `http://localhost:3000`。

## 3. 本地环境变量
在本机创建 `.env.local`（或在 Vercel 配置环境变量），至少需要：
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> Vercel 部署后，把 `NEXT_PUBLIC_BASE_URL` 换成你的线上域名（例如 `https://bigdeal.vercel.app`）。

## 4. Vercel 一键部署
1. 把本目录连接到 Vercel（GitHub 或直接上传）
2. 在 Vercel Project 的 Environment Variables 配置：
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_BASE_URL`（你的线上域名）
3. 部署成功后，打开首页上传折扣，再复制详情页“微信分享链接”，发到群里观察预览卡是否正常显示。

## 5. 分享卡（OG）实现方式
- 分享链接中会携带 `og*` 参数（store/discount/expiresAt/地址等）
- 详情页使用 `generateMetadata` 生成 `og:image` 指向：`/og?store=...&discount=...`
- 你需要重点验证两点：
  1. 微信聊天里预览卡是否显示正确的折扣信息
  2. 别人点开详情页后，“分享打开热度”是否增长

## 6. 下一步（你明确想做的方向）
- 接入 OCR：从拍照自动提取 totalPrice/unitPrice/discount/expiresAt，并填入表单
- 完整的激励体系落地：Level/Rank/徽章/排行榜（仍然坚持低成本、避免现金补贴）

