import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  getCurrentSubmissionForUser,
  listCohortByBoard,
  listWaveCohortByBoard,
  startOfWeek,
  endOfWeek,
} from "@/lib/db/queries/submissions";
import { formatDateVN } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Note } from "@/components/dsvh/ui/data/Note";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { Button } from "@/components/dsvh/ui/Button";
import { TrophyIcon } from "@/components/dsvh/icons";
import Link from "next/link";
import { LeaderboardTable } from "./leaderboard-table";
import { getWave } from "@/lib/db/queries/waves";

const BOARD_LABEL = { ky_thuat: "Bảng Kỹ thuật", van_phong: "Bảng Văn phòng" } as const;

export const metadata = { title: "Bảng điểm đợt" };

export default async function LeaderboardPage() {
  const session = await getSession();
  const me = session ? await db.query.users.findFirst({ where: eq(users.id, session.userId) }) : null;
  const board = me?.board ?? "van_phong";

  /**
   * Đợt của CHÍNH BẠN.
   *
   * Ưu tiên ĐỢT THI (wave) mà bài của bạn thuộc về. Bài tạo trước khi có cơ chế wave thì rơi về
   * cách cũ — cắt theo tuần lịch của ngày đề tài được duyệt.
   */
  const mine = session ? await getCurrentSubmissionForUser(session.userId) : null;
  const myWave = mine?.waveId != null ? await getWave(mine.waveId) : null;

  /**
   * CHƯA đăng ký đề tài thì chưa thuộc đợt nào — nói thẳng như vậy.
   *
   * Bản trước rơi về cách cắt theo tuần lịch và lấy TUẦN HIỆN TẠI làm mốc, nên người chưa nộp gì
   * vẫn thấy một dòng như "được duyệt đề tài trong tuần 14/09 – 20/09" — một khoảng thời gian
   * chẳng liên quan gì tới họ, kèm bảng trống. Vừa sai vừa làm người đọc tưởng mình đã lỡ mất một
   * đợt nào đó.
   */
  if (!mine) {
    return (
      <PageShell title="Bảng điểm đợt của bạn">
        <Card>
          <Empty
            icon={<TrophyIcon size={40} />}
            title="Bạn chưa thuộc đợt thi nào"
            description="Bảng điểm so bạn với những người cùng đợt. Đăng ký đề tài trước — đăng ký xong bạn vào đợt đang mở và bảng này sẽ hiện những người thi cùng."
            action={
              <Link href="/dashboard/register">
                <Button variant="solid">Đăng ký đề tài</Button>
              </Link>
            }
          />
        </Card>
      </PageShell>
    );
  }

  const anchor = mine?.approvedAt ?? new Date();
  const weekStart = startOfWeek(anchor);
  const weekEnd = endOfWeek(anchor);

  const rows = myWave
    ? await listWaveCohortByBoard(myWave.id, board)
    : await listCohortByBoard(board, weekStart, weekEnd);
  const published = rows.filter((r) => r.publishedAt);

  return (
    <PageShell
      title="Bảng điểm đợt của bạn"
      subtitle={
        myWave
          ? `Những người cùng ${BOARD_LABEL[board].toLowerCase()} trong ${myWave.name}${myWave.bonusPoints > 0 ? ` · đợt này được cộng ${myWave.bonusPoints} điểm thưởng đăng ký sớm` : ""}`
          : // Bài tạo TRƯỚC khi có cơ chế đợt thi — chưa gắn đợt nào, vẫn so theo tuần duyệt như cũ.
            `Những người cùng ${BOARD_LABEL[board].toLowerCase()} được duyệt đề tài trong tuần ${formatDateVN(weekStart)} – ${formatDateVN(new Date(weekEnd.getTime() - 86_400_000))}`
      }
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
