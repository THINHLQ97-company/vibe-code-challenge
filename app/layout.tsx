import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/** Luật #12 (DSVH): MỘT font duy nhất — Inter, tự host qua next/font. KHÔNG font-mono. */
const inter = Inter({ subsets: ["latin", "vietnamese"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Matbao Vibe Code Challenge",
  description: "Cuộc thi Vibe Coding nội bộ Mắt Bão",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
