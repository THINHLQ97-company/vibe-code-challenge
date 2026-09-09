import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { getLatestIdeaScore, getLatestProductScore } from "@/lib/db/queries/scores";
import { formatDateVN, formatDeadlineDistance } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Button } from "@/components/dsvh/ui/Button";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { Note } from "@/components/dsvh/ui/data/Note";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Stepper } from "@/components/dsvh/ui/Stepper";
import { InfoTile } from "@/components/dsvh/ui/data/InfoTile";
import {
  NotepadIcon,
  CheckCircleIcon,
  CircleIcon,
  ArrowRightIcon,
} from "@/components/dsvh/icons";

const PHASE_STEPS = [
  { label: "Ý tưởng", description: "Đăng ký & chấm điểm đề tài" },
  { label: "Sản phẩm", description: "Vibe Host + mã nguồn" },
  { label: "Lan tỏa", description: "Đăng bài & đếm tương tác" },
  { label: "Công bố", description: "Kết quả cuối" },
];

const REG_STATUS: Record<string, { tone: "neutral" | "success" | "warning" | "danger"; label: string }> = {
  pending: { tone: "warning", label: "Chờ BTC duyệt" },
  approved: { tone: "success", label: "Đã duyệt đề tài" },
  returned: { tone: "danger", label: "Bị trả về" },
};

export default async function DashboardOverviewPage() {
  const session = await getSession();
  const submission = session ? await getCurrentSubmissionForUser(session.userId) : null;

  if (!submission) {
    return (
      <PageShell title="Tổng quan" subtitle="Hành trình dự thi của bạn">
        <Card>
          <Empty
            icon={<NotepadIcon size={40} />}
            title="Bạn chưa đăng ký đề tài"
            description="Mỗi người dự thi một sản phẩm, có database thật và deploy lên Vibe Host. Đăng ký để BTC duyệt cuốn chiếu theo tuần."
            action={
              <Link href="/dashboard/register">
                <Button variant="solid" rightIcon={<ArrowRightIcon size={16} />}>
                  Đăng ký đề tài
                </Button>
              </Link>
            }
          />
        </Card>
      </PageShell>
    );
  }

  const [ideaScore, productScore] = await Promise.all([
    getLatestIdeaScore(submission.id),
    getLatestProductScore(submission.id),
  ]);

  const checklist = [
    { label: "CP1 · Đăng ký dự thi", done: true },
    { label: "CP2 · Đề tài được duyệt", done: submission.registrationStatus === "approved" },
    { label: "CP3 · Nộp Vibe Host + mã nguồn", done: !!submission.githubVerifiedAt },
    { label: "CP4 · Qua cổng an toàn", done: submission.securityStatus === "clean" },
    { label: "CP5 · Đăng bài & BGK duyệt", done: !!submission.facebookApprovedAt },
    { label: "CP6 · Phiếu trải nghiệm", done: !!submission.surveySubmittedAt },
  ];

  const nextAction = getNextAction(submission);
  const status = REG_STATUS[submission.registrationStatus];

  return (
    <PageShell
      title={submission.productName}
      subtitle={`Nhánh ${submission.branch} · ${submission.topicGroup}`}
      action={<Badge tone={status.tone}>{status.label}</Badge>}
    >
      {submission.registrationStatus === "returned" && (
        <Alert tone="warning" title="Đề tài bị trả về — sửa và nộp lại">
          {submission.registrationNote}{" "}
          <Link href="/dashboard/register" className="text-link hover:text-link-hover">
            Sửa đề tài
          </Link>
        </Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <InfoTile
            layout="stack"
            label="Hạn nộp của bạn"
            value={
              submission.submissionDeadline
                ? formatDateVN(submission.submissionDeadline)
                : "Chưa có — chờ duyệt đề tài"
            }
          />
          {submission.submissionDeadline && (
            <p className="mt-1 text-caption text-ink-2">
              {formatDeadlineDistance(submission.submissionDeadline)}
            </p>
          )}
        </Card>
        <Card className="p-4">
          <InfoTile
            layout="stack"
            label="Điểm ý tưởng (Phase 1)"
            value={ideaScore ? `${ideaScore.moduleScores.giaTriUngDung ?? 0}/25` : "Chưa chấm"}
          />
        </Card>
        <Card className="p-4">
          <InfoTile
            layout="stack"
            label="Điểm sản phẩm (Phase 2)"
            value={
              productScore
                ? `${(productScore.moduleScores.chatLuongKyThuat ?? 0) + (productScore.moduleScores.hoanThien ?? 0)}/55`
                : "Chưa chấm"
            }
          />
        </Card>
      </div>

      {nextAction && (
        <Card>
          <CardHeader
            title="Việc cần làm tiếp theo"
            subtitle={nextAction.desc}
            action={
              nextAction.href ? (
                <Link href={nextAction.href}>
                  <Button variant="solid" size="sm" rightIcon={<ArrowRightIcon size={15} />}>
                    {nextAction.cta}
                  </Button>
                </Link>
              ) : undefined
            }
          />
        </Card>
      )}

      <Card>
        <CardHeader title="Tiến độ 3 phase" subtitle="Phase hiện tại quyết định bước bạn được làm tiếp" />
        <Stepper steps={PHASE_STEPS} current={submission.currentPhase - 1} />
      </Card>

      <Card>
        <CardHeader title="Mốc bắt buộc" subtitle="CP1–CP6 phải xong đủ mới được công nhận đậu" />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {checklist.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-2 rounded-lg border border-stroke bg-surface-2 px-3 py-2 text-caption"
            >
              {c.done ? (
                <CheckCircleIcon size={16} className="shrink-0 text-teal" />
              ) : (
                <CircleIcon size={16} className="shrink-0 text-ink-3" />
              )}
              <span className={c.done ? "text-ink" : "text-ink-2"}>{c.label}</span>
            </div>
          ))}
        </div>
        <Note className="mt-3">
          Điểm chỉ hiển thị sau khi BTC xác nhận và công bố — trước đó bảng điểm vẫn đang được hội
          đồng đối chiếu.
        </Note>
      </Card>
    </PageShell>
  );
}

