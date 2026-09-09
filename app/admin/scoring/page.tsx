import { getSession } from "@/lib/auth/session";
import { listSubmissionsWithUser } from "@/lib/db/queries/submissions";
import { getScoreOverviews } from "@/lib/db/queries/scores";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { Note } from "@/components/dsvh/ui/data/Note";
import { RobotIcon } from "@/components/dsvh/icons";
import { ScoringRow } from "./scoring-row";

export default async function ScoringPage() {
  const session = await getSession();
  const all = await listSubmissionsWithUser();
  const approved = all.filter((s) => s.registrationStatus === "approved");
  const overviews = await getScoreOverviews(
    approved.map((s) => s.id),
    session?.userId ?? 0
  );

  return (
    <PageShell
      title="Chấm điểm & phản hồi"
      subtitle="Phase 1 (ý tưởng /25) và Phase 2 (kỹ thuật /40 + hoàn thiện /15)"
    >
      <Card>
        <CardHeader
          title={`${approved.length} bài đã duyệt đề tài`}
          subtitle="Mỗi giám khảo chấm độc lập một phiếu; điểm chốt là trung bình các phiếu"
        />
        {approved.length === 0 ? (
          <Empty
            icon={<RobotIcon size={40} />}
            title="Chưa có bài nào để chấm"
            description="Duyệt đề tài ở mục Duyệt đề tài trước — bài được duyệt sẽ xuất hiện ở đây."
          />
        ) : (
          <div className="space-y-3">
            {approved.map((s) => {
              const o = overviews.get(s.id)!;
              return (
                <ScoringRow
                  key={s.id}
                  submission={{
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
                  }}
                  scores={{
                    giaTriUngDung: o.giaTriUngDung,
                    chatLuongKyThuat: o.chatLuongKyThuat,
                    hoanThien: o.hoanThien,
                    hasIdeaScore: o.hasIdeaScore,
                    hasProductScore: o.hasProductScore,
                    judgeNames: o.judgeNames,
                    myIdea: o.myIdea ? Number(o.myIdea.giaTriUngDung ?? 0) : null,
                    myProduct: o.myProduct
                      ? {
                          chatLuongKyThuat: Number(o.myProduct.chatLuongKyThuat ?? 0),
                          hoanThien: Number(o.myProduct.hoanThien ?? 0),
                        }
                      : null,
                    feedbackStatus: s.feedbackStatus,
                    btcFeedback: s.btcFeedback,
                  }}
                />
              );
            })}
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
