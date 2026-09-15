"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/dsvh/ui/Input";
import { Button } from "@/components/dsvh/ui/Button";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Progress } from "@/components/dsvh/ui/Progress";
import {
  CheckCircleIcon,
  CircleIcon,
  HourglassIcon,
  ArrowSquareOutIcon,
  MegaphoneIcon,
} from "@/components/dsvh/icons";
import { ENGAGEMENT_TIERS } from "@/lib/scoring-rubric";
import { SlotPicker, type PickerSlot } from "./slot-picker";

// Bảng bậc lấy từ barem chung. Gõ lại ở đây là cách chắc chắn nhất để một ngày nào đó màn này
// hứa với thí sinh một thang điểm khác thang mà hệ thống thật sự cộng.
const TIERS = ENGAGEMENT_TIERS;

type StepState = "done" | "current" | "waiting";

/**
 * Bước lan tỏa là một CHUỖI nối nhau: đặt khung giờ → đăng bài và dán link → ban tổ chức duyệt cho
 * bài lên nhóm đúng khung đã đặt → đếm 7 ngày ra bậc điểm.
 *
 * Bản trước đổ cả ba thành một form cộng ba hàng nhãn↔giá trị phẳng, nên nhìn vào không biết mình
 * đang ở đâu trong chuỗi, việc nào đang chờ mình và việc nào đang chờ BTC. Nay mỗi bước là một
 * khối có trạng thái riêng, và bậc điểm hiện thành thang có đánh dấu bậc mình đạt.
 */
