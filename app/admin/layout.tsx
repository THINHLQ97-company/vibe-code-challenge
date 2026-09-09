import { eq } from "drizzle-orm";
import { LayoutDashboard, CheckSquare, Bot, ShieldAlert, Megaphone, Scale } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { AppShell, type NavItem } from "@/components/app-shell";

const ICON_PROPS = { size: 16, strokeWidth: 2 } as const;
const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard {...ICON_PROPS} /> },
  { href: "/admin/topics", label: "Duyệt đề tài", icon: <CheckSquare {...ICON_PROPS} /> },
  { href: "/admin/scoring", label: "Chấm điểm & feedback", icon: <Bot {...ICON_PROPS} /> },
  { href: "/admin/security", label: "An toàn (CP4)", icon: <ShieldAlert {...ICON_PROPS} /> },
  { href: "/admin/posts", label: "Bài đăng & lan tỏa", icon: <Megaphone {...ICON_PROPS} /> },
  { href: "/admin/appeals", label: "Phản biện", icon: <Scale {...ICON_PROPS} /> },
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
