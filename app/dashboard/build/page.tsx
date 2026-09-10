import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { formatDateTimeVN, formatDateVN } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Button } from "@/components/dsvh/ui/Button";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { Note } from "@/components/dsvh/ui/data/Note";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { NotepadIcon, HourglassIcon, ArrowRightIcon } from "@/components/dsvh/icons";
import { BuildForm } from "./build-form";

export default async function BuildPage() {
  const session = await getSession();
  const submission = session ? await getCurrentSubmissionForUser(session.userId) : null;

  if (!submission) {
    return (
      <PageShell title="Nộp bài">
        <Card>
          <Empty
            icon={<NotepadIcon size={40} />}
            title="Bạn chưa có đề tài"
            description="Đăng ký đề tài trước khi nộp sản phẩm và mã nguồn."
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

  if (submission.registrationStatus !== "approved") {
    return (
      <PageShell title="Nộp bài">
        <Card>
          <Empty
            icon={<HourglassIcon size={40} />}
            title="Đề tài chưa được duyệt"
            description="BTC duyệt cuốn chiếu theo tuần. Duyệt xong bạn mới nộp được sản phẩm — và đó cũng là mốc bắt đầu tính hạn nộp."
            action={
              <Link href="/dashboard">
                <Button variant="ghost">Về tổng quan</Button>
              </Link>
            }
          />
        </Card>
      </PageShell>
    );
  }

  const overdue =
    !!submission.submissionDeadline && submission.submissionDeadline.getTime() < Date.now();

  return (
    <PageShell
      title="Nộp bài — sản phẩm & mã nguồn"
      subtitle="Phase 2: chấm chất lượng kỹ thuật và độ hoàn thiện"
      action={
        submission.submissionDeadline ? (
          <Badge tone={overdue ? "danger" : "neutral"}>
            Hạn nộp {formatDateVN(submission.submissionDeadline)}
          </Badge>
        ) : undefined
      }
    >
      {/* BTC gắn cờ ở cổng an toàn thì thí sinh PHẢI thấy lý do. Trước đây màn này im lặng: bài
          bị chặn công bố mà người làm không biết mình sai điều cấm nào để mà sửa. */}
      {submission.securityStatus === "flagged" && (
        <Alert tone="error" title="Bài bị gắn cờ ở cổng rà soát an toàn (CP4)">
          {submission.securityNote ?? "BTC chưa ghi rõ lý do — liên hệ ban tổ chức."} Sửa xong thì
          nộp lại link bên dưới để BTC rà lại.
        </Alert>
      )}

      {submission.securityStatus === "clean" && (
        <Note>Bài đã qua cổng rà soát an toàn (CP4) — không vướng điều cấm nào.</Note>
      )}

      {overdue && !submission.githubVerifiedAt && (
        <Alert tone="warning" title="Đã quá hạn nộp">
          Hạn nộp của bạn là {formatDateVN(submission.submissionDeadline!)}. Vẫn nộp được, nhưng
          BTC có quyền không nhận bài trễ — liên hệ ban tổ chức nếu có lý do chính đáng.
        </Alert>
      )}

      <Card>
        <CardHeader
          title="Link sản phẩm và mã nguồn"
          subtitle="Bạn tự đăng ký tài khoản Vibe Host và deploy ở đó; hệ thống này chỉ lưu link để chấm"
        />
        <BuildForm
          submissionId={submission.id}
          initialVibehostUrl={submission.vibehostUrl ?? ""}
          initialGithubRepoUrl={submission.githubRepoUrl ?? ""}
          githubVerified={!!submission.githubVerifiedAt}
          initialError={submission.githubVerifyError}
          lastCheckedAt={
            submission.githubLastCheckedAt ? formatDateTimeVN(submission.githubLastCheckedAt) : null
          }
        />
        <Note className="mt-4">
          Repo để <b>private</b> và thêm tài khoản GitHub <code>matbao-vibe-bot</code> làm
          collaborator (quyền Read) — hệ thống dùng tài khoản đó để xác minh, không đọc mã nguồn của
          bạn cho việc gì khác.
        </Note>
      </Card>

      {submission.feedbackStatus !== "pending" && (
        <Card>
          <CardHeader
            title="Phản hồi của BTC"
            subtitle={
              submission.feedbackStatus === "approved"
                ? "Đã duyệt — bạn được sang bước chia sẻ & lan tỏa"
                : "Cần chỉnh sửa trước khi qua bước tiếp theo"
            }
            action={
              submission.feedbackStatus === "approved" ? (
                <Link href="/dashboard/share">
                  <Button variant="solid" size="sm" rightIcon={<ArrowRightIcon size={15} />}>
                    Sang bước chia sẻ
                  </Button>
                </Link>
              ) : undefined
            }
          />
          {submission.btcFeedback ? (
            <Alert
              tone={submission.feedbackStatus === "approved" ? "success" : "warning"}
              title={submission.feedbackStatus === "approved" ? "Đạt yêu cầu" : "Điểm cần sửa"}
            >
              {submission.btcFeedback}
            </Alert>
          ) : (
            <Note>BTC đã chấm nhưng chưa ghi phản hồi chi tiết.</Note>
          )}
        </Card>
      )}
    </PageShell>
  );
}
