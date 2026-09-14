import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { getAggregatedScores } from "@/lib/db/queries/scores";
import { listAppealsForSubmission } from "@/lib/db/queries/appeals";
import { APPEAL_WINDOW_HOURS, checkAppealGate } from "@/lib/appeal-policy";
import { engagementTierToScore } from "@/lib/scoring";
import { formatDateTimeVN } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Button } from "@/components/dsvh/ui/Button";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { Note } from "@/components/dsvh/ui/data/Note";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Progress } from "@/components/dsvh/ui/Progress";
import { InfoRow } from "@/components/dsvh/ui/data/InfoRow";
import { NotepadIcon, HourglassIcon } from "@/components/dsvh/icons";
import { AppealForm } from "./appeal-form";
import { getWave } from "@/lib/db/queries/waves";

export const metadata = { title: "Kết quả" };

export default async function ResultsPage() {
  const session = await getSession();
  const submission = session ? await getCurrentSubmissionForUser(session.userId) : null;

  if (!submission) {
    return (
      <PageShell title="Kết quả">
        <Card>
          <Empty
            icon={<NotepadIcon size={40} />}
            title="Bạn chưa có đề tài"
            description="Đăng ký đề tài để bắt đầu hành trình dự thi."
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

  if (!submission.publishedAt) {
    return (
      <PageShell title="Kết quả" subtitle={submission.productName}>
        <Card>
          <Empty
            icon={<HourglassIcon size={40} />}
            title="Chưa công bố kết quả"
            description="Tổng điểm và thứ hạng chỉ hiện sau khi BTC bấm công bố. Điểm từng phần đã được hội đồng chốt thì xem ở trang Tổng quan."
            action={
              <Link href="/dashboard">
                <Button variant="ghost">Xem điểm từng phần</Button>
              </Link>
            }
          />
        </Card>
      </PageShell>
    );
  }

  // Cùng nguồn tổng hợp với API công bố — nếu trang này tự lấy phiếu mới nhất thì bảng phân rã
  // điểm sẽ không cộng ra đúng tổng điểm đang hiển thị ngay bên trên nó.
  const [scores, appeals] = await Promise.all([
    getAggregatedScores(submission.id),
    listAppealsForSubmission(submission.id),
  ]);

  const technical = Math.min(scores.chatLuongKyThuat.value, 40);
  const completion = Math.min(scores.hoanThien.value, 15);
  const applicationValue = Math.min(scores.giaTriUngDung.value, 25);
  const engagement = engagementTierToScore(submission.engagementTier);
  const judgeCount = Math.max(
    scores.giaTriUngDung.judgeCount,
    scores.chatLuongKyThuat.judgeCount
  );

  // Điểm thưởng đọc từ chính đợt của bài, cùng nguồn với lúc công bố — không tính lại theo thứ tự
  // đợt, vì BTC sửa được điểm thưởng của một đợt và bài phải ăn theo đúng con số đã áp dụng.
  const myWave = submission.waveId != null ? await getWave(submission.waveId) : null;
  const waveBonus = myWave?.bonusPoints ?? 0;
  const waveName = myWave?.name ?? "";

  const appealGate = checkAppealGate({
    publishedAt: submission.publishedAt,
    existingAppeals: appeals.length,
  });

  return (
    <PageShell
      title="Kết quả"
      subtitle={submission.productName}
      action={<Badge tone="success">Đã công bố · {formatDateTimeVN(submission.publishedAt)}</Badge>}
    >
      <Card>
        {/* Trần hiển thị là 100 + điểm thưởng đợt CỦA CHÍNH BẠN, không phải 100 cứng: điểm thưởng
            cộng ngoài thang 100 nên một bài hoàn hảo ở Đợt 1 ra 105, và "105/100" thì trông như
            lỗi tính toán. */}
        <CardHeader
          title="Tổng điểm"
          subtitle={
            waveBonus > 0
              ? `Thang 100 theo barem, cộng thêm ${waveBonus} điểm thưởng đăng ký sớm của ${waveName}`
              : "Thang 100 — barem 40 · 15 · 25 · 20 theo thể lệ"
          }
        />
        <div className="flex items-baseline gap-2">
          <span className="text-kpi font-bold text-orange">{submission.finalScore}</span>
          <span className="text-body text-ink-2">/{100 + waveBonus}</span>
        </div>
        <div className="mt-4 space-y-3">
          <ScoreLine label="Chất lượng kỹ thuật" value={technical} max={40} />
          <ScoreLine label="Độ hoàn thiện & nội dung riêng" value={completion} max={15} />
          <ScoreLine label="Giá trị ứng dụng" value={applicationValue} max={25} />
          <ScoreLine label="Lan tỏa cộng đồng" value={engagement} max={20} />
          {waveBonus > 0 && (
            <ScoreLine
              label={`Thưởng đăng ký sớm · ${waveName}`}
              value={waveBonus}
              max={waveBonus}
            />
          )}
        </div>
        {judgeCount > 0 && (
          <Note className="mt-4">
            Điểm là trung bình của {judgeCount} giám khảo chấm độc lập.
          </Note>
        )}

      </Card>

      <Card>
        <CardHeader
          title="Phản biện"
          subtitle={`Một vòng duy nhất, trong ${APPEAL_WINDOW_HOURS}h kể từ lúc công bố, bắt buộc kèm bằng chứng kiểm chứng được`}
        />
        {appeals.length > 0 ? (
          <div className="space-y-3">
            {appeals.map((a) => (
              <dl key={a.id} className="divide-y divide-stroke">
                <InfoRow
                  label="Trạng thái"
                  value={
                    <Badge
                      tone={
                        a.status === "accepted" ? "success" : a.status === "rejected" ? "danger" : "warning"
                      }
                    >
                      {a.status === "accepted"
                        ? "Được chấp nhận"
                        : a.status === "rejected"
                          ? "Bị từ chối"
                          : "Đang chờ xử lý"}
                    </Badge>
                  }
                />
                <InfoRow label="Tiêu chí phản biện" value={a.criteria} wrap />
                {a.resolutionNote && <InfoRow label="Kết luận của BTC" value={a.resolutionNote} wrap />}
              </dl>
            ))}
          </div>
        ) : appealGate.open ? (
          <AppealForm submissionId={submission.id} />
        ) : (
          <Alert tone="info" title="Không mở phản biện">
            {appealGate.reason}.
          </Alert>
        )}
      </Card>
    </PageShell>
  );
}

function ScoreLine({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-caption">
        <span className="text-ink-2">{label}</span>
        <span className="font-semibold text-ink tabular-nums">
          {value}/{max}
        </span>
      </div>
      <Progress value={max > 0 ? (value / max) * 100 : 0} tone="teal" className="mt-1.5" />
    </div>
  );
}
