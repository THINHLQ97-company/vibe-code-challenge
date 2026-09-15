import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { getActiveSeason } from "@/lib/db/queries/seasons";
import { listWaves } from "@/lib/db/queries/waves";
import { db } from "@/lib/db";
import { postingSlots } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { buildWaveTimeline } from "@/lib/wave-timeline";
import { WaveCalendarButton, type CalendarWave } from "@/components/wave-calendar";
import { periodLabel, periodTimeLabel } from "@/lib/contest-schedule";
import { formatDateVN, formatDeadlineDistance } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Button } from "@/components/dsvh/ui/Button";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { Note } from "@/components/dsvh/ui/data/Note";
import { CalendarIcon, CheckCircleIcon, CircleIcon } from "@/components/dsvh/icons";

export const metadata = { title: "Lịch cuộc thi" };
export const dynamic = "force-dynamic";

/**
 * LỊCH CỦA RIÊNG THÍ SINH.
 *
 * Trang chủ có bảng lịch đủ năm đợt để người chưa đăng ký chọn đợt. Ở đây thì câu hỏi khác hẳn:
 * người đã vào cuộc không quan tâm đợt 4 mở ngày nào, họ cần biết HẠN NỘP CỦA MÌNH, ba lượt chấm
 * của mình và khung giờ đăng bài của mình. Đặt bảng chung vào đây thì họ phải tự dò xem mình thuộc
 * dòng nào rồi đọc ngang — nên trang này dựng thẳng dòng thời gian từ đợt của chính họ.
 */
