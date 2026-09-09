import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { getLatestProductScore } from "@/lib/db/queries/scores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BuildForm } from "./build-form";

export default async function BuildPage() {
  const session = await getSession();
  const submission = session ? await getCurrentSubmissionForUser(session.userId) : null;

  if (!submission) {
    return (
      <Card>
        <CardContent className="py-6 text-body text-ink-2">
          Bạn chưa có đề tài.{" "}
          <Link href="/dashboard/register" className="text-link">
            Đăng ký ngay
          </Link>
          .
        </CardContent>
      </Card>
    );
  }
  if (submission.registrationStatus !== "approved") {
    return (
      <Card>
        <CardContent className="py-6 text-body text-ink-2">
          Đề tài của bạn chưa được BTC duyệt — chưa thể nộp bài.
        </CardContent>
      </Card>
    );
  }

  const productScore = await getLatestProductScore(submission.id);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Nộp bài — Vibe Host & mã nguồn</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-caption text-ink-2">
            Bạn tự đăng ký tài khoản Vibe Host tại{" "}
            <a href="https://vibehost.matbao.ai" target="_blank" className="text-link" rel="noreferrer">
              vibehost.matbao.ai
            </a>{" "}
            và deploy sản phẩm ở đó. Dán link sản phẩm + link Git repo <b>private</b> bên dưới —
            nhớ thêm tài khoản GitHub <code className="rounded bg-stroke-soft px-1">matbao-vibe-bot</code>{" "}
            làm collaborator (quyền Read) để hệ thống verify tự động.
          </p>
          <BuildForm
            submissionId={submission.id}
            initialVibehostUrl={submission.vibehostUrl ?? ""}
            initialGithubRepoUrl={submission.githubRepoUrl ?? ""}
            githubVerified={!!submission.githubVerifiedAt}
          />
        </CardContent>
      </Card>

      {productScore && (
        <Card>
          <CardHeader>
            <CardTitle>Phản hồi từ BTC</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-body">
            <div className="text-caption text-ink-2">
              Trạng thái:{" "}
              <b className={productScore.feedbackStatus === "approved" ? "text-teal-strong" : "text-amber-strong"}>
                {productScore.feedbackStatus === "approved" ? "Đã duyệt — chuyển Phase 3" : "Cần chỉnh sửa"}
              </b>
            </div>
            {productScore.btcFeedback && (
              <div className="rounded-card border border-stroke bg-surface-2 p-3 text-caption">
                {productScore.btcFeedback}
              </div>
            )}
            {productScore.feedbackStatus === "approved" && (
              <Link href="/dashboard/share">
                <Button size="sm" className="mt-2 w-fit">
                  Sang bước chia sẻ & lan tỏa →
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
