import { engagementTierToScore } from "@/lib/scoring-rubric";
import { getSession } from "@/lib/auth/session";
import { listSubmissionsWithUser } from "@/lib/db/queries/submissions";
import { getScoreOverviews } from "@/lib/db/queries/scores";
import { submissionStage } from "@/lib/stage-status";
import { KPI_CATEGORY, KPI_SHORT } from "@/lib/kpi";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Note } from "@/components/dsvh/ui/data/Note";
import { StatCard } from "@/components/dsvh/ui/data/StatCard";
import { RobotIcon, HourglassIcon, CheckCircleIcon, ScalesIcon } from "@/components/dsvh/icons";
import { ScoringTable, type ScoringRowData } from "./scoring-table";
import { getActiveSeason } from "@/lib/db/queries/seasons";
import { listWaves } from "@/lib/db/queries/waves";
import { countJudgeBallots } from "@/lib/db/queries/scores";
import { getCurrentRole } from "@/lib/auth/current-user";
import { assignedSubmissionIds } from "@/lib/db/queries/assignments";

export const metadata = { title: "Chấm điểm" };

export default async function ScoringPage() {
  const session = await getSession();
  const all = await listSubmissionsWithUser();
  const approved = all.filter((s) => s.registrationStatus === "approved");
  const overviews = await getScoreOverviews(
    approved.map((s) => s.id),
    session?.userId ?? 0
  );

  /**
   * Nạp TẤT CẢ các đợt một lần rồi tra theo map, không gọi `getWave` trong vòng lặp: 35 bài mỗi
   * đợt là 35 lượt đi database cho một lần mở trang, trong khi số đợt chỉ có vài cái.
   */
  const isAdmin = (await getCurrentRole()) === "admin";

  /**
   * Giám khảo CHỈ chấm bài được giao (ban tổ chức chốt 15/09/2026), nên danh sách phải nói ra bài
   * nào là của họ. Vẫn hiện cả bài của người khác — giám khảo cần thấy tiến độ chung của đợt, và
   * một danh sách rút gọn còn mười dòng làm người ta tưởng đợt chỉ có mười bài.
   */
  const myAssigned = session && !isAdmin ? await assignedSubmissionIds(session.userId) : null;
  const ballotCounts = await countJudgeBallots(approved.map((s) => s.id));

  const season = await getActiveSeason();
  const waveById = new Map(
    (season ? await listWaves(season.id) : []).map((w) => [w.id, w])
  );

  const rows: ScoringRowData[] = approved.map((s) => {
    const o = overviews.get(s.id)!;
    const stage = submissionStage(s);
    return {
      id: s.id,
      productName: s.productName,
      userName: s.user.name ?? "",
      department: s.user.department ?? "",
      board: s.user.board,
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
      // Lan tỏa không đi qua phiếu chấm — quy đổi từ bậc tương tác BTC chốt ở màn bài đăng.
      engagementTier: s.engagementTier,
      engagementValue: s.engagementTier == null ? null : engagementTierToScore(s.engagementTier),
      waveBonus: s.waveId != null ? (waveById.get(s.waveId)?.bonusPoints ?? 0) : 0,
      waveName: s.waveId != null ? (waveById.get(s.waveId)?.name ?? null) : null,
      published: !!s.publishedAt,
      phase1Published: !!s.phase1PublishedAt,
      phase2Published: !!s.phase2PublishedAt,
      ballots: ballotCounts.get(s.id) ?? { phase1: 0, phase2: 0 },
      iScored: o.myIdea != null || o.myProduct != null,
      stageLabel: stage.label,
      stageTone: stage.tone,
      assignedToMe: myAssigned ? myAssigned.has(s.id) : null,
    };
  });

  const waitingAi = rows.filter((r) => r.ideaValue == null).length;
  const waitingJudge = rows.filter((r) => r.ideaValue != null && r.judgeCount === 0).length;
  const notScoredByMe = rows.filter((r) => !r.iScored).length;
  const approvedPhase2 = approved.filter((s) => s.feedbackStatus === "approved").length;

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
          desc={`được tính ${KPI_SHORT}`}
          tone="success"
        />
      </div>

      <Card>
        <CardHeader
          title="Danh sách bài dự thi"
          subtitle="Bấm vào một bài để đọc tài liệu, xem điểm máy chấm và chấm phiếu của bạn"
        />
        <ScoringTable rows={rows} canPublish={isAdmin} hasAssignments={myAssigned != null && myAssigned.size > 0} />
        {waitingJudge > 0 && (
          <Note tone="warning" className="mt-3">
            {waitingJudge} bài đang lấy nguyên điểm máy vì chưa giám khảo nào chấm. Thể lệ yêu cầu
            hội đồng xác nhận trước khi công bố.
          </Note>
        )}
        <Note className="mt-3">
          Duyệt đạt Phase 2 là mốc bài được tính vào {KPI_CATEGORY} — hệ HRM đọc dữ
          liệu này, app không đẩy đi đâu.
        </Note>
      </Card>
    </PageShell>
  );
}
