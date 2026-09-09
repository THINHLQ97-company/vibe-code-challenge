import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";

const BOARD_LABEL: Record<string, string> = {
  ky_thuat: "Bảng Kỹ thuật",
  van_phong: "Bảng Văn phòng",
};

export default async function DashboardPage() {
  const session = await getSession();
  const user = session
    ? await db.query.users.findFirst({ where: eq(users.id, session.userId) })
    : null;

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-page font-bold text-ink">Tổng quan</h1>
          <LogoutButton />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Xin chào, {user?.name ?? user?.email}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-body text-ink-2">
            <div>
              Email: <span className="text-ink">{user?.email}</span>
            </div>
            <div>
              Phòng: <span className="text-ink">{user?.department}</span> ·{" "}
              {user?.board && <Badge variant="secondary">{BOARD_LABEL[user.board]}</Badge>}
            </div>
            <div className="mt-2 text-caption text-ink-3">
              Đăng ký đề tài, theo dõi tiến độ và nộp bài sẽ có ở các bước tiếp theo (Step 4+
              trong docs/PLAN.md).
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
