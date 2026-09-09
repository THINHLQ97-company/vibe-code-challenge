"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/dsvh/ui/Button";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Textarea } from "@/components/dsvh/ui/form/Textarea";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { GlobeIcon, GitBranchIcon } from "@/components/dsvh/icons";

export function SecurityRow({
  submission,
}: {
  submission: {
    id: number;
    productName: string;
    userName: string;
    securityStatus: "pending" | "clean" | "flagged";
    securityNote: string | null;
    vibehostUrl: string | null;
    githubRepoUrl: string | null;
  };
}) {
  const router = useRouter();
  const [note, setNote] = useState(submission.securityNote ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(status: "clean" | "flagged") {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}/security`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: status === "flagged" ? note : undefined }),
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

  const tone =
    submission.securityStatus === "clean"
      ? "success"
      : submission.securityStatus === "flagged"
        ? "danger"
        : "warning";
  const label =
    submission.securityStatus === "clean"
      ? "Sạch — đã qua cổng"
      : submission.securityStatus === "flagged"
        ? "Bị gắn cờ"
        : "Chưa rà soát";

  return (
    <div className="rounded-card border border-stroke bg-surface-2 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-body font-semibold text-ink">{submission.productName}</div>
          <div className="mt-0.5 text-caption text-ink-2">{submission.userName}</div>
        </div>
        <Badge tone={tone}>{label}</Badge>
      </div>

      <div className="mt-2 flex flex-wrap gap-3 text-caption">
        {submission.vibehostUrl && (
          <a
            href={submission.vibehostUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-link hover:text-link-hover"
          >
            <GlobeIcon size={14} /> Mở sản phẩm
          </a>
        )}
        {submission.githubRepoUrl && (
          <a
            href={submission.githubRepoUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-link hover:text-link-hover"
          >
            <GitBranchIcon size={14} /> Soi mã nguồn
          </a>
        )}
      </div>

      {submission.securityStatus === "flagged" && submission.securityNote && (
        <div className="mt-3">
          <Alert tone="warning" title="Lý do gắn cờ">
            {submission.securityNote}
          </Alert>
        </div>
      )}

      {submission.securityStatus !== "clean" && (
        <div className="mt-3 space-y-2">
          <Textarea
            label="Ghi rõ vi phạm điều nào (nếu gắn cờ)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="solid" size="sm" loading={loading} onClick={() => void setStatus("clean")}>
              Cho qua cổng
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={loading}
              disabled={note.trim().length < 3}
              onClick={() => void setStatus("flagged")}
            >
              Gắn cờ
            </Button>
          </div>
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
