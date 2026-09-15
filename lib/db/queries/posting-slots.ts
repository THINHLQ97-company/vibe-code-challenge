import { and, asc, eq, gte, isNull, ne, sql } from "drizzle-orm";
import { db } from "../index";
import { postingSlots, submissions, waves, type PostingSlot } from "../schema";
import { DEFAULT_SLOT_QUOTA, POSTING_PERIODS, slotStartsAt, type PostingPeriod } from "@/lib/contest-schedule";

export type SlotWithCount = PostingSlot & {
  booked: number;
  remaining: number;
};

/**
 * Dựng khung giờ cho một đợt từ cửa sổ đăng bài của đợt đó.
 *
 * Gọi được nhiều lần: khung đã có thì cập nhật mốc giờ, khung chưa có thì thêm. KHÔNG bao giờ xoá —
 * một khung đã có người đặt mà bị xoá thì chỗ đã hứa biến mất, và thí sinh không có cách nào biết.
 * Ban tổ chức dời cửa sổ đăng bài sang ngày khác thì các đặt chỗ cũ theo khung sang ngày mới.
 */
export async function ensurePostingSlots(waveId: number): Promise<void> {
  const wave = await db.query.waves.findFirst({ where: eq(waves.id, waveId) });
  if (!wave?.postingOpensAt) return;

  const day1 = new Date(
    Date.UTC(
      wave.postingOpensAt.getUTCFullYear(),
      wave.postingOpensAt.getUTCMonth(),
      wave.postingOpensAt.getUTCDate()
    )
  );

  for (let d = 0; d < DEFAULT_SLOT_QUOTA.length; d++) {
    const dayStart = new Date(day1.getTime() + d * 86_400_000);
    for (const p of POSTING_PERIODS) {
      await db
        .insert(postingSlots)
        .values({
          waveId,
          dayIndex: d + 1,
          period: p.key,
          startsAt: slotStartsAt(dayStart, p.key),
          capacity: DEFAULT_SLOT_QUOTA[d][p.key],
        })
        .onConflictDoUpdate({
          target: [postingSlots.waveId, postingSlots.dayIndex, postingSlots.period],
          // Chỉ đồng bộ lại mốc giờ. Hạn mức KHÔNG ghi đè: ban tổ chức có thể đã chỉnh tay cho một
          // khung nào đó, và dựng lại lịch không phải lý do để nuốt mất chỉnh sửa ấy.
          set: { startsAt: slotStartsAt(dayStart, p.key) },
        });
    }
  }
}

/** Khung giờ của một đợt kèm số bài đã xếp vào — thứ tự theo giờ, đúng thứ tự người ta đọc lịch. */
export async function listSlotsForWave(waveId: number): Promise<SlotWithCount[]> {
  const rows = await querySlots(waveId);
  if (rows.length > 0) return rows;

  /**
   * Chỉ dựng khung khi CHƯA CÓ khung nào.
   *
   * Việc dựng lại chạy ở chỗ nó thuộc về: lúc ban tổ chức lưu cửa sổ đăng bài. Gọi nó mỗi lần một
   * thí sinh mở trang nghĩa là chín lệnh ghi cho một lần đọc, nhân với số người đang vào xem.
   * Nhánh này chỉ là lưới an toàn cho đợt được tạo bằng con đường khác.
   */
  await ensurePostingSlots(waveId);
  return querySlots(waveId);
}

async function querySlots(waveId: number): Promise<SlotWithCount[]> {
  const rows = await db
    .select({
      slot: postingSlots,
      booked: sql<number>`count(${submissions.id})`.mapWith(Number),
    })
    .from(postingSlots)
    .leftJoin(submissions, eq(submissions.postingSlotId, postingSlots.id))
    .where(eq(postingSlots.waveId, waveId))
    .groupBy(postingSlots.id)
    .orderBy(asc(postingSlots.startsAt));

  return rows.map((r) => ({
    ...r.slot,
    booked: r.booked,
    remaining: Math.max(0, r.slot.capacity - r.booked),
  }));
}

