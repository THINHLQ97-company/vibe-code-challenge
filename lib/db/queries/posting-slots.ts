import { and, asc, eq, sql } from "drizzle-orm";
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

/** Khung giờ của một đợt kèm số người đã đặt — thứ tự theo giờ, đúng thứ tự người ta đọc lịch. */
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

export type BookResult =
  | { ok: true; slot: SlotWithCount; moved: boolean }
  | { ok: false; error: string };

/**
 * Đặt (hoặc đổi) khung giờ đăng bài cho một bài dự thi.
 *
 * KHUNG ĐẦY THÌ TỰ ĐẨY SANG KHUNG KẾ TIẾP (ban tổ chức chốt 15/09/2026). Trả về lỗi "khung đã đầy,
 * chọn khung khác" thì đẩy việc chọn lại về phía thí sinh đúng lúc họ đang vội, và người bấm chậm
 * vài giây sẽ phải thử đi thử lại. Đẩy tiếp rồi báo rõ "đã chuyển sang khung X" giữ được việc đăng
 * bài luôn có chỗ, và thí sinh vẫn đổi lại được nếu khung đó không tiện.
 *
 * Toàn bộ chạy trong một giao dịch có KHOÁ THEO ĐỢT: không có khoá thì hai người bấm cùng lúc vào
 * khung cuối cùng sẽ cùng đọc ra "còn 1 suất" và cùng ghi vào — khung vượt hạn mức mà không ai
 * thấy sai ở đâu.
 */
export async function bookPostingSlot(
  submissionId: number,
  slotId: number
): Promise<BookResult> {
  return db.transaction(async (tx) => {
    const submission = await tx.query.submissions.findFirst({
      where: eq(submissions.id, submissionId),
    });
    if (!submission) return { ok: false as const, error: "Không tìm thấy bài dự thi" };
    if (submission.waveId == null)
      return { ok: false as const, error: "Bài này chưa thuộc đợt thi nào — liên hệ ban tổ chức" };

    // Khoá theo đợt: hai người cùng đợt phải xếp hàng, hai người khác đợt không cản nhau.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(918_273, ${submission.waveId})`);

    const rows = await tx
      .select({
        slot: postingSlots,
        booked: sql<number>`count(${submissions.id})`.mapWith(Number),
      })
      .from(postingSlots)
      .leftJoin(submissions, eq(submissions.postingSlotId, postingSlots.id))
      .where(eq(postingSlots.waveId, submission.waveId))
      .groupBy(postingSlots.id)
      .orderBy(asc(postingSlots.startsAt));

    const all: SlotWithCount[] = rows.map((r) => ({
      ...r.slot,
      booked: r.booked,
      // Suất mình đang giữ không tính là đã dùng khi soi chính khung cũ của mình, nếu không thì
      // đổi từ khung A sang A lại báo đầy.
      remaining: Math.max(
        0,
        r.slot.capacity - r.booked + (submission.postingSlotId === r.slot.id ? 1 : 0)
      ),
    }));

    const requestedIndex = all.findIndex((s) => s.id === slotId);
    if (requestedIndex < 0) return { ok: false as const, error: "Khung giờ không hợp lệ" };

    let target = all[requestedIndex];
    let moved = false;
    if (target.remaining <= 0) {
      const next = all.slice(requestedIndex + 1).find((s) => s.remaining > 0);
      if (!next)
        return {
          ok: false as const,
          error:
            "Các khung giờ từ khung bạn chọn trở đi đều đã kín. Chọn một khung sớm hơn hoặc báo ban tổ chức.",
        };
      target = next;
      moved = true;
    }

    await tx
      .update(submissions)
      .set({ postingSlotId: target.id, postingSlotBookedAt: new Date(), updatedAt: new Date() })
      .where(eq(submissions.id, submissionId));

    return { ok: true as const, slot: target, moved };
  });
}

/** Danh sách bài đã đặt một khung — màn ban tổ chức duyệt bài theo từng khung giờ. */
export async function listBookingsForWave(waveId: number) {
  return db.query.submissions.findMany({
    where: and(eq(submissions.waveId, waveId), eq(submissions.currentPhase, 3)),
    with: { user: true, postingSlot: true },
  });
}

export type { PostingPeriod };
