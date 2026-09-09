import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matbao Vibe Code Challenge",
  description: "Cuộc thi Vibe Coding nội bộ Mắt Bão",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
