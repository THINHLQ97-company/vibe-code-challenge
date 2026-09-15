import { and, asc, eq, count } from "drizzle-orm";
import { db } from "../index";
import { waves, submissions, users, type NewWave } from "../schema";

export async function listWaves(seasonId: number) {
  return db.query.waves.findMany({
    where: eq(waves.seasonId, seasonId),
    orderBy: asc(waves.orderIndex),
  });
}

export async function getWave(id: number) {
  return db.query.waves.findFirst({ where: eq(waves.id, id) });
}

/** Số thí sinh đã đăng ký vào từng wave, trả về dạng map để không phải đếm trong vòng lặp. */
export async function countByWave(seasonId: number): Promise<Map<number, number>> {
  const rows = await db
    .select({ waveId: submissions.waveId, n: count() })
    .from(submissions)
    .where(eq(submissions.seasonId, seasonId))
    .groupBy(submissions.waveId);
  const map = new Map<number, number>();
  for (const r of rows) if (r.waveId != null) map.set(r.waveId, Number(r.n));
  return map;
}

/**
 * Wave ĐANG MỞ ĐĂNG KÝ tại thời điểm `at`.
 *
 * Kiểm cả `status` lẫn khoảng thời gian: `status` là công tắc tay của BTC (đóng sớm khi cần), còn
 * khoảng thời gian là lịch đã công bố. Chỉ cần một trong hai không thoả là chưa mở — nếu chỉ dựa
 * vào lịch thì BTC không đóng sớm được, còn nếu chỉ dựa vào công tắc thì phải có người trực để
 * bấm mở đúng giờ.
 */
export async function getOpenWave(seasonId: number, at: Date = new Date()) {
  const all = await listWaves(seasonId);
  return (
    all.find(
      (w) =>
        w.status === "open" && w.registrationOpensAt <= at && w.registrationClosesAt >= at
    ) ?? null
  );
}

/** Wave kế tiếp chưa tới lượt — dùng cho đồng hồ đếm ngược "wave sau mở lúc nào". */
export async function getNextWave(seasonId: number, at: Date = new Date()) {
  const all = await listWaves(seasonId);
  return all.find((w) => w.status !== "closed" && w.registrationOpensAt > at) ?? null;
}

export async function createWave(data: NewWave) {
  const [row] = await db.insert(waves).values(data).returning();
  return row;
}

export async function updateWave(id: number, data: Partial<NewWave>) {
  const [row] = await db
    .update(waves)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(waves.id, id))
    .returning();
  return row;
}

/** BTC chuyển một thí sinh sang wave khác. */
export async function moveSubmissionToWave(submissionId: number, waveId: number | null) {
  const [row] = await db
    .update(submissions)
    .set({ waveId, updatedAt: new Date() })
    .where(eq(submissions.id, submissionId))
    .returning();
  return row;
}

/** Các bài trong một wave — dùng cho bảng xếp hạng nội bộ wave và cho màn BTC. */
export async function listSubmissionsInWave(waveId: number) {
  return db.query.submissions.findMany({
    where: eq(submissions.waveId, waveId),
    with: { user: true },
  });
}

export async function countInWave(waveId: number): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(submissions)
    .where(and(eq(submissions.waveId, waveId)));
  return Number(row?.n ?? 0);
}

export type BoardCounts = { ky_thuat: number; van_phong: number; total: number };

/**
 * Đếm thí sinh trong một đợt, TÁCH THEO BẢNG THI.
 *
 * Cần vì trần số lượng nay là hai con số riêng, và vì cả thí sinh lẫn BTC đều cần biết mỗi bảng
 * đang có bao nhiêu người — một con số tổng không trả lời được câu "tôi đang so với mấy người".
 */
export async function countInWaveByBoard(waveId: number): Promise<BoardCounts> {
  const rows = await db
    .select({ board: users.board, n: count() })
    .from(submissions)
    .innerJoin(users, eq(submissions.userId, users.id))
    .where(eq(submissions.waveId, waveId))
    .groupBy(users.board);

  const out: BoardCounts = { ky_thuat: 0, van_phong: 0, total: 0 };
  for (const r of rows) {
    const n = Number(r.n);
    if (r.board === "ky_thuat") out.ky_thuat = n;
    else if (r.board === "van_phong") out.van_phong = n;
    out.total += n;
  }
  return out;
}

/** Trần của một bảng trong đợt. */
export function capacityForBoard(
  wave: { capacityKyThuat: number; capacityVanPhong: number },
  board: "ky_thuat" | "van_phong" | null
): number {
  return board === "ky_thuat" ? wave.capacityKyThuat : wave.capacityVanPhong;
}
