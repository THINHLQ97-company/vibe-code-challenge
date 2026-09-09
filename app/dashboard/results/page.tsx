import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { getLatestIdeaScore, getLatestProductScore } from "@/lib/db/queries/scores";
import { engagementTierToScore } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppealForm } from "./appeal-form";

export default async function ResultsPage() {
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

  if (!submission.publishedAt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kết quả — {submission.productName}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-body text-ink-2">
          <div className="rounded-card border border-amber-strong/30 bg-amber-strong/5 p-3 text-caption text-amber-strong">
            ⏳ Đang chờ hội đồng xác nhận & công bố điểm. Điểm chỉ hiển thị sau khi BTC bấm công
            bố.
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
            <span className="text-hero font-bold text-teal-strong">{submission.finalScore}</span>
            <span className="text-body text-ink-2">/100</span>
          </div>
          <div className="flex flex-col gap-2 text-caption">
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
        <span className="text-ink-2">{label}</span>
        <b className="text-ink">
          {value}/{max}
        </b>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-stroke-soft">
        <div className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
