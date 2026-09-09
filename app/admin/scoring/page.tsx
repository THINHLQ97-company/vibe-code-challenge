import { listSubmissionsWithUser } from "@/lib/db/queries/submissions";
import { getLatestIdeaScore, getLatestProductScore } from "@/lib/db/queries/scores";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { Note } from "@/components/dsvh/ui/data/Note";
import { RobotIcon } from "@/components/dsvh/icons";
import { ScoringRow } from "./scoring-row";

export default async function ScoringPage() {
  const all = await listSubmissionsWithUser();
  const approved = all.filter((s) => s.registrationStatus === "approved");

  const rows = await Promise.all(
    approved.map(async (s) => ({
      submission: {
        id: s.id,
        productName: s.productName,
        currentPhase: s.currentPhase,
        isPrebuiltRepo: s.isPrebuiltRepo,
        vibehostUrl: s.vibehostUrl,
        githubRepoUrl: s.githubRepoUrl,
        githubVerified: !!s.githubVerifiedAt,
        githubVerifyError: s.githubVerifyError,
        userName: s.user.name ?? "",
        department: s.user.department ?? "",
      },
      ideaScore: (await getLatestIdeaScore(s.id)) ?? null,
      productScore: (await getLatestProductScore(s.id)) ?? null,
    }))
  );

  return (
    <PageShell
      title="Chấm điểm & phản hồi"
      subtitle="Phase 1 (ý tưởng /25) và Phase 2 (kỹ thuật /40 + hoàn thiện /15)"
    >
      <Card>
        <CardHeader
          title={`${rows.length} bài đã duyệt đề tài`}
          subtitle="Điểm đến từ hệ chấm ngoài qua API; chưa kết nối thì BTC nhập tay để không chặn tiến độ"
        />
        {rows.length === 0 ? (
          <Empty
            icon={<RobotIcon size={40} />}
            title="Chưa có bài nào để chấm"
            description="Duyệt đề tài ở mục Duyệt đề tài trước — bài được duyệt sẽ xuất hiện ở đây."
          />
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <ScoringRow
                key={r.submission.id}
                submission={r.submission}
                ideaScore={
                  r.ideaScore
                    ? {
                        giaTriUngDung: Number(r.ideaScore.moduleScores.giaTriUngDung ?? 0),
                        source: r.ideaScore.source,
                        summary: r.ideaScore.summary,
                      }
                    : null
                }
                productScore={
                  r.productScore
                    ? {
                        chatLuongKyThuat: Number(r.productScore.moduleScores.chatLuongKyThuat ?? 0),
                        hoanThien: Number(r.productScore.moduleScores.hoanThien ?? 0),
                        source: r.productScore.source,
                        feedbackStatus: r.productScore.feedbackStatus,
                        btcFeedback: r.productScore.btcFeedback,
                      }
                    : null
                }
              />
            ))}
          </div>
        )}
        <Note className="mt-3">
          Duyệt đạt Phase 2 là mốc thí sinh được tính 90% Ứng dụng AI theo KPI 3P — hệ HRM đọc dữ
          liệu này, app không đẩy đi đâu.
        </Note>
      </Card>
    </PageShell>
  );
}
