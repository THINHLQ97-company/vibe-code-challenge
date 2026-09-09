import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { AppShell, type NavItem } from "@/components/app-shell";
import {
  ChartBarIcon,
  CheckCircleIcon,
  RobotIcon,
  ShieldCheckIcon,
  MegaphoneIcon,
  ScalesIcon,
  UsersThreeIcon,
} from "@/components/dsvh/icons";

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <ChartBarIcon size={17} /> },
  { href: "/admin/topics", label: "Duyệt đề tài", icon: <CheckCircleIcon size={17} /> },
  { href: "/admin/scoring", label: "Chấm điểm", icon: <RobotIcon size={17} /> },
  { href: "/admin/security", label: "Cổng an toàn", icon: <ShieldCheckIcon size={17} /> },
  { href: "/admin/posts", label: "Bài đăng & lan tỏa", icon: <MegaphoneIcon size={17} /> },
  { href: "/admin/appeals", label: "Phản biện", icon: <ScalesIcon size={17} /> },
  { href: "/admin/candidates", label: "Thí sinh", icon: <UsersThreeIcon size={17} /> },
];

const ROLE_LABEL: Record<string, string> = { admin: "Ban tổ chức", judge: "Giám khảo" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session
    ? await db.query.users.findFirst({ where: eq(users.id, session.userId) })
    : null;

  return (
    <AppShell
      brandTitle="Vibe Code Challenge"
      brandSubtitle="Ban tổ chức"
      nav={NAV}
      userName={user?.name ?? ""}
      userMeta={ROLE_LABEL[user?.role ?? ""] ?? ""}
    >
      {children}
    </AppShell>
  );
}
