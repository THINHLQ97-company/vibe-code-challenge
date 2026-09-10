import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  getCurrentSubmissionForUser,
  listCohortByBoard,
  startOfWeek,
  endOfWeek,
} from "@/lib/db/queries/submissions";
import { formatDateVN } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Note } from "@/components/dsvh/ui/data/Note";
import { LeaderboardTable } from "./leaderboard-table";

const BOARD_LABEL = { ky_thuat: "Bảng Kỹ thuật", van_phong: "Bảng Văn phòng" } as const;

export const metadata = { title: "Bảng điểm đợt" };

export default async function LeaderboardPage() {
  const session = await getSession();
  const me = session ? await db.query.users.findFirst({ where: eq(users.id, session.userId) }) : null;
  const board = me?.board ?? "van_phong";

  // Đợt của CHÍNH BẠN: tuần đề tài của bạn được duyệt. Chưa được duyệt thì lấy tuần hiện tại để
  // vẫn xem được đợt đang chạy.
  const mine = session ? await getCurrentSubmissionForUser(session.userId) : null;
  const anchor = mine?.approvedAt ?? new Date();
  const weekStart = startOfWeek(anchor);
  const weekEnd = endOfWeek(anchor);

  const rows = await listCohortByBoard(board, weekStart, weekEnd);
  const published = rows.filter((r) => r.publishedAt);

  return (
    <PageShell
      title="Bảng điểm đợt của bạn"
      subtitle={`Những người cùng ${BOARD_LABEL[board].toLowerCase()} được duyệt đề tài trong tuần ${formatDateVN(weekStart)} – ${formatDateVN(new Date(weekEnd.getTime() - 86_400_000))}`}
      action={<Badge tone="accent">{BOARD_LABEL[board]}</Badge>}
    >
      <Card>
        <CardHeader
          title={`${rows.length} bài trong đợt · ${published.length} đã công bố điểm`}
          subtitle="Sắp theo điểm từ cao xuống thấp. Bảng này không xếp hạng — thứ hạng và giải do BTC chốt cuối tháng."
        />
        <LeaderboardTable
          rows={rows.map((r) => ({
            id: r.id,
            productName: r.productName,
            userName: r.userName ?? "",
            department: r.department ?? "",
            finalScore: r.finalScore,
            published: !!r.publishedAt,
            isMe: r.userId === session?.userId,
          }))}
        />
        <Note className="mt-3">
          Bạn thi cùng đợt với những người này: cùng hạn nộp, cùng khung đăng bài, cùng kỳ đếm tương
          tác 7 ngày — nên điểm lan tỏa so trung vị cũng tính trong nhóm này.
        </Note>
      </Card>
    </PageShell>
  );
}
