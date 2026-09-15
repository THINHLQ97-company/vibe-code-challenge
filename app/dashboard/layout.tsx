import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { AppShell, type NavItem } from "@/components/app-shell";
import {
  HouseIcon,
  CalendarIcon,
  NotepadIcon,
  RocketIcon,
  MegaphoneIcon,
  ClipboardTextIcon,
  ChartBarIcon,
  TrophyIcon,
} from "@/components/dsvh/icons";

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Tổng quan", icon: <HouseIcon size={17} /> },
  { href: "/dashboard/lich", label: "Lịch cuộc thi", icon: <CalendarIcon size={17} /> },
  { href: "/dashboard/register", label: "Đề tài của tôi", icon: <NotepadIcon size={17} /> },
  { href: "/dashboard/build", label: "Nộp bài", icon: <RocketIcon size={17} /> },
  { href: "/dashboard/share", label: "Chia sẻ & lan tỏa", icon: <MegaphoneIcon size={17} /> },
  { href: "/dashboard/survey", label: "Phiếu trải nghiệm", icon: <ClipboardTextIcon size={17} /> },
  { href: "/dashboard/results", label: "Kết quả", icon: <ChartBarIcon size={17} /> },
  { href: "/dashboard/leaderboard", label: "Bảng xếp hạng", icon: <TrophyIcon size={17} /> },
];

export const metadata = { title: { default: "Khu thí sinh", template: "%s · Khu thí sinh" } };

const BOARD_LABEL: Record<string, string> = {
  ky_thuat: "Bảng Kỹ thuật",
  van_phong: "Bảng Văn phòng",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session
    ? await db.query.users.findFirst({ where: eq(users.id, session.userId) })
    : null;

  /**
   * Khu thí sinh CHỈ dành cho thí sinh.
   *
   * Thể lệ chốt giám khảo không dự thi, và route đăng ký đề tài đã chặn đúng theo vai trò — nhưng
   * trang thì vẫn mở, nên giám khảo và ban tổ chức thấy màn hình mời "Đăng ký đề tài" rồi bấm vào
   * mới ăn lỗi. Mời người ta làm một việc họ không được phép làm là lỗi thiết kế, không phải tiện.
   *
   * Vai trò đọc từ database chứ không từ cookie — cookie có thể ghi vai trò cũ tới bảy ngày.
   */
  if (user && user.role !== "candidate") redirect("/admin");

  return (
    <AppShell
      brandTitle="Vibe Code Challenge"
      brandSubtitle="Khu vực thí sinh"
      brandTone="teal"
      nav={NAV}
      avatarUrl={user?.avatarUrl}
      profileHref="/dashboard/profile"
      userName={user?.name ?? ""}
      userMeta={`${user?.department ?? ""} · ${user?.board ? BOARD_LABEL[user.board] : ""}`}
    >
      {children}
    </AppShell>
  );
}
