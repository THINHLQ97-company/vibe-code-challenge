"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/dsvh/ui/Button";
import { Checkbox } from "@/components/dsvh/ui/form/Checkbox";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { CheckCircleIcon } from "@/components/dsvh/icons";
import { TopicRow, type PendingTopic } from "./topic-row";

/**
 * Danh sách đề tài chờ duyệt, có chọn nhiều để duyệt một lượt.
 *
 * Gom thanh chọn và danh sách vào CÙNG một component client vì cả hai dùng chung một mẩu trạng
 * thái. Tách ra rồi truyền qua lại là chỗ dễ lệch nhất: thanh nói "đã chọn 5" trong khi danh sách
 * đang tick 4 ô.
 *
 * Mỗi đề tài vẫn giữ nút duyệt riêng — duyệt hàng loạt để xử nhanh một lô đã đọc xong, không thay
 * cho việc đọc từng bài.
 */
export function TopicsList({ topics, capLeft }: { topics: PendingTopic[]; capLeft: number }) {
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<{ approved: number; lines: string[] } | null>(null);

  const ids = topics.map((t) => t.id);
  const allSelected = ids.length > 0 && selected.length === ids.length;

  function toggle(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function approveSelected() {
    setReport(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/submissions/approve-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReport({ approved: 0, lines: [data.error ?? "Không duyệt được"] });
        return;
      }
      const names = new Map(topics.map((t) => [t.id, t.productName]));
      const lines = (data.results as Array<{ id: number; ok: boolean; error?: string }>)
        .filter((r) => !r.ok)
        .map((r) => `${names.get(r.id) ?? `Bài #${r.id}`}: ${r.error}`);
      setReport({ approved: data.approved, lines });
      setSelected([]);
      router.refresh();
    } catch {
      setReport({ approved: 0, lines: ["Không kết nối được máy chủ"] });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {report && (
        <Alert
          tone={report.lines.length > 0 ? "warning" : "success"}
          title={`Đã duyệt ${report.approved} đề tài${report.lines.length > 0 ? `, ${report.lines.length} đề tài chưa qua` : ""}`}
        >
          {report.lines.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {report.lines.map((l) => (
                <li key={l} className="text-caption">
                  · {l}
                </li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      {/* Thanh chọn đặt TRÊN danh sách: danh sách dài hơn một màn hình, để dưới đáy thì phải cuộn
          hết mới thấy thứ mình vừa chọn. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stroke bg-surface-2 px-3 py-2">
        <Checkbox
          checked={allSelected}
          onChange={(v) => setSelected(v ? [...ids] : [])}
          label={selected.length > 0 ? `Đã chọn ${selected.length}/${ids.length}` : "Chọn tất cả"}
        />
        {selected.length > 0 && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
              Bỏ chọn
            </Button>
            <Button
              variant="solid"
              size="sm"
              loading={busy}
              disabled={capLeft === 0}
              leftIcon={<CheckCircleIcon size={15} />}
              onClick={() => void approveSelected()}
            >
              Duyệt {selected.length} đề tài
            </Button>
          </div>
        )}
      </div>

      {topics.map((t) => (
        <TopicRow
          key={t.id}
          submission={t}
          capLeft={capLeft}
          selected={selected.includes(t.id)}
          onToggle={() => toggle(t.id)}
        />
      ))}
    </div>
  );
}
