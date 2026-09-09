import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users, submissions } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminPage() {
  const session = await getSession();
  const user = session
    ? await db.query.users.findFirst({ where: eq(users.id, session.userId) })
    : null;
  const allSubmissions = await db.query.submissions.findMany();

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-page font-bold text-ink">Dashboard BTC/BGK</h1>
          <LogoutButton />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Xin chào, {user?.name ?? user?.email} <Badge>{user?.role}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-body text-ink-2">
            <div>Tổng số bài đăng ký: {allSubmissions.length}</div>
            <ul className="mt-2 flex flex-col gap-1">
              {allSubmissions.map((s) => (
                <li key={s.id} className="flex items-center gap-2 text-caption">
                  <Badge variant="secondary">{s.registrationStatus}</Badge>
                  {s.productName}
                </li>
              ))}
            </ul>
            <div className="mt-2 text-caption text-ink-3">
              Duyệt đề tài, chấm điểm, công bố kết quả sẽ có ở các bước tiếp theo (Step 4+
              trong docs/PLAN.md).
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
