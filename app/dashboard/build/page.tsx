import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { getAggregatedScores } from "@/lib/db/queries/scores";
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

export const metadata = { title: "Nộp bài" };

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
            description="Ban tổ chức duyệt đề tài theo từng đợt thi. Duyệt xong bạn mới nộp được sản phẩm. Hạn nộp là ngày chung của đợt, xem ở mục Lịch cuộc thi."
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

  /**
   * "Quá hạn" chỉ đúng khi CHƯA nộp.
   *
   * Lỗi đã gặp với tài khoản demo Kinh doanh: bài đã nộp và BTC đã chấm xong Phase 2, nhưng thẻ
   * hạn nộp vẫn đỏ "quá hạn 3 ngày" vì nó chỉ so ngày mà không hỏi đã nộp hay chưa. Cảnh báo bên
   * dưới thì có kiểm — tức hai chỗ trên cùng một màn nói hai chuyện trái nhau.
   */
  const submitted = !!submission.githubVerifiedAt || !!submission.vibehostUrl;
  const overdue =
    !submitted &&
    !!submission.submissionDeadline &&
    submission.submissionDeadline.getTime() < Date.now();

  /**
   * Khoá sửa link khi BTC ĐÃ chấm Phase 2 — điểm chấm theo sản phẩm tại thời điểm chấm, đổi link
   * sau đó là điểm không còn khớp thứ được chấm. Ngoại lệ: `needs_fix` thì phải mở, vì chính BTC
   * yêu cầu sửa và nộp lại.
   */
  const scores = await getAggregatedScores(submission.id);
  const locked = scores.hasProductScore && submission.feedbackStatus !== "needs_fix";

  return (
    <PageShell
      title="Nộp bài — sản phẩm & mã nguồn"
      subtitle="Phase 2: chấm chất lượng kỹ thuật và độ hoàn thiện"
      action={
        submitted ? (
          <Badge tone="success">Đã nộp sản phẩm</Badge>
        ) : submission.submissionDeadline ? (
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

      {overdue && (
        <Alert tone="warning" title="Đã quá hạn nộp">
          Hạn nộp của bạn là {formatDateVN(submission.submissionDeadline!)}. Vẫn nộp được, nhưng
          BTC có quyền không nhận bài trễ — liên hệ ban tổ chức nếu có lý do chính đáng.
        </Alert>
      )}

      <Card>
        <CardHeader
          title="Link sản phẩm và mã nguồn"
          subtitle="Bạn tự đăng ký Vibe Host bằng email @matbao.com và deploy ở đó; hệ thống này chỉ lưu link để chấm"
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
          locked={locked}
        />
        {locked && (
          <Note className="mt-3">
            BTC đã chấm Phase 2 nên link được khoá — điểm chấm theo đúng sản phẩm ở thời điểm chấm.
            Nếu BTC yêu cầu chỉnh sửa, ô nhập sẽ mở lại để bạn nộp bản mới.
          </Note>
        )}
        <Note className="mt-4">
          Repo để <b>private</b> và thêm tài khoản GitHub của ban tổ chức làm collaborator (quyền
          Read) — hệ thống dùng tài khoản đó để xác minh, không đọc mã nguồn của bạn cho việc gì
          khác. Ban tổ chức sẽ công bố tài khoản cần thêm.
        </Note>
      </Card>

      {/* Phiếu trải nghiệm (CP6) hỏi về trải nghiệm LÀM sản phẩm, nên đặt ngay cạnh bước nộp bài
          thay vì để thí sinh tự nhớ ra một mục rời trong menu. */}
      <Card>
        <CardHeader
          title="Phiếu trải nghiệm sản phẩm (CP6)"
          subtitle="Bắt buộc với mọi thí sinh — thiếu phiếu thì hồ sơ dự thi của bạn chưa khép lại"
          action={
            <Link href="/dashboard/survey">
              <Button
                variant={submission.surveySubmittedAt ? "ghost" : "solid"}
                size="sm"
                rightIcon={<ArrowRightIcon size={15} />}
              >
                {submission.surveySubmittedAt ? "Xem lại phiếu" : "Nộp phiếu"}
              </Button>
            </Link>
          }
        />
        {submission.surveySubmittedAt ? (
          <Note>
            Đã nộp {formatDateVN(submission.surveySubmittedAt)}. Nội dung phiếu được đội sản phẩm
            dùng để cải thiện Vibe Host.
          </Note>
        ) : (
          <Note tone="warning">
            Bạn vừa làm xong sản phẩm là lúc nhớ rõ nhất chỗ nào của Vibe Host khó dùng — nộp phiếu
            ngay bây giờ thay vì để tới cuối.
          </Note>
        )}
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
