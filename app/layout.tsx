import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/** Luật #12 (DSVH): MỘT font duy nhất — Inter, tự host qua next/font. KHÔNG font-mono. */
const inter = Inter({ subsets: ["latin", "vietnamese"], display: "swap", variable: "--font-inter" });

/**
 * `template` để mỗi khu tự đặt phần đầu tiêu đề, đuôi thì dùng chung — người mở nhiều tab biết
 * ngay tab nào là khu thí sinh, tab nào là khu BTC, thay vì ba tab trùng tên.
 */
export const metadata: Metadata = {
  title: {
    default: "Vibe Code Challenge · Mắt Bão",
    template: "%s · Vibe Code Challenge",
  },
  description:
    "Cuộc thi Vibe Coding nội bộ Mắt Bão — tự làm một sản phẩm có database thật và đưa lên Vibe Host.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
