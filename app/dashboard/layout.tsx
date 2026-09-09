import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { AppShell, type NavItem } from "@/components/app-shell";

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Tổng quan", icon: "🏠" },
  { href: "/dashboard/register", label: "Đề tài của tôi", icon: "📝" },
  { href: "/dashboard/build", label: "Nộp bài", icon: "🧩" },
  { href: "/dashboard/share", label: "Chia sẻ & lan tỏa", icon: "📣" },
  { href: "/dashboard/survey", label: "Phiếu trải nghiệm", icon: "📋" },
  { href: "/dashboard/results", label: "Kết quả", icon: "📊" },
  { href: "/dashboard/leaderboard", label: "Bảng xếp hạng", icon: "🏆" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session
    ? await db.query.users.findFirst({ where: eq(users.id, session.userId) })
    : null;

  return (
    <AppShell
      brand="Vibe Code Challenge"
      subtitle="Thí sinh · Mắt Bão"
      nav={NAV}
      userLine={`${user?.name ?? ""} · ${user?.department ?? ""}`}
    >
      {children}
    </AppShell>
  );
}
