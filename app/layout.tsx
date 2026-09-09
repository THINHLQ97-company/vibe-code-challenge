import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "matbao-vibe-challenge",
  description: "Mắt Bão project",
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