export default async function SchedulePage() {
  const session = await getSession();
  const submission = session ? await getCurrentSubmissionForUser(session.userId) : null;
  const season = await getActiveSeason();
  const allWaves = season ? await listWaves(season.id) : [];

  const myWave = submission?.waveId
    ? (allWaves.find((w) => w.id === submission.waveId) ?? null)
    : null;

  const mySlot = submission?.postingSlotId
    ? ((await db.query.postingSlots.findFirst({
        where: eq(postingSlots.id, submission.postingSlotId),
      })) ?? null)
    : null;

  if (!myWave) {
    return (
      <PageShell title="Lịch cuộc thi">
        <Card>
          <Empty
            icon={<CalendarIcon size={40} />}
            title="Bạn chưa thuộc đợt thi nào"
            description="Đăng ký đề tài ở một đợt đang mở, lịch riêng của bạn sẽ hiện ở đây: hạn nộp, các lượt chấm và khung giờ đăng bài."
            action={
              <Link href="/dashboard/register">
                <Button variant="solid">Đăng ký đề tài</Button>
              </Link>
            }
          />
        </Card>
        {allWaves.length > 0 && <AllWaves waves={allWaves} />}
      </PageShell>
    );
  }

  const calendarWave: CalendarWave = {
    name: myWave.name,
    registrationOpensAt: myWave.registrationOpensAt.toISOString(),
    registrationClosesAt: myWave.registrationClosesAt.toISOString(),
    phase2OpensAt: myWave.phase2OpensAt?.toISOString() ?? null,
    phase2ClosesAt: myWave.phase2ClosesAt?.toISOString() ?? null,
    judgingDates: myWave.judgingDates,
    postingOpensAt: myWave.postingOpensAt?.toISOString() ?? null,
    postingClosesAt: myWave.postingClosesAt?.toISOString() ?? null,
    completedAt: myWave.completedAt?.toISOString() ?? null,
  };

  const timeline = buildWaveTimeline(
    myWave,
    new Date(),
    mySlot
      ? {
          at: mySlot.startsAt,
          label: `${periodLabel(mySlot.period)} ${formatDateVN(mySlot.startsAt)}, ${periodTimeLabel(mySlot.period)}`,
        }
      : null
  );
  const next = timeline.find((m) => m.state === "current");

  return (
    <PageShell
      title="Lịch cuộc thi"
      subtitle={`${myWave.name} — các mốc của riêng bạn, theo đúng lịch ban tổ chức đã công bố`}
    >
      {next && (
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="text-caption text-ink-3">Mốc kế tiếp</p>
              <p className="mt-0.5 text-title font-semibold text-ink">{next.title}</p>
              <p className="mt-0.5 text-caption text-ink-2">{next.detail}</p>
            </div>
            <Badge tone={next.actor === "thi-sinh" ? "warning" : "neutral"}>
              {next.actor === "thi-sinh" ? "Việc của bạn" : "Ban tổ chức làm"}
            </Badge>
          </div>
          {myWave.phase2ClosesAt && (
            <Note tone="neutral" className="mt-3">
              Hạn nộp sản phẩm của cả {myWave.name} là {formatDateVN(myWave.phase2ClosesAt)} —{" "}
              {formatDeadlineDistance(myWave.phase2ClosesAt)}. Hạn này chung cho mọi người trong
              đợt, không tính riêng theo ngày đề tài của bạn được duyệt.
            </Note>
          )}
        </Card>
      )}

      <Card>
        <CardHeader
          title="Dòng thời gian của bạn"
          subtitle="Mốc đã qua làm mờ, mốc kế tiếp làm nổi — đọc từ trên xuống là biết còn những gì"
          /* Tờ lịch tháng nằm sau một nút bấm chứ không mở sẵn: dòng thời gian trả lời "việc kế
             tiếp là gì", còn tờ lịch trả lời "rơi vào thứ mấy" — câu hỏi thứ hai chỉ hỏi khi
             người ta đang xếp lịch cá nhân, không phải mỗi lần mở trang. */
          action={<WaveCalendarButton wave={calendarWave} label="Xem dạng lịch tháng" tone="light" />}
        />
        <ol className="mt-1">
          {timeline.map((m, i) => (
            <li key={m.key} className="flex gap-3">
              {/* Cột trái vẽ đường nối: chấm cho mốc, vạch nối xuống mốc sau. Vạch KHÔNG vẽ ở mốc
                  cuối, nếu không đường thẳng chạy hụt xuống khoảng trống. */}
              <div className="flex flex-col items-center">
                <span
                  className={`mt-1 grid size-6 shrink-0 place-items-center rounded-full ${
                    m.state === "done"
                      ? "bg-teal/15 text-teal-strong"
                      : m.state === "current"
                        ? "bg-orange/15 text-orange-strong"
                        : "bg-stroke-soft text-ink-3"
                  }`}
                >
                  {m.state === "done" ? (
                    <CheckCircleIcon size={15} />
                  ) : (
                    <CircleIcon size={13} />
                  )}
                </span>
                {i < timeline.length - 1 && <span className="w-px flex-1 bg-stroke" />}
              </div>

              <div className={`min-w-0 flex-1 pb-4 ${m.state === "done" ? "opacity-60" : ""}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={`text-body ${m.state === "current" ? "font-semibold text-ink" : "text-ink"}`}
                  >
                    {m.title}
                  </h3>
                  {m.state === "current" && <Badge tone="warning">Kế tiếp</Badge>}
                  {m.actor === "thi-sinh" && m.state !== "done" && (
                    <Badge tone="neutral">Việc của bạn</Badge>
                  )}
                </div>
                <p className="mt-0.5 text-caption text-ink-2">{m.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <AllWaves waves={allWaves} highlightId={myWave.id} />
    </PageShell>
  );
}

/** Lịch toàn chương trình — đặt cuối trang vì đây là thông tin tham khảo, không phải việc phải làm. */
function AllWaves({
  waves,
  highlightId,
}: {
  waves: { id: number; name: string; registrationOpensAt: Date; phase2ClosesAt: Date | null; postingOpensAt: Date | null; postingClosesAt: Date | null }[];
  highlightId?: number;
}) {
  return (
    <Card>
      <CardHeader title="Lịch toàn chương trình" subtitle="Năm đợt của mùa này, để tham khảo" />
      <ul className="divide-y divide-stroke-soft">
        {waves.map((w) => (
          <li
            key={w.id}
            className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5 ${
              w.id === highlightId ? "font-medium text-ink" : "text-ink-2"
            }`}
          >
            <span className="flex items-center gap-2 text-body">
              {w.name}
              {w.id === highlightId && <Badge tone="success">Đợt của bạn</Badge>}
            </span>
            <span className="text-caption tabular-nums text-ink-3">
              mở {formatDateVN(w.registrationOpensAt)}
              {w.phase2ClosesAt && ` · hạn nộp ${formatDateVN(w.phase2ClosesAt)}`}
              {w.postingOpensAt &&
                w.postingClosesAt &&
                ` · đăng bài ${formatDateVN(w.postingOpensAt)}–${formatDateVN(w.postingClosesAt)}`}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