/** Một việc tiếp theo duy nhất — tránh để thí sinh phải tự đoán mình đang kẹt ở đâu. */
function getNextAction(s: {
  registrationStatus: string;
  currentPhase: number;
  githubVerifiedAt: Date | null;
  facebookPostUrl: string | null;
  facebookApprovedAt: Date | null;
  surveySubmittedAt: Date | null;
  publishedAt: Date | null;
}): { desc: string; cta: string; href: string } | null {
  if (s.registrationStatus === "returned")
    return { desc: "BTC đã trả về đề tài kèm lý do — sửa rồi nộp lại.", cta: "Sửa đề tài", href: "/dashboard/register" };
  if (s.registrationStatus === "pending")
    return { desc: "Đề tài đang chờ BTC duyệt cuốn chiếu. Chưa cần làm gì thêm.", cta: "Xem đề tài", href: "/dashboard/register" };
  if (!s.githubVerifiedAt)
    return {
      desc: "Deploy sản phẩm lên Vibe Host rồi nộp link kèm repo GitHub (nhớ thêm bot của BTC làm collaborator).",
      cta: "Nộp bài",
      href: "/dashboard/build",
    };
  if (s.currentPhase < 3)
    return { desc: "BTC đang chấm sản phẩm và mã nguồn của bạn — chờ phản hồi.", cta: "Xem phản hồi", href: "/dashboard/build" };
  if (!s.facebookPostUrl)
    return { desc: "Đăng bài ẩn danh lên nhóm cộng đồng rồi dán link vào hệ thống.", cta: "Chia sẻ bài", href: "/dashboard/share" };
  if (!s.surveySubmittedAt)
    return { desc: "Nộp phiếu trải nghiệm (CP6) — bắt buộc để được công nhận đậu.", cta: "Nộp phiếu", href: "/dashboard/survey" };
  if (!s.facebookApprovedAt)
    return { desc: "BGK đang kiểm tra bài đăng của bạn trên nhóm.", cta: "Xem trạng thái", href: "/dashboard/share" };
  if (!s.publishedAt)
    return { desc: "Đã xong hết phần của bạn — chờ BTC chốt điểm và công bố.", cta: "Xem kết quả", href: "/dashboard/results" };
  return null;
}
