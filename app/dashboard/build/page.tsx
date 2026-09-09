import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { getLatestProductScore } from "@/lib/db/queries/scores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { BuildForm } from "./build-form";
import { PackageSearch, Clock, ArrowRight } from "lucide-react";

export default async function BuildPage() {
  const session = await getSession();
  const submission = session ? await getCurrentSubmissionForUser(session.userId) : null;

  if (!submission) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Bạn chưa có đề tài"
        desc="Đăng ký đề tài trước khi nộp bài Vibe Host & mã nguồn."
        action={
          <Link href="/dashboard/register">
            <button className="ds-btn ds-btn-primary">Đăng ký ngay</button>
          </Link>
        }
      />
    );
  }
  if (submission.registrationStatus !== "approved") {
    return (
      <EmptyState
        icon={Clock}
        title="Đề tài chưa được duyệt"
        desc="BTC cần duyệt đề tài trước khi bạn nộp bài Phase 2."
      />
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
          <p className="text-sm text-muted-foreground">
            Bạn tự đăng ký tài khoản Vibe Host tại{" "}
            <a href="https://vibehost.matbao.ai" target="_blank" className="text-primary" rel="noreferrer">
              vibehost.matbao.ai
            </a>{" "}
            và deploy sản phẩm ở đó. Dán link sản phẩm + link Git repo <b>private</b> bên dưới —
            nhớ thêm tài khoản GitHub <code className="rounded bg-muted px-1">matbao-vibe-bot</code>{" "}
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
          <CardContent className="flex flex-col gap-2 text-base">
            <div className="text-sm text-muted-foreground">
              Trạng thái:{" "}
              <b className={productScore.feedbackStatus === "approved" ? "text-success" : "text-warning"}>
                {productScore.feedbackStatus === "approved" ? "Đã duyệt — chuyển Phase 3" : "Cần chỉnh sửa"}
              </b>
            </div>
            {productScore.btcFeedback && (
              <div className="rounded-card border border-border bg-muted p-3 text-sm">
                {productScore.btcFeedback}
              </div>
            )}
            {productScore.feedbackStatus === "approved" && (
              <Link href="/dashboard/share">
                <Button size="sm" className="mt-2 w-fit gap-1.5">
                  Sang bước chia sẻ & lan tỏa <ArrowRight size={14} />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
