"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/dsvh/ui/Button";
import { Input } from "@/components/dsvh/ui/Input";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Note } from "@/components/dsvh/ui/data/Note";
import { ArrowSquareOutIcon } from "@/components/dsvh/icons";

export function PostRow({
  submission,
}: {
  submission: {
    id: number;
    productName: string;
    userName: string;
    facebookPostUrl: string;
    approvedAt: string | null;
    engagementCount: number | null;
    engagementTier: number | null;
    published: boolean;
    finalScore: number | null;
    missing: string[];
  };
}) {
  const router = useRouter();
  const [count, setCount] = useState(submission.engagementCount?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const blockers = [...submission.missing];
  if (submission.engagementTier == null) blockers.push("chưa chốt điểm lan tỏa");

  return (
    <div className="rounded-card border border-stroke bg-surface-2 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-body font-semibold text-ink">{submission.productName}</div>
          <div className="mt-0.5 text-caption text-ink-2">{submission.userName}</div>
        </div>
        <a
          href={submission.facebookPostUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-caption text-link hover:text-link-hover"
        >
          Mở bài đăng <ArrowSquareOutIcon size={14} />
        </a>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {submission.approvedAt ? (
          <Badge tone="success">Đã duyệt bài · {submission.approvedAt}</Badge>
        ) : (
          <Button variant="solid" size="sm" loading={loading} onClick={() => void call("approve-post")}>
            Duyệt bài đăng
          </Button>
        )}

        {submission.approvedAt && (
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Tương tác sau 7 ngày"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-52"
            />
            <Button
              variant="ghost"
              size="sm"
              loading={loading}
              disabled={!count}
              onClick={() => void call("engagement", { count: Number(count) })}
            >
              Lưu & tính bậc
            </Button>
            {submission.engagementTier != null && (
              <Badge tone="accent">Bậc {submission.engagementTier}/4</Badge>
            )}
          </div>
        )}
      </div>

      <div className="mt-3">
        {submission.published ? (
          <Badge tone="success">Đã công bố · {submission.finalScore}/100</Badge>
        ) : blockers.length > 0 ? (
          <Note tone="warning">Chưa công bố được: {blockers.join(" · ")}.</Note>
        ) : (
          <Button variant="solid" size="sm" loading={loading} onClick={() => void call("publish")}>
            Xác nhận & công bố kết quả
          </Button>
        )}
      </div>

      {error && (
        <div className="mt-3">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
    </div>
  );
}
