import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { getAggregatedScores } from "@/lib/db/queries/scores";
import { candidateScoreView } from "@/lib/score-visibility";
import { getCheckpoints } from "@/lib/checkpoints";
import { submissionStage } from "@/lib/stage-status";
import { CheckpointTrail } from "@/components/checkpoint-trail";
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
import { NotepadIcon, ArrowRightIcon } from "@/components/dsvh/icons";

const PHASE_STEPS = [
  { label: "Ý tưởng", description: "Đăng ký & chấm điểm đề tài" },
  { label: "Sản phẩm", description: "Vibe Host + mã nguồn" },
  { label: "Lan tỏa", description: "Đăng bài & đếm tương tác" },
  { label: "Công bố", description: "Kết quả cuối" },
];

export const metadata = { title: { absolute: "Tổng quan · Khu thí sinh" } };

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

  // Cùng nguồn tổng hợp với màn chấm điểm bên BTC — hai bên không được nói hai con số khác nhau.
  const scores = await getAggregatedScores(submission.id);
  const ideaView = candidateScoreView(scores.giaTriUngDung);
  const productView = candidateScoreView({
    value: scores.chatLuongKyThuat.value + scores.hoanThien.value,
    basis: scores.chatLuongKyThuat.basis,
    judgeCount: scores.chatLuongKyThuat.judgeCount,
  });

  const checklist = getCheckpoints(submission);

  const nextAction = getNextAction(submission);
  // Một huy hiệu trạng thái TỔNG, cùng từ vựng với màn BTC — thí sinh và BTC nhìn cùng một chữ.
  const stage = submissionStage(submission);

  return (
    <PageShell
      title={submission.productName}
      subtitle={`Nhánh ${submission.branch} · ${submission.topicGroup}`}
      action={<Badge tone={stage.tone}>{stage.label}</Badge>}
    >
      <Note tone={stage.state === "blocked" ? "danger" : stage.state === "waiting" ? "warning" : "neutral"}>
        {stage.detail}
      </Note>

      {submission.registrationStatus === "returned" && (
        <Alert tone="warning" title="Đề tài bị trả về — sửa và nộp lại">
          {submission.registrationNote}{" "}
          <Link href="/dashboard/register" className="text-link hover:text-link-hover">
            Sửa đề tài
          </Link>
        </Alert>
      )}

      {submission.securityStatus === "flagged" && (
        <Alert tone="error" title="Bài bị gắn cờ ở cổng rà soát an toàn (CP4)">
          {submission.securityNote ?? "BTC chưa ghi rõ lý do — liên hệ ban tổ chức."}{" "}
          Bài chưa qua cổng này thì không được công bố kết quả. Sửa xong nộp lại ở{" "}
          <Link href="/dashboard/build" className="text-link hover:text-link-hover">
            mục nộp bài
          </Link>
          .
        </Alert>
      )}

      {submission.feedbackStatus === "needs_fix" && (
        <Alert tone="warning" title="BTC yêu cầu chỉnh sửa sản phẩm">
          {submission.btcFeedback}{" "}
          <Link href="/dashboard/build" className="text-link hover:text-link-hover">
            Xem chi tiết & nộp lại
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
            value={ideaView.visible ? `${ideaView.value}/25` : ideaView.label}
          />
          <p className="mt-1 text-caption text-ink-2">
            {ideaView.visible
              ? `Hội đồng đã chốt · trung bình ${ideaView.judgeCount} giám khảo`
              : ideaView.hint}
          </p>
        </Card>
        <Card className="p-4">
          <InfoTile
            layout="stack"
            label="Điểm sản phẩm (Phase 2)"
            value={productView.visible ? `${productView.value}/55` : productView.label}
          />
          <p className="mt-1 text-caption text-ink-2">
            {productView.visible
              ? `Hội đồng đã chốt · trung bình ${productView.judgeCount} giám khảo`
              : productView.hint}
          </p>
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
        <CardHeader
          title="Mốc bắt buộc"
          subtitle="Sáu mốc phải xong đủ mới được công nhận đậu. Ô đỏ là việc đang chờ bạn xử lý, ô cam là việc kế tiếp."
        />
        <CheckpointTrail checkpoints={checklist} />
        <Note className="mt-4">
          Điểm từng phần hiện ngay khi hội đồng chốt; tổng điểm và thứ hạng chỉ hiện sau khi ban tổ
          chức bấm công bố.
        </Note>
      </Card>
    </PageShell>
  );
}

/**
 * Một việc tiếp theo duy nhất — tránh để thí sinh phải tự đoán mình đang kẹt ở đâu.
 *
 * Thứ tự phải khớp với thứ tự BTC thao tác bên `/admin`, nếu không thí sinh sẽ được bảo đi làm
 * một việc mà hệ thống đang chặn. Ba nhánh trước đây thiếu hẳn:
 *   · bị gắn cờ ở cổng an toàn (BTC gắn cờ mà màn này im lặng),
 *   · BTC yêu cầu sửa sản phẩm (`feedbackStatus = needs_fix`),
 *   · và "chờ BGK duyệt bài" bị xếp SAU phiếu trải nghiệm, trong khi thực tế nó xảy ra trước.
 */
function getNextAction(s: {
  registrationStatus: string;
  currentPhase: number;
  securityStatus: string;
  feedbackStatus: string;
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
  if (s.securityStatus === "flagged")
    return {
      desc: "Bài bị gắn cờ ở cổng an toàn — phải sửa và nộp lại trước khi đi tiếp.",
      cta: "Xem & nộp lại",
      href: "/dashboard/build",
    };
  if (!s.githubVerifiedAt)
    return {
      desc: "Deploy sản phẩm lên Vibe Host rồi nộp link kèm repo GitHub (nhớ thêm bot của BTC làm collaborator).",
      cta: "Nộp bài",
      href: "/dashboard/build",
    };
  if (s.feedbackStatus === "needs_fix")
    return {
      desc: "BTC đã chấm và yêu cầu chỉnh sửa — sửa xong nộp lại link.",
      cta: "Xem yêu cầu sửa",
      href: "/dashboard/build",
    };
  if (s.currentPhase < 3)
    return { desc: "BTC đang chấm sản phẩm và mã nguồn của bạn — chờ phản hồi.", cta: "Xem phản hồi", href: "/dashboard/build" };
  if (!s.facebookPostUrl)
    return { desc: "Đăng bài ẩn danh lên nhóm cộng đồng rồi dán link vào hệ thống.", cta: "Chia sẻ bài", href: "/dashboard/share" };
  if (!s.facebookApprovedAt)
    return { desc: "BGK đang kiểm tra bài đăng của bạn trên nhóm.", cta: "Xem trạng thái", href: "/dashboard/share" };
  if (!s.surveySubmittedAt)
    return { desc: "Nộp phiếu trải nghiệm (CP6) — bắt buộc để được công nhận đậu.", cta: "Nộp phiếu", href: "/dashboard/survey" };
  if (!s.publishedAt)
    return { desc: "Đã xong hết phần của bạn — chờ BTC chốt điểm và công bố.", cta: "Xem kết quả", href: "/dashboard/results" };
  return null;
}
