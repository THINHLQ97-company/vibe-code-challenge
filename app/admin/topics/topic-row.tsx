"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/dsvh/ui/Button";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Textarea } from "@/components/dsvh/ui/form/Textarea";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Note } from "@/components/dsvh/ui/data/Note";
import { InfoRow } from "@/components/dsvh/ui/data/InfoRow";
import { PrdViewer } from "@/components/prd-viewer";

export type PendingTopic = {
  id: number;
  productName: string;
  topicGroup: string;
  branch: string;
  problemDesc: string;
  targetUsers: string;
  prdContent: string | null;
  prdFileName: string | null;
  createdAt: string;
  userName: string;
  department: string;
};

export function TopicRow({ submission, capLeft }: { submission: PendingTopic; capLeft: number }) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function call(path: string, body?: unknown) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}/${path}`, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Thao tác thất bại");
        return;
      }
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-card border border-stroke bg-surface-2 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-body font-semibold text-ink">{submission.productName}</div>
          <div className="mt-0.5 text-caption text-ink-2">
            {submission.userName} · {submission.department} · nộp {submission.createdAt}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="neutral">Nhánh {submission.branch}</Badge>
          <Badge tone="neutral">{submission.topicGroup}</Badge>
        </div>
      </div>

      {/* `layout="stack"` chứ không phải mặc định `row`: thẻ này rộng gần hết màn hình, mà `row` là
          `justify-between` — nhãn dính mép trái, giá trị dính mép phải, ở giữa là một khoảng trống
          hàng ngàn pixel và mắt phải quét ngang cả màn để ghép một cặp. `stack` xếp nhãn trên giá
          trị dưới, hai cột, đọc theo chiều dọc tự nhiên. */}
      <dl className="mt-3 grid gap-x-6 gap-y-3 border-t border-stroke pt-3 sm:grid-cols-2">
        <InfoRow layout="stack" label="Bài toán" value={submission.problemDesc} wrap size="sm" />
        <InfoRow layout="stack" label="Người dùng" value={submission.targetUsers} wrap size="sm" />
        {/* "Chức năng", "Database", "Tự đánh giá rủi ro" đã ngưng thu thập ở form đăng ký
            (10/09/2026) — phạm vi và chức năng nay nằm trong tài liệu PRD ngay bên dưới. Giữ lại
            chỉ tạo ra một cột toàn dấu "—" khiến người duyệt tưởng thí sinh bỏ trống. */}
      </dl>

      <div className="mt-3">
        <PrdViewer content={submission.prdContent} fileName={submission.prdFileName} />
      </div>

      {capLeft === 0 && (
        <Note tone="warning" className="mt-3">
          Tuần này đã hết suất duyệt — hệ thống sẽ chặn nút Duyệt cho tới tuần sau.
        </Note>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="solid"
          size="sm"
          loading={loading}
          disabled={capLeft === 0}
          onClick={() => void call("approve")}
        >
          Duyệt đề tài
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowReject((v) => !v)}>
          Trả về sửa
        </Button>
      </div>

      {showReject && (
        <div className="mt-3 space-y-2">
          <Textarea
            label="Lý do trả về"
            hint="Phải chỉ rõ thiếu gì — nhận xét chung chung 'chưa đạt yêu cầu' không hợp lệ theo thể lệ"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button
            variant="danger"
            size="sm"
            loading={loading}
            disabled={note.trim().length < 3}
            onClick={() => void call("reject", { note })}
          >
            Xác nhận trả về
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-3">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
    </div>
  );
}
