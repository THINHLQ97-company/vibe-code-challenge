"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { Submission, User } from "@/lib/db/schema";

export function TopicRow({ submission }: { submission: Submission & { user: User } }) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function approve() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}/approve`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function reject() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-card border border-stroke bg-surface-2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <b className="text-ink">
            {submission.user.name} · {submission.user.department}
          </b>
          <span className="ml-2 text-caption text-ink-2">{submission.productName}</span>
        </div>
        <Badge variant="secondary">{submission.topicGroup}</Badge>
      </div>
      <div className="mt-2 text-caption text-ink-2">{submission.problemDesc}</div>
      <ul className="mt-2 list-disc pl-5 text-caption text-ink-2">
        {submission.features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={approve} disabled={loading}>
          Duyệt
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowReject((v) => !v)} disabled={loading}>
          Trả về
        </Button>
      </div>
      {showReject && (
        <div className="mt-2 flex flex-col gap-2">
          <Textarea placeholder="Lý do trả về (bắt buộc)" value={note} onChange={(e) => setNote(e.target.value)} />
          <Button size="sm" variant="outline" onClick={reject} disabled={loading || !note.trim()} className="w-fit">
            Xác nhận trả về
          </Button>
        </div>
      )}
      {error && <p className="mt-2 text-caption text-destructive">{error}</p>}
    </div>
  );
}
