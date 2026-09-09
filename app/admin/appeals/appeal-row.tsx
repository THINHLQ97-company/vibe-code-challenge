"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { Appeal, Submission, User } from "@/lib/db/schema";

export function AppealRow({
  appeal,
}: {
  appeal: Appeal & { submission: Submission & { user: User } };
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function resolve(status: "accepted" | "rejected") {
    setLoading(true);
    try {
      await fetch(`/api/admin/appeals/${appeal.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: note || "Đã xử lý" }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-muted p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <b className="text-foreground">
          {appeal.submission.user.name} · {appeal.submission.productName}
        </b>
        <Badge variant={appeal.status === "pending" ? "secondary" : "default"}>{appeal.status}</Badge>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{appeal.criteria}</div>
      <a
        href={appeal.evidenceUrl}
        target="_blank"
        rel="noreferrer"
        className="flex w-fit items-center gap-1 text-sm text-primary"
      >
        Xem bằng chứng <ExternalLink size={13} />
      </a>
      {appeal.status === "pending" && (
        <div className="mt-3 flex flex-col gap-2">
          <Textarea placeholder="Ghi chú xử lý" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => resolve("accepted")} disabled={loading}>
              Chấp nhận
            </Button>
            <Button size="sm" variant="outline" onClick={() => resolve("rejected")} disabled={loading}>
              Từ chối
            </Button>
          </div>
        </div>
      )}
      {appeal.resolutionNote && (
        <div className="mt-2 text-sm text-subtle">Ghi chú: {appeal.resolutionNote}</div>
      )}
    </div>
  );
}