export function ShareForm({
  submissionId,
  initialUrl,
  approved,
  approvedAt,
  engagementCount,
  engagementTier,
  slots,
  selectedSlotId,
  selectedSlotLabel,
}: {
  submissionId: number;
  initialUrl: string;
  approved: boolean;
  approvedAt: string | null;
  engagementCount: number | null;
  engagementTier: number | null;
  slots: PickerSlot[];
  selectedSlotId: number | null;
  selectedSlotLabel: string | null;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/phase3`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facebookPostUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gửi thất bại");
        return;
      }
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setLoading(false);
    }
  }

  const posted = !!initialUrl;
  const scored = engagementTier != null;

  /**
   * Đợt chưa có cửa sổ đăng bài thì KHÔNG hiện bước đặt khung giờ.
   *
   * Hiện một bước rỗng nói "chưa có khung nào" chỉ làm thí sinh tưởng mình đang bị chặn, trong khi
   * thứ còn thiếu nằm ở phía ban tổ chức.
   */
  const hasSlots = slots.length > 0;
  const booked = selectedSlotId != null;
  const steps = hasSlots ? [booked, posted, approved, scored] : [posted, approved, scored];
  const done = steps.filter(Boolean).length;
  const total = steps.length;
  let n = 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline justify-between text-caption">
          <span className="text-ink-2">Tiến độ bước lan tỏa</span>
          <span className="font-semibold tabular-nums text-ink">
            {done}/{total}
          </span>
        </div>
        <Progress value={(done / total) * 100} tone="teal" className="mt-1.5" />
      </div>

      {hasSlots && (
        <Step
          index={++n}
          title="Đặt khung giờ đăng bài"
          state={booked ? "done" : "current"}
          hint="Ban tổ chức duyệt bài lên nhóm theo từng khung giờ. Đặt trước một khung để bài của bạn có chỗ."
        >
          {booked && selectedSlotLabel && (
            <p className="mb-2.5 text-caption text-ink-2">
              Khung đã đặt: <b className="text-ink">{selectedSlotLabel}</b>
            </p>
          )}
          <SlotPicker
            submissionId={submissionId}
            slots={slots}
            selectedSlotId={selectedSlotId}
            locked={posted && booked}
          />
        </Step>
      )}

      <Step
        index={++n}
        title="Đăng bài rồi dán link vào đây"
        state={posted ? "done" : hasSlots && !booked ? "waiting" : "current"}
        hint={
          hasSlots
            ? 'Đăng ẩn danh lên nhóm "Vibe Coding chưa?" — bài sẽ nằm chờ duyệt — rồi dán link vào đây.'
            : 'Đăng ẩn danh lên nhóm "Vibe Coding chưa?" rồi dán link vào đây.'
        }
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            className="flex-1"
            label="Link bài đăng (ẩn danh)"
            type="url"
            placeholder="https://facebook.com/groups/.../posts/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={approved}
            hint={approved ? "BGK đã duyệt bài này — không đổi link được nữa." : undefined}
            required
          />
          {!approved && (
            <Button type="submit" variant="solid" loading={loading}>
              {initialUrl ? "Cập nhật link" : "Gửi link bài"}
            </Button>
          )}
        </form>
        {posted && (
          <a
            href={initialUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-caption text-link hover:text-link-hover"
          >
            Mở bài đăng của bạn <ArrowSquareOutIcon size={13} />
          </a>
        )}
        {error && (
          <div className="mt-2">
            <Alert tone="error">{error}</Alert>
          </div>
        )}
      </Step>

      <Step
        index={++n}
        title="Ban tổ chức duyệt cho bài lên nhóm"
        state={approved ? "done" : posted ? "current" : "waiting"}
        hint="Ban tổ chức kiểm tra bài có đúng ràng buộc nội dung không, rồi cho lên nhóm trong khung giờ bạn đã đặt. Từ lúc đó mới bắt đầu đếm 7 ngày."
      >
        {approved ? (
          <span className="flex flex-wrap items-center gap-2 text-caption text-ink-2">
            <Badge tone="success">Đã duyệt</Badge>
            {approvedAt && <span>từ {approvedAt} — cửa sổ đếm 7 ngày bắt đầu từ đây</span>}
          </span>
        ) : posted ? (
          <span className="flex items-center gap-1.5 text-caption text-ink-2">
            <HourglassIcon size={14} className="text-ink-3" />
            Đang chờ BGK kiểm tra. Chưa cần làm gì thêm.
          </span>
        ) : (
          <span className="text-caption text-ink-3">Dán link ở bước 1 trước.</span>
        )}
      </Step>

      <Step
        index={++n}
        title="Đếm tương tác & chốt bậc điểm"
        state={scored ? "done" : approved ? "current" : "waiting"}
        hint="Điểm lan tỏa chấm theo bậc, so trung vị các bài đăng cùng khung giờ trong tuần."
      >
        {engagementCount != null && (
          <p className="mb-2 text-caption text-ink-2">
            Tương tác ghi nhận sau 7 ngày:{" "}
            <span className="font-semibold tabular-nums text-ink">{engagementCount}</span>
          </p>
        )}
        <ul className="space-y-1.5">
          {TIERS.map((t) => {
            const hit = engagementTier === t.tier;
            return (
              <li
                key={t.tier}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-caption ${
                  hit ? "border-teal bg-teal/12 text-ink" : "border-stroke bg-surface-2 text-ink-2"
                }`}
              >
                <span className="flex items-center gap-2">
                  {hit ? (
                    <CheckCircleIcon size={15} className="text-teal" />
                  ) : (
                    <CircleIcon size={15} className="text-ink-3" />
                  )}
                  Bậc {t.tier} — {t.label}
                </span>
                <span className="font-semibold tabular-nums">{t.point}đ</span>
              </li>
            );
          })}
        </ul>
        {!scored && (
          <p className="mt-2 flex items-center gap-1.5 text-caption text-ink-3">
            <MegaphoneIcon size={14} />
            {approved
              ? "Đang trong cửa sổ đếm 7 ngày — bậc điểm hiện khi BTC chốt."
              : "Bậc điểm chốt sau khi BGK duyệt bài và đếm đủ 7 ngày."}
          </p>
        )}
      </Step>
    </div>
  );
}

function Step({
  index,
  title,
  state,
  hint,
  children,
}: {
  index: number;
  title: string;
  state: StepState;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-card border p-4 ${
        state === "current" ? "border-orange/40 bg-surface" : "border-stroke bg-surface-2"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid size-7 shrink-0 place-items-center rounded-full text-meta font-semibold ${
            state === "done"
              ? "bg-teal/15 text-teal-strong"
              : state === "current"
                ? "bg-orange/15 text-orange-strong"
                : "bg-stroke-soft text-ink-3"
          }`}
        >
          {state === "done" ? <CheckCircleIcon size={16} /> : index}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-body font-semibold text-ink">{title}</h3>
            {state === "waiting" && <Badge tone="neutral">Chưa tới</Badge>}
          </div>
          <p className="mt-0.5 text-caption text-ink-3">{hint}</p>
          <div className="mt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
