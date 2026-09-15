import { getActiveSeason } from "@/lib/db/queries/seasons";
import { listWaves } from "@/lib/db/queries/waves";
import {
  ensureSlotAssignments,
  listPhase3InWave,
  listSlotsForWave,
} from "@/lib/db/queries/posting-slots";
import { periodLabel, periodTimeLabel, TOTAL_SLOT_CAPACITY } from "@/lib/contest-schedule";
import { formatDateVN, formatDateTimeVN } from "@/lib/datetime";
import Link from "next/link";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Button } from "@/components/dsvh/ui/Button";
import { WaveTabs } from "./wave-tabs";
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
   * Số bài đã tới Phase 3 của TỪNG đợt — cần cho cả việc chọn đợt mặc định lẫn nhãn trên thanh
   * chọn đợt. Không có con số này thì ban tổ chức phải bấm thử từng đợt để tìm xem người đang chờ
   * xếp lịch nằm ở đâu, đúng thứ vừa xảy ra với Đợt 0.
   */
  const phase3Counts = new Map(
    await Promise.all(
      waves.map(async (w) => [w.id, (await listPhase3InWave(w.id)).length] as const)
    )
  );

  /**
   * Đợt mặc định: ưu tiên đợt ĐANG CÓ NGƯỜI chờ xếp lịch, sau đó mới tới đợt sắp vào cửa sổ đăng
   * bài. Mở màn này lên mà thấy một đợt rỗng trong khi đợt bên cạnh có người đang chờ là cách chắc
   * chắn để bỏ sót họ.
   */
  const waveTabs = waves.map((w) => ({
    id: w.id,
    name: w.name,
    phase3: phase3Counts.get(w.id) ?? 0,
    hasWindow: !!w.postingOpensAt,
  }));

  const now = Date.now();
  const withPeople = waves.filter((w) => (phase3Counts.get(w.id) ?? 0) > 0);
  const withWindow = waves.filter((w) => w.postingClosesAt);
  const upcoming =
    withWindow.find((w) => (w.postingClosesAt as Date).getTime() >= now) ??
    withWindow[withWindow.length - 1];
  const requested = (await searchParams).wave;
  const selected =
    waves.find((w) => String(w.id) === requested) ?? withPeople[0] ?? upcoming ?? waves[0];

  if (!selected.postingOpensAt) {
    const waiting = phase3Counts.get(selected.id) ?? 0;
    return (
      <PageShell
        title="Lịch đăng bài Phase 3"
        subtitle="Ai nộp Phase 2 trước thì được khung giờ sớm"
      >
        <Card>
          <WaveTabs waves={waveTabs} selectedWaveId={selected.id} />
          {waiting > 0 && (
            <Alert tone="warning" title={`${waiting} bài đang chờ nhưng chưa xếp được`}>
              {selected.name} chưa có cửa sổ đăng bài, nên hệ thống không có khung giờ nào để xếp
              họ vào. Điền hai mốc mở và đóng cửa sổ đăng bài cho đợt này ở mục Đợt thi — chín
              khung giờ sẽ tự dựng và thí sinh được xếp ngay theo thứ tự nộp Phase 2.
            </Alert>
          )}
          <Empty
            icon={<CalendarIcon size={40} />}
            title={`${selected.name} chưa có cửa sổ đăng bài`}
            description="Điền hai mốc mở và đóng cửa sổ đăng bài ở mục Đợt thi. Hệ thống sẽ dựng đủ 9 khung giờ và tự xếp thí sinh vào."
            action={
              <Link href="/admin/waves">
                <Button variant="solid">Tới mục Đợt thi</Button>
              </Link>
            }
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
          waves={waveTabs}
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
