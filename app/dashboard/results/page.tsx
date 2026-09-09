import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { getLatestIdeaScore, getLatestProductScore } from "@/lib/db/queries/scores";
import { engagementTierToScore } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { AppealForm } from "./appeal-form";
import { BarChart3, Clock } from "lucide-react";

export default async function ResultsPage() {
  const session = await getSession();
  const submission = session ? await getCurrentSubmissionForUser(session.userId) : null;

  if (!submission) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Bạn chưa có đề tài"
        desc="Đăng ký đề tài để bắt đầu hành trình dự thi."
        action={
          <Link href="/dashboard/register">
            <button className="ds-btn ds-btn-primary">Đăng ký ngay</button>
          </Link>
        }
      />
    );
  }

  if (!submission.publishedAt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kết quả — {submission.productName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="ds-alert ds-alert-warning">
            <Clock size={16} className="mt-0.5 shrink-0" />
            <span>
              Đang chờ hội đồng xác nhận & công bố điểm. Điểm chỉ hiển thị sau khi BTC bấm công bố.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ideaScore = await getLatestIdeaScore(submission.id);
  const productScore = await getLatestProductScore(submission.id);
  const technicalCap = submission.isPrebuiltRepo ? 20 : 40;
  const technical = Math.min(Number(productScore?.moduleScores.chatLuongKyThuat ?? 0), technicalCap);
  const completion = Math.min(Number(productScore?.moduleScores.hoanThien ?? 0), 15);
  const applicationValue = Math.min(Number(ideaScore?.moduleScores.giaTriUngDung ?? 0), 25);
  const engagement = engagementTierToScore(submission.engagementTier);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Kết quả — {submission.productName}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-success">{submission.finalScore}</span>
            <span className="text-base text-muted-foreground">/100</span>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <ScoreLine label="Chất lượng kỹ thuật" value={technical} max={technicalCap} />
            <ScoreLine label="Hoàn thiện & nội dung riêng" value={completion} max={15} />
            <ScoreLine label="Giá trị ứng dụng" value={applicationValue} max={25} />
            <ScoreLine label="Lan tỏa cộng đồng" value={engagement} max={20} />
          </div>
          {submission.isPrebuiltRepo && (
            <Badge variant="secondary">Trần kỹ thuật 20đ (deploy từ repo có sẵn)</Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phản biện (≤48h)</CardTitle>
        </CardHeader>
        <CardContent>
          <AppealForm submissionId={submission.id} />
        </CardContent>
      </Card>
    </div>
  );
}

function ScoreLine({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">{label}</span>
        <b className="text-foreground">
          {value}/{max}
        </b>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
