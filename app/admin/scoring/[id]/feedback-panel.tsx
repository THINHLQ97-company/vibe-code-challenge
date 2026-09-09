"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/dsvh/ui/Button";
import { Textarea } from "@/components/dsvh/ui/form/Textarea";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Note } from "@/components/dsvh/ui/data/Note";

export function FeedbackPanel({
  submissionId,
  status,
  feedback,
  hasProductScore,
}: {
  submissionId: number;
  status: string;
  feedback: string | null;
  hasProductScore: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState(feedback ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(next: "needs_fix" | "approved") {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submissionId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: text, status: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không gửi được phản hồi");
        return;
      }
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setLoading(false);
    }
  }

  if (!hasProductScore) {
    return <Note>Chấm điểm Phase 2 trước rồi mới gửi phản hồi được.</Note>;
  }

  return (
    <div className="space-y-3">
      {status === "approved" && (
        <Alert tone="success" title="Đã duyệt đạt Phase 2">
          {feedback}
        </Alert>
      )}
      {status === "needs_fix" && (
        <Alert tone="warning" title="Đã yêu cầu thí sinh chỉnh sửa">
          {feedback}
        </Alert>
      )}

      <Textarea
        label="Phản hồi cho thí sinh"
        hint="Chỉ rõ điểm cần sửa — nhận xét chung chung không giúp thí sinh sửa được"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          loading={loading}
          disabled={text.trim().length < 3}
          onClick={() => void send("needs_fix")}
        >
          Yêu cầu sửa
        </Button>
        <Button
          variant="solid"
          size="sm"
          loading={loading}
          disabled={text.trim().length < 3}
          onClick={() => void send("approved")}
        >
          Duyệt đạt · mở Phase 3
        </Button>
      </div>
      {error && <Alert tone="error">{error}</Alert>}
    </div>
  );
}
