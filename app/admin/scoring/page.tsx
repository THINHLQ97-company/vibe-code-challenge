import { getSession } from "@/lib/auth/session";
import { listSubmissionsWithUser } from "@/lib/db/queries/submissions";
import { getScoreOverviews } from "@/lib/db/queries/scores";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Note } from "@/components/dsvh/ui/data/Note";
import { StatCard } from "@/components/dsvh/ui/data/StatCard";
import { RobotIcon, HourglassIcon, CheckCircleIcon, ScalesIcon } from "@/components/dsvh/icons";
import { ScoringTable, type ScoringRowData } from "./scoring-table";

export default async function ScoringPage() {
  const session = await getSession();
  const all = await listSubmissionsWithUser();
  const approved = all.filter((s) => s.registrationStatus === "approved");
  const overviews = await getScoreOverviews(
    approved.map((s) => s.id),
    session?.userId ?? 0
  );

  const rows: ScoringRowData[] = approved.map((s) => {
    const o = overviews.get(s.id)!;
    return {
      id: s.id,
      productName: s.productName,
      userName: s.user.name ?? "",
      department: s.user.department ?? "",
      currentPhase: s.currentPhase,
      isPrebuiltRepo: s.isPrebuiltRepo,
      hasPrd: !!s.prdContent,
      ideaValue: o.hasIdeaScore ? o.giaTriUngDung.value : null,
      ideaBasis: o.giaTriUngDung.basis,
      productValue: o.hasProductScore
        ? o.chatLuongKyThuat.value + o.hoanThien.value
        : null,
      productBasis: o.chatLuongKyThuat.basis,
      judgeCount: Math.max(o.giaTriUngDung.judgeCount, o.chatLuongKyThuat.judgeCount),
      iScored: o.myIdea != null || o.myProduct != null,
      feedbackStatus: s.feedbackStatus,
    };
  });

  const waitingAi = rows.filter((r) => r.ideaValue == null).length;
  const waitingJudge = rows.filter((r) => r.ideaValue != null && r.judgeCount === 0).length;
  const notScoredByMe = rows.filter((r) => !r.iScored).length;
  const approvedPhase2 = rows.filter((r) => r.feedbackStatus === "approved").length;

  return (
    <PageShell
      title="Chấm điểm & phản hồi"
      subtitle="Máy chấm điểm sơ bộ, hội đồng xác nhận hoặc điều chỉnh — điểm chốt là trung bình các phiếu"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ScalesIcon}
          label="Bài đã duyệt đề tài"
          value={rows.length}
          desc="đang trong vòng chấm"
        />
        <StatCard
          icon={RobotIcon}
          label="Chờ máy chấm"
          value={waitingAi}
          desc="chưa có điểm sơ bộ Phase 1"
          tone={waitingAi > 0 ? "danger" : "default"}
        />
        <StatCard
          icon={HourglassIcon}
          label="Bạn chưa chấm"
          value={notScoredByMe}
          desc="chưa có phiếu của bạn"
          tone={notScoredByMe > 0 ? "danger" : "success"}
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Đã duyệt đạt Phase 2"
          value={approvedPhase2}
          desc="đạt mốc 90% KPI 3P"
          tone="success"
        />
      </div>

      <Card>
        <CardHeader
          title="Danh sách bài dự thi"
          subtitle="Bấm vào một bài để đọc tài liệu, xem điểm máy chấm và chấm phiếu của bạn"
        />
        <ScoringTable rows={rows} />
        {waitingJudge > 0 && (
          <Note tone="warning" className="mt-3">
            {waitingJudge} bài đang lấy nguyên điểm máy vì chưa giám khảo nào chấm. Thể lệ yêu cầu
            hội đồng xác nhận trước khi công bố.
          </Note>
        )}
        <Note className="mt-3">
          Duyệt đạt Phase 2 là mốc thí sinh được tính 90% Ứng dụng AI theo KPI 3P — hệ HRM đọc dữ
          liệu này, app không đẩy đi đâu.
        </Note>
      </Card>
    </PageShell>
  );
}
