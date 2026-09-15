import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
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
  GearIcon,
  CalendarIcon,
  UsersThreeIcon,
} from "@/components/dsvh/icons";

/**
 * Mục "Cấu hình" CHỈ dành cho admin — công tắc trong đó đóng/mở đường đăng nhập của cả hệ thống,
 * không phải việc của giám khảo. Route bên trong cũng tự kiểm quyền, menu chỉ là lớp che.
 */
const NAV_BASE: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <ChartBarIcon size={17} /> },
  { href: "/admin/topics", label: "Duyệt đề tài", icon: <CheckCircleIcon size={17} /> },
  { href: "/admin/scoring", label: "Chấm điểm", icon: <RobotIcon size={17} /> },
  { href: "/admin/security", label: "Cổng an toàn", icon: <ShieldCheckIcon size={17} /> },
  { href: "/admin/posts", label: "Bài đăng & lan tỏa", icon: <MegaphoneIcon size={17} /> },
  { href: "/admin/appeals", label: "Phản biện", icon: <ScalesIcon size={17} /> },
];

const NAV_ADMIN_ONLY: NavItem[] = [
  { href: "/admin/users", label: "Người dùng", icon: <UsersThreeIcon size={17} /> },
  { href: "/admin/waves", label: "Đợt thi", icon: <CalendarIcon size={17} /> },
  { href: "/admin/settings", label: "Cấu hình", icon: <GearIcon size={17} /> },
];

export const metadata = { title: { default: "Ban tổ chức", template: "%s · Ban tổ chức" } };

const ROLE_LABEL: Record<string, string> = { admin: "Ban tổ chức", judge: "Giám khảo" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session
    ? await db.query.users.findFirst({ where: eq(users.id, session.userId) })
    : null;

  /**
   * Phân quyền THẬT nằm ở đây, không ở middleware — đây là chỗ đầu tiên trong chuỗi render đọc
   * được database, nên vai trò lấy ra luôn là vai trò hiện tại chứ không phải bản chụp trong
   * cookie. Thí sinh lạc vào thì đưa về khu của họ.
   */
  if (!user || user.role === "candidate") redirect("/dashboard");

  return (
    <AppShell
      brandTitle="Vibe Code Challenge"
      brandSubtitle="Ban tổ chức"
      brandTone="orange"
      nav={user?.role === "admin" ? [...NAV_BASE, ...NAV_ADMIN_ONLY] : NAV_BASE}
      avatarUrl={user?.avatarUrl}
      profileHref="/admin/profile"
      userName={user?.name ?? ""}
      userMeta={ROLE_LABEL[user?.role ?? ""] ?? ""}
    >
      {children}
    </AppShell>
  );
}
