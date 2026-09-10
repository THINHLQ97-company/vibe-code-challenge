"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/dsvh/ui/Input";
import { Button } from "@/components/dsvh/ui/Button";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { InfoRow } from "@/components/dsvh/ui/data/InfoRow";

const TIER_LABEL: Record<number, string> = {
  4: "Bậc 4 — trên 200% trung vị (20đ)",
  3: "Bậc 3 — 120–200% trung vị (15đ)",
  2: "Bậc 2 — 70–119% trung vị (10đ)",
  1: "Bậc 1 — dưới 70% trung vị (5đ)",
};

export function ShareForm({
  submissionId,
  initialUrl,
  approved,
  approvedAt,
  engagementCount,
  engagementTier,
}: {
  submissionId: number;
  initialUrl: string;
  approved: boolean;
  approvedAt: string | null;
  engagementCount: number | null;
  engagementTier: number | null;
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

  return (
    <div className="space-y-4">
      {/* BGK duyệt xong là chốt link — API chặn đổi (`phase3` trả 409). Khoá luôn ô nhập ở đây
          thay vì để thí sinh gõ lại rồi mới ăn lỗi: giao diện phải nói cùng một luật với API. */}
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

      {error && <Alert tone="error">{error}</Alert>}

      <dl className="divide-y divide-stroke">
        <InfoRow
          label="BGK duyệt bài"
          value={
            approved ? (
              <span className="flex items-center gap-2">
                <Badge tone="success">Đã duyệt</Badge>
                {approvedAt && <span className="text-caption text-ink-2">{approvedAt}</span>}
              </span>
            ) : (
              <Badge tone="warning">Chờ BGK kiểm tra</Badge>
            )
          }
        />
        <InfoRow
          label="Tương tác sau 7 ngày"
          value={engagementCount != null ? String(engagementCount) : "Chưa đếm"}
          numeric
        />
        <InfoRow
          label="Bậc điểm lan tỏa"
          value={engagementTier ? TIER_LABEL[engagementTier] : "Chưa chốt"}
        />
      </dl>
    </div>
  );
}
