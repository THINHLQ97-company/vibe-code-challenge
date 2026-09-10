"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/dsvh/ui/Button";
import { Textarea } from "@/components/dsvh/ui/form/Textarea";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Note } from "@/components/dsvh/ui/data/Note";
import { GitBranchIcon } from "@/components/dsvh/icons";

/**
 * Gắn cờ bài dùng repo/mẫu có sẵn — vi phạm thể lệ, chặn qua Phase 2.
 *
 * Bắt buộc ghi căn cứ: đây là cáo buộc làm hỏng bài của một người, và thí sinh có quyền phản biện
 * kèm bằng chứng. Không có căn cứ ghi lại thì lúc phản biện chẳng ai đối chiếu vào đâu.
 */
export function PrebuiltPanel({
  submissionId,
  flagged,
  note,
}: {
  submissionId: number;
  flagged: boolean;
  note: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(prebuilt: boolean) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submissionId}/prebuilt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prebuilt, note: prebuilt ? text : undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Thao tác thất bại");
        return;
      }
      setOpen(false);
      setText("");
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setLoading(false);
    }
  }

  if (flagged) {
    return (
      <div className="space-y-2">
        <Alert tone="error" title="Đã gắn cờ: dùng repo/mẫu có sẵn">
          {note ?? "Không có căn cứ ghi lại."}
        </Alert>
        <p className="text-caption text-ink-2">
          Bài này không duyệt đạt Phase 2 và không công bố được cho tới khi gỡ cờ.
        </p>
        <Button variant="ghost" size="sm" loading={loading} onClick={() => void send(false)}>
          Gỡ cờ — gắn nhầm
        </Button>
        {error && <Alert tone="error">{error}</Alert>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-caption text-ink-2">
          <GitBranchIcon size={15} className="text-ink-3" />
          Soi lịch sử commit: bài phải được tự dựng mới trong kỳ thi.
        </span>
        {!open && (
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
            Gắn cờ dùng repo có sẵn
          </Button>
        )}
      </div>

      {open && (
        <div className="space-y-2 rounded-lg border border-stroke bg-surface-2 p-3">
          <Textarea
            label="Căn cứ"
            hint="Commit nào, repo gốc nào, dấu hiệu gì — thí sinh đọc đúng dòng này khi phản biện"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Note tone="danger">
            Gắn cờ là bài KHÔNG qua Phase 2: hạ trạng thái về &quot;cần sửa&quot;, gỡ cờ KPI và
            chặn công bố kết quả.
          </Note>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="danger"
              size="sm"
              loading={loading}
              disabled={text.trim().length < 10}
              onClick={() => void send(true)}
            >
              Xác nhận gắn cờ
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Huỷ
            </Button>
          </div>
          {error && <Alert tone="error">{error}</Alert>}
        </div>
      )}
    </div>
  );
}
