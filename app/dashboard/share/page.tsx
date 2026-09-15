import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { formatDateVN, formatDateTimeVN } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Button } from "@/components/dsvh/ui/Button";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Note } from "@/components/dsvh/ui/data/Note";
import { NotepadIcon, HourglassIcon } from "@/components/dsvh/icons";
import { listSlotsForWave } from "@/lib/db/queries/posting-slots";
import { periodLabel, periodTimeLabel } from "@/lib/contest-schedule";
import { ShareForm } from "./share-form";
import type { PickerSlot } from "./slot-picker";

export const metadata = { title: "Chia sẻ & lan tỏa" };

export default async function SharePage() {
  const session = await getSession();
  const submission = session ? await getCurrentSubmissionForUser(session.userId) : null;

  if (!submission) {
    return (
      <PageShell title="Chia sẻ & lan tỏa">
        <Card>
          <Empty
            icon={<NotepadIcon size={40} />}
            title="Bạn chưa có đề tài"
            description="Đăng ký đề tài trước khi tới bước chia sẻ."
            action={
              <Link href="/dashboard/register">
                <Button variant="solid">Đăng ký đề tài</Button>
              </Link>
            }
          />
        </Card>
      </PageShell>
    );
  }

  if (submission.currentPhase < 3) {
    return (
      <PageShell title="Chia sẻ & lan tỏa">
        <Card>
          <Empty
            icon={<HourglassIcon size={40} />}
            title="Chưa tới bước chia sẻ"
            description="BTC cần duyệt Phase 2 (sản phẩm & mã nguồn) trước. Đăng bài sớm hơn sẽ không được tính điểm lan tỏa."
            action={
              <Link href="/dashboard/build">
                <Button variant="ghost">Xem trạng thái nộp bài</Button>
              </Link>
            }
          />
        </Card>
      </PageShell>
    );
  }

  /**
   * Bài từng bị trả về ở Phase 2 phải qua VÒNG RÀ LẠI mới được đăng bài.
   *
   * Vòng này không chấm lại điểm — chỉ xác nhận bản sửa đã đạt chuẩn. Cho đăng khi chưa rà xong
   * nghĩa là một bài còn lỗi nghiêm trọng vẫn được mang ra nhóm cộng đồng, và lúc đó gỡ xuống thì
   * người ta đã đọc rồi.
   */
  if (submission.recheckStatus === "pending") {
    return (
      <PageShell title="Chia sẻ & lan tỏa">
        <Card>
          <Empty
            icon={<HourglassIcon size={40} />}
            title="Đang rà lại bản sửa của bạn"
            description="Bài của bạn từng được yêu cầu chỉnh sửa. Hệ thống đang kiểm tra bản sửa xem đã đạt chuẩn chưa — xong bước này bạn mới đăng bài được. Thường mất không lâu."
            action={
              <Link href="/dashboard/build">
                <Button variant="ghost">Xem lại bài đã nộp</Button>
              </Link>
            }
          />
        </Card>
      </PageShell>
    );
  }

  if (submission.recheckStatus === "failed") {
    return (
      <PageShell title="Chia sẻ & lan tỏa">
        <Alert tone="error" title="Bản sửa chưa đạt — chưa vào được bước chia sẻ">
          {submission.recheckNote ?? "Ban tổ chức chưa ghi rõ lý do — liên hệ ban tổ chức."}
        </Alert>
        <Card>
          <Empty
            icon={<HourglassIcon size={40} />}
            title="Sửa tiếp rồi nộp lại"
            description="Những điểm nêu ở trên vẫn chưa được xử lý. Sửa xong nộp lại ở mục Nộp bài, hệ thống sẽ rà lại."
            action={
              <Link href="/dashboard/build">
                <Button variant="solid">Về mục nộp bài</Button>
              </Link>
            }
          />
        </Card>
      </PageShell>
    );
  }

  /**
   * Khung giờ chỉ có nghĩa khi bài thuộc một đợt CÓ lịch đăng bài. Bài của dữ liệu cũ không thuộc
   * đợt nào thì luồng lan tỏa vẫn chạy như trước, chỉ thiếu bước đặt chỗ.
   */
  const slotRows = submission.waveId ? await listSlotsForWave(submission.waveId) : [];
  const slots: PickerSlot[] = slotRows.map((s) => ({
    id: s.id,
    dayIndex: s.dayIndex,
    period: s.period,
    periodLabel: periodLabel(s.period),
    timeLabel: periodTimeLabel(s.period),
    dateLabel: formatDateVN(s.startsAt),
    capacity: s.capacity,
    booked: s.booked,
    remaining: s.remaining,
  }));
  const picked = slots.find((s) => s.id === submission.postingSlotId) ?? null;

  return (
    <PageShell
      title="Chia sẻ & lan tỏa"
      subtitle="Phase 3: điểm lan tỏa tính theo tương tác 7 ngày, so với trung vị các bài cùng đợt thi"
    >
      <Card>
        <CardHeader
          title="Các bước của vòng lan tỏa"
          subtitle="Bước nào đang chờ bạn, bước nào đang chờ BTC — nhìn màu và số thứ tự là biết"
        />
        <ShareForm
          submissionId={submission.id}
          initialUrl={submission.facebookPostUrl ?? ""}
          approved={!!submission.facebookApprovedAt}
          approvedAt={
            submission.facebookApprovedAt ? formatDateVN(submission.facebookApprovedAt) : null
          }
          engagementCount={submission.engagementCount}
          engagementTier={submission.engagementTier}
          slots={slots}
          selectedSlotId={submission.postingSlotId}
          selectedSlotLabel={
            picked ? `${picked.periodLabel} ${picked.dateLabel} · ${picked.timeLabel}` : null
          }
          checklistAckedAt={
            submission.phase3ChecklistAckedAt
              ? formatDateTimeVN(submission.phase3ChecklistAckedAt)
              : null
          }
        />
        <Note tone="warning" className="mt-4">
          Ràng buộc nội dung bài đăng: không nhắc Mắt Bão, không để lộ bạn đang làm ở Mắt Bão, không
          đặt link bấm được trong thân bài (đưa link xuống bình luận), và bài phải kể được quá trình
          làm — chỗ vấp, cách xử lý.
        </Note>
      </Card>
    </PageShell>
  );
}
