import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { AppShell, type NavItem } from "@/components/app-shell";

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/topics", label: "Duyệt đề tài", icon: "✅" },
  { href: "/admin/scoring", label: "Chấm điểm & feedback", icon: "🤖" },
  { href: "/admin/security", label: "An toàn (CP4)", icon: "🛡️" },
  { href: "/admin/posts", label: "Bài đăng & lan tỏa", icon: "📣" },
  { href: "/admin/appeals", label: "Phản biện", icon: "⚖️" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session
    ? await db.query.users.findFirst({ where: eq(users.id, session.userId) })
    : null;

  return (
    <AppShell
      brand="BTC · Vibe Code Challenge"
      subtitle="Ban tổ chức"
      nav={NAV}
      userLine={`${user?.name ?? ""} · ${user?.role ?? ""}`}
    >
      {children}
    </AppShell>
  );
}
