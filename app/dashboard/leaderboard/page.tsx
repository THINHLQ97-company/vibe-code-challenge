import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { listPublishedByBoard } from "@/lib/db/queries/submissions";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Note } from "@/components/dsvh/ui/data/Note";
import { LeaderboardTable } from "./leaderboard-table";

const BOARD_LABEL = { ky_thuat: "Bảng Kỹ thuật", van_phong: "Bảng Văn phòng" } as const;

export default async function LeaderboardPage() {
  const session = await getSession();
  const me = session ? await db.query.users.findFirst({ where: eq(users.id, session.userId) }) : null;
  const board = me?.board ?? "van_phong";
  const rows = await listPublishedByBoard(board);

  return (
    <PageShell
      title="Bảng xếp hạng"
      subtitle="Chỉ tính các bài đã được BTC công bố điểm"
      action={<Badge tone="accent">{BOARD_LABEL[board]}</Badge>}
    >
      <Card>
        <CardHeader
          title={`${rows.length} bài đã công bố`}
          subtitle="Hai bảng thi xếp hạng riêng — bạn chỉ so với người cùng xuất phát điểm"
        />
        <LeaderboardTable
          rows={rows.map((r, i) => ({ ...r, rank: i + 1, isMe: r.userName === me?.name }))}
        />
        <Note className="mt-3">
          Giải tháng trao riêng cho từng bảng; cuối 4 tháng mới chọn thêm Quán quân chung giữa hai
          bảng.
        </Note>
      </Card>
    </PageShell>
  );
}
