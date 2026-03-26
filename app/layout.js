import "./globals.css";

export const metadata = {
  title: "BigDeal Halifax",
  description: "Halifax 折扣分享平台（原型）"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