/**
 * XẾP KHUNG GIỜ ĐĂNG BÀI cho mọi bài trong đợt đã tới Phase 3 mà chưa có khung.
 *
 * Thứ tự: theo thời điểm NỘP SẢN PHẨM PHASE 2 — nộp sớm thì được khung sớm, đúng như checklist
 * đã hứa với thí sinh. Bài chưa có mốc nộp (dữ liệu cũ) xếp sau cùng theo ngày tạo, chứ không bị
 * bỏ lại không có khung nào.
 *
 * Bài ĐÃ có khung thì giữ nguyên, không xếp lại. Khung đã báo cho thí sinh và đã nằm trong lịch
 * trực duyệt của ban tổ chức; dời nó vì có người mới vào Phase 3 nghĩa là lịch của cả đợt xê dịch
 * mỗi lần thêm một người.
 *
 * Chạy trong một giao dịch có khoá theo đợt: hai lượt xếp chạy song song mà không khoá thì cùng
 * đọc ra "khung này còn chỗ" rồi cùng ghi vào, và khung vượt hạn mức mà không ai thấy sai ở đâu.
 */
export async function ensureSlotAssignments(waveId: number): Promise<void> {
  await ensurePostingSlots(waveId);

  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(918_273, ${waveId})`);

    const slotRows = await tx
      .select({
        slot: postingSlots,
        booked: sql<number>`count(${submissions.id})`.mapWith(Number),
      })
      .from(postingSlots)
      .leftJoin(submissions, eq(submissions.postingSlotId, postingSlots.id))
      .where(eq(postingSlots.waveId, waveId))
      .groupBy(postingSlots.id)
      .orderBy(asc(postingSlots.startsAt));
    if (slotRows.length === 0) return;

    const remaining = slotRows.map((r) => ({ id: r.slot.id, left: r.slot.capacity - r.booked }));

    /**
     * Ai được xếp: đã tới Phase 3 và KHÔNG trượt vòng rà lại.
     *
     * Bài trượt vòng rà lại không được đăng, nên giữ một suất cho họ là khoá mất một khung giờ tốt
     * của người khác ngay từ đầu đợt.
     */
    const waiting = await tx.query.submissions.findMany({
      where: and(
        eq(submissions.waveId, waveId),
        gte(submissions.currentPhase, 3),
        isNull(submissions.postingSlotId),
        ne(submissions.recheckStatus, "failed")
      ),
    });

    waiting.sort((a, b) => {
      const ta = a.phase2SubmittedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const tb = b.phase2SubmittedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return ta !== tb ? ta - tb : a.createdAt.getTime() - b.createdAt.getTime();
    });

    const now = new Date();
    let cursor = 0;
    for (const sub of waiting) {
      while (cursor < remaining.length && remaining[cursor].left <= 0) cursor++;
      // Hết khung thì DỪNG, không xếp bừa: một suất vượt hạn mức là một bài lên nhóm ngoài lịch
      // trực, và ban tổ chức chỉ phát hiện khi nó đã lên. Ban tổ chức nới hạn mức rồi chạy lại.
      if (cursor >= remaining.length) break;

      remaining[cursor].left -= 1;
      await tx
        .update(submissions)
        .set({ postingSlotId: remaining[cursor].id, postingSlotBookedAt: now, updatedAt: now })
        .where(eq(submissions.id, sub.id));
    }
  });
}

/** Danh sách bài đã được xếp khung — màn ban tổ chức duyệt bài theo từng khung giờ. */
export async function listBookingsForWave(waveId: number) {
  return db.query.submissions.findMany({
    where: and(eq(submissions.waveId, waveId), eq(submissions.currentPhase, 3)),
    with: { user: true, postingSlot: true },
  });
}

export type { PostingPeriod };
