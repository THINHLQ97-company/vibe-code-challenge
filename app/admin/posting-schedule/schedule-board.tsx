"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Button } from "@/components/dsvh/ui/Button";
import { Input } from "@/components/dsvh/ui/Input";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Select } from "@/components/dsvh/ui/form/Select";
import { WaveTabs, type WaveTab } from "./wave-tabs";

export type BoardSlot = {
  id: number;
  dayIndex: number;
  period: "sang" | "chieu" | "toi";
  periodLabel: string;
  timeLabel: string;
  dateLabel: string;
  capacity: number;
  booked: number;
};

export type BoardEntry = {
  id: number;
  name: string;
  department: string;
  productName: string;
  slotId: number | null;
  submittedAt: string | null;
  posted: boolean;
  approved: boolean;
  rejected: boolean;
};

/**
 * Bảng lịch đăng bài: ba ngày × ba khung, mỗi ô là danh sách người sẽ được duyệt trong khung đó.
 *
 * Xếp theo NGÀY chứ không theo danh sách người, vì việc thật của ban tổ chức là trực duyệt theo
 * buổi: mở màn này lên, nhìn ô "Chiều ngày 2", duyệt đúng những người trong ô đó. Một bảng danh
 * sách phẳng có cột khung giờ thì vẫn phải tự lọc mỗi lần trực.
 */
export function ScheduleBoard({
  waves,
  selectedWaveId,
  slots,
  entries,
}: {
  waves: WaveTab[];
  selectedWaveId: number;
  slots: BoardSlot[];
  entries: BoardEntry[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const days = [...new Set(slots.map((s) => s.dayIndex))].sort((a, b) => a - b);
  const unassigned = entries.filter((e) => e.slotId == null);

  const slotOptions = [
    { value: "none", label: "— chưa xếp —" },
    ...slots.map((s) => ({
      value: String(s.id),
      label: `Ngày ${s.dayIndex} · ${s.periodLabel} (${s.booked}/${s.capacity})`,
    })),
  ];

  async function move(submissionId: number, value: string) {
    setError(null);
    setBusy(submissionId);
    try {
      const res = await fetch(`/api/admin/submissions/${submissionId}/posting-slot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: value === "none" ? null : Number(value) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không chuyển được khung giờ");
        return;
      }
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setBusy(null);
    }
  }

  async function setCapacity(slotId: number, capacity: number) {
    setError(null);
    setBusy(-slotId);
    try {
      const res = await fetch(`/api/admin/posting-slots/${slotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capacity }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không đổi được hạn mức");
        return;
      }
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <WaveTabs waves={waves} selectedWaveId={selectedWaveId} />

      {error && <Alert tone="error">{error}</Alert>}

      {days.map((day) => {
        const ofDay = slots.filter((s) => s.dayIndex === day);
        return (
          <div key={day}>
            <p className="mb-2 text-caption font-semibold text-ink">
              Ngày {day} · <span className="font-normal text-ink-3">{ofDay[0]?.dateLabel}</span>
            </p>
            <div className="grid gap-3 lg:grid-cols-3">
              {ofDay.map((slot) => {
                const people = entries.filter((e) => e.slotId === slot.id);
                const over = people.length > slot.capacity;
                return (
                  <div
                    key={slot.id}
                    className={`rounded-lg border p-3 ${
                      over ? "border-danger/45 bg-danger/10" : "border-stroke bg-surface-2"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <p className="text-body font-semibold text-ink">{slot.periodLabel}</p>
                        <p className="text-meta text-ink-3">{slot.timeLabel}</p>
                      </div>
                      <span
                        className={`text-caption font-semibold tabular-nums ${
                          over ? "text-danger" : "text-ink-2"
                        }`}
                      >
                        {people.length}/{slot.capacity}
                      </span>
                    </div>

                    {/* Hạn mức sửa được ngay tại ô: khi một khung kín mà vẫn còn người chờ, việc
                        phải làm là nới đúng khung đó — bắt đi sang màn khác để sửa một con số là
                        cắt ngang đúng lúc người ta đang nhìn thấy vấn đề. */}
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        defaultValue={String(slot.capacity)}
                        disabled={busy === -slot.id}
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (Number.isFinite(v) && v !== slot.capacity) void setCapacity(slot.id, v);
                        }}
                        className="w-20"
                      />
                      <span className="text-meta text-ink-3">suất</span>
                    </div>

                    <ul className="mt-2.5 space-y-1.5">
                      {people.length === 0 && (
                        <li className="text-caption text-ink-3">Chưa có ai trong khung này.</li>
                      )}
                      {people.map((p) => (
                        <li
                          key={p.id}
                          className="rounded-md border border-stroke-soft bg-surface px-2.5 py-2"
                        >
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-caption font-medium text-ink">{p.name}</span>
                            <span className="text-meta text-ink-3">{p.department}</span>
                            {p.approved ? (
                              <Badge tone="success">Đã lên nhóm</Badge>
                            ) : p.rejected ? (
                              <Badge tone="danger">Bị từ chối</Badge>
                            ) : p.posted ? (
                              <Badge tone="warning">Chờ duyệt</Badge>
                            ) : (
                              <Badge tone="neutral">Chưa gửi link</Badge>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-meta text-ink-3">
                            {p.productName}
                            {p.submittedAt ? ` · nộp Phase 2 ${p.submittedAt}` : ""}
                          </p>
                          {!p.approved && (
                            <div className="mt-1.5">
                              <Select
                                value={String(slot.id)}
                                onChange={(v) => void move(p.id, v)}
                                options={slotOptions}
                                disabled={busy === p.id}
                              />
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {unassigned.length > 0 && (
        <div className="rounded-lg border border-amber/45 bg-amber/10 p-3">
          <p className="text-caption font-semibold text-ink">
            Chưa có khung ({unassigned.length})
          </p>
          <ul className="mt-2 space-y-1.5">
            {unassigned.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-stroke-soft bg-surface px-2.5 py-2"
              >
                <span className="min-w-0">
                  <span className="text-caption font-medium text-ink">{p.name}</span>{" "}
                  <span className="text-meta text-ink-3">
                    {p.department}
                    {p.submittedAt ? ` · nộp Phase 2 ${p.submittedAt}` : " · chưa có mốc nộp"}
                  </span>
                </span>
                <span className="w-56 shrink-0">
                  <Select
                    value="none"
                    onChange={(v) => void move(p.id, v)}
                    options={slotOptions}
                    disabled={busy === p.id}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => router.refresh()}>
          Tải lại bảng
        </Button>
      </div>
    </div>
  );
}
