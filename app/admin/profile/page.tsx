import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { ProfileForm } from "@/components/profile-form";
import { DEPARTMENT_OPTIONS } from "@/lib/departments-options";

const BOARD_LABEL: Record<string, string> = {
  ky_thuat: "Bảng Kỹ thuật",
  van_phong: "Bảng Văn phòng",
};
const ROLE_LABEL: Record<string, string> = {
  candidate: "Thí sinh",
  judge: "Giám khảo",
  admin: "Ban tổ chức",
};

export const metadata = { title: "Hồ sơ của tôi" };

export default async function ProfilePage() {
  const session = await getSession();
  const user = session
    ? await db.query.users.findFirst({ where: eq(users.id, session.userId) })
    : null;
  if (!user) notFound();

  return (
    <PageShell
      title="Hồ sơ của tôi"
      subtitle="Ảnh đại diện và mật khẩu do bạn tự quản lý; thông tin nhân sự do BTC quản lý"
    >
      <ProfileForm
        name={user.name ?? ""}
        email={user.email}
        department={user.department ?? ""}
        boardLabel={user.board ? BOARD_LABEL[user.board] : "—"}
        roleLabel={ROLE_LABEL[user.role] ?? user.role}
        avatarUrl={user.avatarUrl}
        canChangePassword={!!user.passwordHash}
        departmentOptions={DEPARTMENT_OPTIONS}
      />
    </PageShell>
  );
}
