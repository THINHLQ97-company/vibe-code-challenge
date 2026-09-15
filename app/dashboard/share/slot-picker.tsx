"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Badge } from "@/components/dsvh/ui/Badge";
import { CheckCircleIcon } from "@/components/dsvh/icons";

export type PickerSlot = {
  id: number;
  dayIndex: number;
  period: "sang" | "chieu" | "toi";
  periodLabel: string;
  timeLabel: string;
  dateLabel: string;
  capacity: number;
  booked: number;
  remaining: number;
};

/**
 * Chọn khung giờ để ban tổ chức duyệt bài lên nhóm.
 *
 * Bài đăng lên nhóm phải qua duyệt mới hiện. Nếu cả đợt cùng chờ duyệt một lúc thì bài lên sau
 * trôi mất khỏi bảng tin, mà điểm lan tỏa lại so theo trung vị — nên thứ tự duyệt sẽ quyết định
 * điểm thay cho chất lượng bài. Hạn mức từng khung là cách giữ cho mọi bài có cơ hội ngang nhau.
 *
 * Khung đã kín vẫn BẤM ĐƯỢC: hệ thống đẩy sang khung kế tiếp còn chỗ rồi báo lại đã chuyển đi đâu.
 * Khoá cứng ô đã kín nghĩa là người bấm chậm vài giây phải tự dò lại cả bảng.
 */
export function SlotPicker({
  submissionId,
  slots,
  selectedSlotId,
  locked,
}: {
  submissionId: number;
  slots: PickerSlot[];
  selectedSlotId: number | null;
  locked: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [movedTo, setMovedTo] = useState<string | null>(null);

  async function pick(slotId: number) {
    if (locked || saving) return;
    setError(null);
    setMovedTo(null);
    setSaving(slotId);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/posting-slot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Đặt khung giờ thất bại");
        return;
      }
      if (data.moved) setMovedTo(data.label);
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setSaving(null);
    }
  }

  const days = [...new Set(slots.map((s) => s.dayIndex))].sort((a, b) => a - b);

  return (
    <div>
      <div className="space-y-2.5">
        {days.map((day) => {
          const ofDay = slots.filter((s) => s.dayIndex === day);
          return (
            <div key={day}>
              <p className="mb-1.5 text-caption text-ink-3">
                Ngày {day} · <span className="tabular-nums">{ofDay[0]?.dateLabel}</span>
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {ofDay.map((s) => {
                  const picked = s.id === selectedSlotId;
                  const full = s.remaining <= 0 && !picked;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => pick(s.id)}
                      disabled={locked || saving != null}
                      aria-pressed={picked}
                      className={`rounded-lg border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        picked
                          ? "border-teal bg-teal/12"
                          : full
                            ? "border-stroke bg-surface-2 hover:border-stroke-strong"
                            : "border-stroke bg-surface hover:border-orange/50"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-body font-semibold text-ink">{s.periodLabel}</span>
                        {picked ? (
                          <CheckCircleIcon size={16} className="text-teal" />
                        ) : full ? (
                          <Badge tone="neutral">Đã kín</Badge>
                        ) : (
                          <span className="text-caption tabular-nums text-ink-2">
                            còn {s.remaining}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-caption text-ink-3">{s.timeLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-2.5 text-caption text-ink-3">
        Chọn một khung đã kín cũng được — hệ thống tự chuyển bạn sang khung còn chỗ gần nhất sau đó.
      </p>

      {movedTo && (
        <div className="mt-2">
          <Alert tone="warning" title="Khung bạn chọn đã kín">
            Bạn được chuyển sang <b>{movedTo}</b>. Muốn khung khác thì chọn lại bên trên.
          </Alert>
        </div>
      )}
      {error && (
        <div className="mt-2">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      {locked && selectedSlotId && (
        <p className="mt-2 text-caption text-ink-3">
          Bạn đã gửi link bài đăng nên khung giờ được giữ nguyên. Cần đổi thì báo ban tổ chức.
        </p>
      )}
    </div>
  );
}
