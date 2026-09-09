"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Submission, User } from "@/lib/db/schema";

export function PostRow({ submission }: { submission: Submission & { user: User } }) {
  const router = useRouter();
  const [count, setCount] = useState(submission.engagementCount?.toString() ?? "");
  const [loading, setLoading] = useState(false);

  async function approvePost() {
    setLoading(true);
    try {
      await fetch(`/api/admin/submissions/${submission.id}/approve-post`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function submitEngagement() {
    setLoading(true);
    try {
      await fetch(`/api/admin/submissions/${submission.id}/engagement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: Number(count) }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function publish() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}/publish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) alert(data.error);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-muted p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <b className="text-foreground">
          {submission.user.name} · {submission.productName}
        </b>
        <a
          href={submission.facebookPostUrl!}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-sm text-primary"
        >
          Xem bài đăng <ExternalLink size={13} />
        </a>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {submission.facebookApprovedAt ? (
          <Badge>
            <CheckCircle2 size={12} /> Đã duyệt bài
          </Badge>
        ) : (
          <Button size="sm" onClick={approvePost} disabled={loading}>
            Duyệt bài đăng
          </Button>
        )}

        {submission.facebookApprovedAt && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Số tương tác sau 7 ngày"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-48"
            />
            <Button size="sm" variant="outline" onClick={submitEngagement} disabled={loading || !count}>
              Lưu & tính bậc điểm
            </Button>
            {submission.engagementTier != null && (
              <Badge variant="secondary">Bậc {submission.engagementTier}/4</Badge>
            )}
          </div>
        )}

        {submission.securityStatus === "clean" && submission.facebookApprovedAt && !submission.publishedAt && (
          <Button size="sm" onClick={publish} disabled={loading}>
            Xác nhận & công bố kết quả
          </Button>
        )}
        {submission.publishedAt && (
          <Badge>
            <CheckCircle2 size={12} /> Đã công bố · {submission.finalScore}/100
          </Badge>
        )}
      </div>
    </div>
  );
}
