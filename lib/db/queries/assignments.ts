import { and, eq, inArray } from "drizzle-orm";
import { db } from "../index";
import { judgeAssignments, submissions, users } from "../schema";

/** Mỗi bài hai phiếu — cùng con số với trần phiếu ở `lib/db/queries/scores.ts`. */
export const JUDGES_PER_SUBMISSION = 2;

export type DraftRow = { submissionId: number; judgeIds: number[] };

export type AssignmentPreview = {
  draft: DraftRow[];
  /** Số bài mỗi giám khảo sẽ nhận SAU khi chốt, gồm cả phần đã giao từ trước. */
  loadAfter: { judgeId: number; name: string; total: number }[];
  /** Bài đã có phân công từ lần chạy trước — không đụng tới. */
  alreadyAssigned: number;
  /** Không đủ giám khảo thì nói thẳng thay vì chia bừa. */
  error?: string;
};

/**
 * CHIA BÀI CHO GIÁM KHẢO — ngẫu nhiên nhưng CÂN BẰNG.
 *
 * Ngẫu nhiên thuần thì không ai đoán được mình chấm bài nào, nhưng nó cũng không chia đều: mô
 * phỏng 40 bài cho 8 giám khảo cho ra chênh lệch trung bình 8 phiếu giữa người nhiều nhất và ít
 * nhất — tức có người chấm 6 bài trong khi đồng nghiệp chấm 14, trong cùng một buổi chiều. "Không
 * thiên vị" và "công bằng" là hai thứ khác nhau; cái ban tổ chức cần là cái thứ hai.
 *
 * Nên thuật toán ở đây: xáo trộn danh sách bài (không ai đoán được thứ tự), rồi với mỗi bài chọn
 * giám khảo ĐANG NHẸ TẢI NHẤT. Hoà tải thì ưu tiên cặp nào từng ghép chung ít nhất — để không có
 * hai người cứ chấm cặp với nhau suốt đợt, vì như thế điểm trung bình sẽ mang thiên kiến chung của
 * riêng cặp đó.
 *
 * Hàm này CHỈ TÍNH, không ghi. Bản nháp đưa cho admin xem trước rồi mới chốt — phân công quyết
 * định ai chấm điểm của ai, một cú bấm nhầm mà ghi thẳng xuống thì gỡ ra rất phiền.
 */
export async function buildAssignmentDraft(waveId: number): Promise<AssignmentPreview> {
  const judges = await db.query.users.findMany({ where: eq(users.role, "judge") });
  if (judges.length < JUDGES_PER_SUBMISSION) {
    return {
      draft: [],
      loadAfter: [],
      alreadyAssigned: 0,
      error: `Cần ít nhất ${JUDGES_PER_SUBMISSION} giám khảo, hiện có ${judges.length}. Thêm ở mục Người dùng.`,
    };
  }

  // Chỉ chia bài ĐÃ ĐƯỢC DUYỆT ĐỀ TÀI: bài còn chờ duyệt có thể bị trả về, giao trước là giao một
  // việc có thể biến mất.
  const inWave = await db.query.submissions.findMany({
    where: and(eq(submissions.waveId, waveId), eq(submissions.registrationStatus, "approved")),
  });

  const existing = inWave.length
    ? await db.query.judgeAssignments.findMany({
        where: inArray(
          judgeAssignments.submissionId,
          inWave.map((s) => s.id)
        ),
      })
    : [];

  const bySubmission = new Map<number, number[]>();
  for (const a of existing) {
    bySubmission.set(a.submissionId, [...(bySubmission.get(a.submissionId) ?? []), a.judgeId]);
  }

  const load = new Map<number, number>(judges.map((j) => [j.id, 0]));
  const pairSeen = new Map<string, number>();
  const pairKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

  for (const a of existing) load.set(a.judgeId, (load.get(a.judgeId) ?? 0) + 1);
  for (const [, ids] of bySubmission) {
    for (let i = 0; i < ids.length; i++)
      for (let k = i + 1; k < ids.length; k++) {
        const key = pairKey(ids[i], ids[k]);
        pairSeen.set(key, (pairSeen.get(key) ?? 0) + 1);
      }
  }

  const pending = inWave.filter(
    (s) => (bySubmission.get(s.id)?.length ?? 0) < JUDGES_PER_SUBMISSION
  );

  // Xáo trộn: đây là chỗ duy nhất có yếu tố ngẫu nhiên, và nó đủ để không ai đoán trước được.
  const shuffled = [...pending];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const draft: DraftRow[] = [];
  for (const sub of shuffled) {
    const already = bySubmission.get(sub.id) ?? [];
    const picked: number[] = [];

    while (already.length + picked.length < JUDGES_PER_SUBMISSION) {
      const taken = new Set([...already, ...picked]);
      const candidates = judges.filter((j) => !taken.has(j.id));
      if (candidates.length === 0) break;

      candidates.sort((a, b) => {
        const la = load.get(a.id) ?? 0;
        const lb = load.get(b.id) ?? 0;
        if (la !== lb) return la - lb;

        // Hoà tải → ai từng ghép chung với người đã chọn ít hơn thì được ưu tiên.
        const partners = [...already, ...picked];
        const pa = partners.reduce((n, p) => n + (pairSeen.get(pairKey(a.id, p)) ?? 0), 0);
        const pb = partners.reduce((n, p) => n + (pairSeen.get(pairKey(b.id, p)) ?? 0), 0);
        if (pa !== pb) return pa - pb;
        return Math.random() - 0.5;
      });

      const chosen = candidates[0];
      picked.push(chosen.id);
      load.set(chosen.id, (load.get(chosen.id) ?? 0) + 1);
    }

    for (const a of [...already, ...picked])
      for (const b of [...already, ...picked])
        if (a < b) pairSeen.set(pairKey(a, b), (pairSeen.get(pairKey(a, b)) ?? 0) + 1);

    if (picked.length > 0) draft.push({ submissionId: sub.id, judgeIds: picked });
  }

  return {
    draft,
    loadAfter: judges
      .map((j) => ({ judgeId: j.id, name: j.name ?? j.email, total: load.get(j.id) ?? 0 }))
      .sort((a, b) => b.total - a.total),
    alreadyAssigned: inWave.length - pending.length,
  };
}

