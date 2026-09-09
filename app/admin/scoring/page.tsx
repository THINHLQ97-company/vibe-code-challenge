import { listSubmissionsWithUser } from "@/lib/db/queries/submissions";
import { getLatestIdeaScore, getLatestProductScore } from "@/lib/db/queries/scores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { ScoringRow } from "./scoring-row";

export default async function ScoringPage() {
  const all = await listSubmissionsWithUser();
  const relevant = all.filter((s) => s.registrationStatus === "approved");

  const rows = await Promise.all(
    relevant.map(async (s) => ({
      submission: s,
      ideaScore: await getLatestIdeaScore(s.id),
      productScore: await getLatestProductScore(s.id),
    }))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chấm điểm & feedback Phase 1/2</CardTitle>
        <p className="text-caption text-ink-2">
          Điểm Phase 1 (ý tưởng) + Phase 2 (kỹ thuật) đến từ hệ chấm điểm ngoài qua API — nếu
          chưa có, dùng form &quot;Nhập tay&quot; bên dưới để không chặn tiến độ demo.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {rows.length === 0 && (
          <EmptyState icon="🤖" title="Chưa có đề tài nào đã duyệt" desc="Duyệt đề tài ở mục 'Duyệt đề tài' trước, sau đó chấm điểm sẽ hiện ở đây." />
        )}
        {rows.map((r) => (
          <ScoringRow key={r.submission.id} {...r} />
        ))}
      </CardContent>
    </Card>
  );
}
