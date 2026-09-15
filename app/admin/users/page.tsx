import { redirect } from "next/navigation";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { getSession } from "@/lib/auth/session";
import { listManagedUsers } from "@/lib/db/queries/users";
import { formatDateTimeVN } from "@/lib/datetime";
import { UsersManager, type UserRow } from "./users-manager";

export const metadata = { title: "Người dùng" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();
  // Lớp chặn thật nằm ở các route API; đây chỉ để giám khảo lỡ gõ địa chỉ không thấy trang trống.
  if (!session || session.role !== "admin") redirect("/admin");

  const users = await listManagedUsers();
  const rows: UserRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatarUrl: u.avatarUrl,
    department: u.department,
    board: u.board,
    role: u.role,
    loginMethod: u.loginMethod,
    lastLoginAt: u.lastLoginAt ? formatDateTimeVN(u.lastLoginAt) : null,
    submissionCount: u.submissionCount,
  }));

  return (
    <PageShell
      title="Người dùng"
      subtitle="Mời giám khảo, đổi vai trò, và xem ai đã thật sự đăng nhập"
    >
      <UsersManager initial={rows} meId={session.userId} />
    </PageShell>
  );
}