/**
 * Ghi bản nháp mà admin ĐÃ XEM xuống database.
 *
 * Nhận lại đúng bản nháp thay vì tự chia lại lần nữa: chia lại sẽ ra kết quả khác (có yếu tố ngẫu
 * nhiên), và lúc đó thứ được lưu không phải thứ admin vừa duyệt.
 */
export async function saveAssignments(
  waveId: number,
  draft: DraftRow[],
  assignedBy: number
): Promise<{ saved: number }> {
  if (draft.length === 0) return { saved: 0 };

  const inWave = await db.query.submissions.findMany({
    where: and(eq(submissions.waveId, waveId), eq(submissions.registrationStatus, "approved")),
  });
  const allowed = new Set(inWave.map((s) => s.id));
  const judges = await db.query.users.findMany({ where: eq(users.role, "judge") });
  const judgeIds = new Set(judges.map((j) => j.id));

  const rows = draft
    .filter((d) => allowed.has(d.submissionId))
    .flatMap((d) =>
      d.judgeIds
        .filter((id) => judgeIds.has(id))
        .map((judgeId) => ({ submissionId: d.submissionId, judgeId, assignedBy }))
    );
  if (rows.length === 0) return { saved: 0 };

  // Bỏ qua hàng đã có: admin bấm hai lần, hoặc hai người cùng bấm, thì lần sau không được hỏng.
  await db.insert(judgeAssignments).values(rows).onConflictDoNothing();
  return { saved: rows.length };
}

/** Đổi người chấm một bài — dùng khi giám khảo vắng. */
export async function reassign(
  submissionId: number,
  fromJudgeId: number,
  toJudgeId: number,
  assignedBy: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const target = await db.query.users.findFirst({ where: eq(users.id, toJudgeId) });
  if (!target || target.role !== "judge") return { ok: false, error: "Người nhận không phải giám khảo" };

  const current = await db.query.judgeAssignments.findMany({
    where: eq(judgeAssignments.submissionId, submissionId),
  });
  if (current.some((a) => a.judgeId === toJudgeId))
    return { ok: false, error: "Người này đã được giao bài đó rồi" };

  await db
    .delete(judgeAssignments)
    .where(
      and(
        eq(judgeAssignments.submissionId, submissionId),
        eq(judgeAssignments.judgeId, fromJudgeId)
      )
    );
  await db
    .insert(judgeAssignments)
    .values({ submissionId, judgeId: toJudgeId, assignedBy })
    .onConflictDoNothing();
  return { ok: true };
}

/** Phân công của cả một đợt, kèm thí sinh và giám khảo — dựng màn quản lý. */
export async function listAssignmentsForWave(waveId: number) {
  const inWave = await db.query.submissions.findMany({
    where: and(eq(submissions.waveId, waveId), eq(submissions.registrationStatus, "approved")),
    with: { user: true },
  });
  if (inWave.length === 0) return { submissions: [], assignments: [] };

  const assignments = await db.query.judgeAssignments.findMany({
    where: inArray(
      judgeAssignments.submissionId,
      inWave.map((s) => s.id)
    ),
    with: { judge: true },
  });
  return { submissions: inWave, assignments };
}

/** Bài được giao cho một giám khảo — dùng để lọc màn chấm và để chặn chấm bài ngoài phân công. */
export async function assignedSubmissionIds(judgeId: number): Promise<Set<number>> {
  const rows = await db
    .select({ submissionId: judgeAssignments.submissionId })
    .from(judgeAssignments)
    .where(eq(judgeAssignments.judgeId, judgeId));
  return new Set(rows.map((r) => r.submissionId));
}

/** Đã có phân công nào chưa — dùng để biết nên bật khoá cứng hay để mở như trước. */
export async function anyAssignmentsExist(): Promise<boolean> {
  const rows = await db.select({ id: judgeAssignments.id }).from(judgeAssignments).limit(1);
  return rows.length > 0;
}
