import { eq } from "drizzle-orm";
import { getActiveSeason } from "@/lib/db/queries/seasons";
import { listWaves } from "@/lib/db/queries/waves";
import { listAssignmentsForWave, JUDGES_PER_SUBMISSION } from "@/lib/db/queries/assignments";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { formatDateTimeVN } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { Note } from "@/components/dsvh/ui/data/Note";
import { ScalesIcon } from "@/components/dsvh/icons";
import { AssignmentManager, type AssignRow, type JudgeOption } from "./assignment-manager";

export const metadata = { title: "Phân công chấm" };
export const dynamic = "force-dynamic";

/**
 * PHÂN CÔNG CHẤM — ai chấm bài nào trong một đợt.
 *
 * Hệ thống chia ngẫu nhiên nhưng cân bằng, rồi ĐƯA BẢN NHÁP RA XEM TRƯỚC. Ghi thẳng xuống thì một
 * cú bấm nhầm đã quyết định ai chấm điểm của ai, và gỡ ra phải xoá từng dòng.
 *
 * Một phân công có hiệu lực cho CẢ HAI phase: ai chấm Phase 1 của một bài thì chấm luôn Phase 2
 * của bài đó (ban tổ chức chốt 15/09/2026).
 */
export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ wave?: string }>;
}) {
  const season = await getActiveSeason();
  const waves = season ? (await listWaves(season.id)).filter((w) => w.status !== "draft") : [];
  const judges = await db.query.users.findMany({ where: eq(users.role, "judge") });

  if (waves.length === 0) {
    return (
      <PageShell title="Phân công chấm">
        <Card>
          <Empty
            icon={<ScalesIcon size={40} />}
            title="Chưa có đợt thi nào được công bố"
            description="Tạo đợt thi ở mục Đợt thi trước khi phân công chấm."
          />
        </Card>
      </PageShell>
    );
  }

  const requested = (await searchParams).wave;
  const selected = waves.find((w) => String(w.id) === requested) ?? waves[0];

  const { submissions: inWave, assignments } = await listAssignmentsForWave(selected.id);
  const bySubmission = new Map<number, typeof assignments>();
  for (const a of assignments) {
    bySubmission.set(a.submissionId, [...(bySubmission.get(a.submissionId) ?? []), a]);
  }

  const rows: AssignRow[] = inWave.map((s) => ({
    submissionId: s.id,
    productName: s.productName,
    candidate: s.user.name ?? s.user.email,
    department: s.user.department ?? "",
    board: s.user.board,
    judges: (bySubmission.get(s.id) ?? []).map((a) => ({
      id: a.judgeId,
      name: a.judge?.name ?? a.judge?.email ?? `#${a.judgeId}`,
      assignedAt: formatDateTimeVN(a.assignedAt),
    })),
  }));

  const judgeOptions: JudgeOption[] = judges.map((j) => ({
    id: j.id,
    name: j.name ?? j.email,
    load: assignments.filter((a) => a.judgeId === j.id).length,
  }));

  const unassigned = rows.filter((r) => r.judges.length < JUDGES_PER_SUBMISSION).length;

  return (
    <PageShell
      title="Phân công chấm"
      subtitle={`${selected.name} · ${rows.length} bài đã duyệt đề tài · mỗi bài ${JUDGES_PER_SUBMISSION} giám khảo, có hiệu lực cho cả hai phase`}
    >
      <Card>
        <CardHeader
          title="Bảng phân công"
          subtitle={
            unassigned > 0
              ? `${unassigned} bài chưa có đủ giám khảo — bấm "Phân công" để chia phần còn lại`
              : "Mọi bài đã có đủ giám khảo"
          }
        />
        <AssignmentManager
          waves={waves.map((w) => ({ id: w.id, name: w.name }))}
          selectedWaveId={selected.id}
          rows={rows}
          judges={judgeOptions}
          perSubmission={JUDGES_PER_SUBMISSION}
        />
        <Note className="mt-4">
          Giám khảo chỉ chấm được bài được giao. Người vắng mặt thì bấm <b>Giao lại</b> ở dòng
          tương ứng — bài đó đứng ở cả hai phase cho tới khi có người thay, nên đừng để lâu. Phiếu
          đã chấm vẫn thuộc về người chấm cũ, giao lại chỉ đổi người cho phần chưa chấm.
        </Note>
      </Card>
    </PageShell>
  );
}
