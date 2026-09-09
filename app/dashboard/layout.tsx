import { eq } from "drizzle-orm";
import { Home, FileText, UploadCloud, Megaphone, ClipboardList, BarChart3, Trophy } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { AppShell, type NavItem } from "@/components/app-shell";

const ICON_PROPS = { size: 16, strokeWidth: 2 } as const;
const NAV: NavItem[] = [
  { href: "/dashboard", label: "Tổng quan", icon: <Home {...ICON_PROPS} /> },
  { href: "/dashboard/register", label: "Đề tài của tôi", icon: <FileText {...ICON_PROPS} /> },
  { href: "/dashboard/build", label: "Nộp bài", icon: <UploadCloud {...ICON_PROPS} /> },
  { href: "/dashboard/share", label: "Chia sẻ & lan tỏa", icon: <Megaphone {...ICON_PROPS} /> },
  { href: "/dashboard/survey", label: "Phiếu trải nghiệm", icon: <ClipboardList {...ICON_PROPS} /> },
  { href: "/dashboard/results", label: "Kết quả", icon: <BarChart3 {...ICON_PROPS} /> },
  { href: "/dashboard/leaderboard", label: "Bảng xếp hạng", icon: <Trophy {...ICON_PROPS} /> },
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
