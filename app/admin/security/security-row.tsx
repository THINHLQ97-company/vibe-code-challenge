"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { Submission, User } from "@/lib/db/schema";

export function SecurityRow({ submission }: { submission: Submission & { user: User } }) {
  const router = useRouter();
  const [note, setNote] = useState(submission.securityNote ?? "");
  const [loading, setLoading] = useState(false);

  async function setStatus(status: "clean" | "flagged") {
    setLoading(true);
    try {
      await fetch(`/api/admin/submissions/${submission.id}/security`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: status === "flagged" ? note : undefined }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const badgeVariant =
    submission.securityStatus === "clean"
      ? "default"
      : submission.securityStatus === "flagged"
        ? "destructive"
        : "secondary";

  return (
    <div className="rounded-card border border-border bg-muted p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <b className="text-foreground">
          {submission.user.name} · {submission.productName}
        </b>
        <Badge variant={badgeVariant}>{submission.securityStatus}</Badge>
      </div>
      {submission.securityStatus !== "clean" && (
        <div className="mt-3 flex flex-col gap-2">
          <Textarea placeholder="Ghi rõ vi phạm điều nào (nếu gắn cờ)" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setStatus("clean")} disabled={loading}>
              Sạch — cho qua
            </Button>
            <Button size="sm" variant="outline" onClick={() => setStatus("flagged")} disabled={loading || !note}>
              Gắn cờ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
