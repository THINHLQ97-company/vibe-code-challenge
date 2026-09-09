"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/dsvh/ui/Button";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Textarea } from "@/components/dsvh/ui/form/Textarea";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Note } from "@/components/dsvh/ui/data/Note";
import { InfoRow } from "@/components/dsvh/ui/data/InfoRow";

export type PendingTopic = {
  id: number;
  productName: string;
  topicGroup: string;
  branch: string;
  problemDesc: string;
  targetUsers: string;
  databasePlan: string;
  features: string[];
  isPrebuiltRepo: boolean;
  requestedDeadlineDays: number;
  riskSelfAssessment: string | null;
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
          {submission.isPrebuiltRepo && <Badge tone="warning">Repo có sẵn — trần 20đ kỹ thuật</Badge>}
        </div>
      </div>

      <dl className="mt-3 divide-y divide-stroke">
        <InfoRow label="Bài toán" value={submission.problemDesc} wrap size="sm" />
        <InfoRow label="Người dùng" value={submission.targetUsers} wrap size="sm" />
        <InfoRow label="Chức năng" value={submission.features.join(" · ") || "—"} wrap size="sm" />
        <InfoRow label="Database" value={submission.databasePlan} wrap size="sm" />
        <InfoRow label="Hạn nộp xin" value={`${submission.requestedDeadlineDays} ngày`} size="sm" />
        {submission.riskSelfAssessment && (
          <InfoRow label="Tự đánh giá rủi ro" value={submission.riskSelfAssessment} wrap size="sm" />
        )}
      </dl>

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
