import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { getLatestProductScore } from "@/lib/db/queries/scores";
import { formatDateTimeVN } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Button } from "@/components/dsvh/ui/Button";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { Note } from "@/components/dsvh/ui/data/Note";
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

  const productScore = await getLatestProductScore(submission.id);

  return (
    <PageShell
      title="Nộp bài — sản phẩm & mã nguồn"
      subtitle="Phase 2: chấm chất lượng kỹ thuật và độ hoàn thiện"
    >
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

      {productScore && (
        <Card>
          <CardHeader
            title="Phản hồi của BTC"
            subtitle={
              productScore.feedbackStatus === "approved"
                ? "Đã duyệt — bạn được sang bước chia sẻ & lan tỏa"
                : "Cần chỉnh sửa trước khi qua bước tiếp theo"
            }
            action={
              productScore.feedbackStatus === "approved" ? (
                <Link href="/dashboard/share">
                  <Button variant="solid" size="sm" rightIcon={<ArrowRightIcon size={15} />}>
                    Sang bước chia sẻ
                  </Button>
                </Link>
              ) : undefined
            }
          />
          {productScore.btcFeedback ? (
            <Alert
              tone={productScore.feedbackStatus === "approved" ? "success" : "warning"}
              title={productScore.feedbackStatus === "approved" ? "Đạt yêu cầu" : "Điểm cần sửa"}
            >
              {productScore.btcFeedback}
            </Alert>
          ) : (
            <Note>BTC đã chấm nhưng chưa ghi phản hồi chi tiết.</Note>
          )}
        </Card>
      )}
    </PageShell>
  );
}
