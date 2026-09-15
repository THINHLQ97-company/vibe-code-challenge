import { getActiveSeason } from "@/lib/db/queries/seasons";
import { listWaves } from "@/lib/db/queries/waves";
import {
  ensureSlotAssignments,
  listPhase3InWave,
  listSlotsForWave,
} from "@/lib/db/queries/posting-slots";
import { periodLabel, periodTimeLabel, TOTAL_SLOT_CAPACITY } from "@/lib/contest-schedule";
import { formatDateVN, formatDateTimeVN } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { Note } from "@/components/dsvh/ui/data/Note";
import { CalendarIcon } from "@/components/dsvh/icons";
import { ScheduleBoard, type BoardSlot, type BoardEntry } from "./schedule-board";

export const metadata = { title: "Lịch đăng bài Phase 3" };
export const dynamic = "force-dynamic";

/**
 * QUẢN LÝ LỊCH ĐĂNG BÀI của Phase 3.
 *
 * Bài lên nhóm cộng đồng phải qua ban tổ chức duyệt mới hiện. Nếu cả đợt cùng chờ duyệt một lúc
 * thì bài lên sau trôi mất khỏi bảng tin, mà điểm lan tỏa lại so theo trung vị — nên thứ tự duyệt
 * sẽ quyết định điểm thay cho chất lượng bài. Màn này là chỗ ban tổ chức nhìn thấy toàn bộ lịch
 * duyệt của một đợt trước khi tới ngày.
 *
 * Thứ tự xếp: AI NỘP PHASE 2 TRƯỚC THÌ ĐƯỢC KHUNG SỚM. Hệ thống tự xếp, màn này chỉ hiện ra và
 * cho chỉnh tay khi có tình huống riêng.
 */
export default async function PostingSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ wave?: string }>;
}) {
  const season = await getActiveSeason();
  const waves = season ? (await listWaves(season.id)).filter((w) => w.status !== "draft") : [];

  if (waves.length === 0) {
    return (
      <PageShell title="Lịch đăng bài Phase 3">
        <Card>
          <Empty
            icon={<CalendarIcon size={40} />}
            title="Chưa có đợt thi nào được công bố"
            description="Tạo đợt thi và điền cửa sổ đăng bài ở mục Đợt thi, khung giờ sẽ tự dựng theo."
          />
        </Card>
      </PageShell>
    );
  }

  /**
   * Đợt mặc định là đợt SẮP TỚI CỬA SỔ ĐĂNG BÀI GẦN NHẤT, không phải đợt đầu danh sách.
   *
   * Ban tổ chức mở màn này vì sắp phải trực duyệt, nên thứ họ cần thấy ngay là đợt sắp tới lượt.
   * Mặc định về đợt 1 nghĩa là tới tháng 11 vẫn phải bấm chọn lại mỗi lần vào.
   */
  const now = Date.now();
  const withWindow = waves.filter((w) => w.postingClosesAt);
  const upcoming =
    withWindow.find((w) => (w.postingClosesAt as Date).getTime() >= now) ??
    withWindow[withWindow.length - 1];
  const requested = (await searchParams).wave;
  const selected =
    waves.find((w) => String(w.id) === requested) ?? upcoming ?? waves[0];

  if (!selected.postingOpensAt) {
    return (
      <PageShell
        title="Lịch đăng bài Phase 3"
        subtitle="Ai nộp Phase 2 trước thì được khung giờ sớm"
      >
        <Card>
          <Empty
            icon={<CalendarIcon size={40} />}
            title={`${selected.name} chưa có cửa sổ đăng bài`}
            description="Điền hai mốc mở và đóng cửa sổ đăng bài ở mục Đợt thi. Hệ thống sẽ dựng đủ 9 khung giờ và tự xếp thí sinh vào."
          />
        </Card>
      </PageShell>
    );
  }

  await ensureSlotAssignments(selected.id);

  const slotRows = await listSlotsForWave(selected.id);
  const people = await listPhase3InWave(selected.id);

  const slots: BoardSlot[] = slotRows.map((s) => ({
    id: s.id,
    dayIndex: s.dayIndex,
    period: s.period,
    periodLabel: periodLabel(s.period),
    timeLabel: periodTimeLabel(s.period),
    dateLabel: formatDateVN(s.startsAt),
    capacity: s.capacity,
    booked: s.booked,
  }));

  const entries: BoardEntry[] = people.map((p) => ({
    id: p.id,
    name: p.user.name ?? p.user.email,
    department: p.user.department ?? "",
    productName: p.productName,
    slotId: p.postingSlotId,
    submittedAt: p.phase2SubmittedAt ? formatDateTimeVN(p.phase2SubmittedAt) : null,
    posted: !!p.facebookPostUrl,
    approved: !!p.facebookApprovedAt,
    rejected: !!p.postRejectedAt,
  }));

  const unassigned = entries.filter((e) => e.slotId == null).length;
  const totalCapacity = slots.reduce((sum, s) => sum + s.capacity, 0);

  return (
    <PageShell
      title="Lịch đăng bài Phase 3"
      subtitle={`${selected.name} · ${formatDateVN(selected.postingOpensAt)}${selected.postingClosesAt ? ` – ${formatDateVN(selected.postingClosesAt)}` : ""} · ai nộp Phase 2 trước thì được khung sớm`}
    >
      <Card>
        <CardHeader
          title="Bảng khung giờ"
          subtitle={`${entries.length} bài đã tới Phase 3 · ${totalCapacity} suất trong ${slots.length} khung`}
        />
        <ScheduleBoard
          waves={waves.map((w) => ({ id: w.id, name: w.name }))}
          selectedWaveId={selected.id}
          slots={slots}
          entries={entries}
        />
        {unassigned > 0 && (
          <Note tone="warning" className="mt-4">
            Còn {unassigned} bài chưa có khung — các khung đã kín hết hạn mức. Nới hạn mức của một
            khung nào đó rồi tải lại trang, hệ thống sẽ xếp tiếp theo đúng thứ tự nộp bài.
          </Note>
        )}
        <Note className="mt-3">
          Hạn mức mặc định là {TOTAL_SLOT_CAPACITY} suất cho cả đợt — ngày 1 và 2 mỗi khung 5 suất,
          ngày 3 rút còn 4/3/3 vì bài đăng ngày cuối vẫn phải đếm đủ bảy ngày tương tác trước khi
          đợt khép lại.
        </Note>
      </Card>
    </PageShell>
  );
}
