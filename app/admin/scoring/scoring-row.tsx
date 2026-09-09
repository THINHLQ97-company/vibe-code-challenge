"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { IdeaScore, ProductScore, Submission, User } from "@/lib/db/schema";

export function ScoringRow({
  submission,
  ideaScore,
  productScore,
}: {
  submission: Submission & { user: User };
  ideaScore: IdeaScore | undefined;
  productScore: ProductScore | undefined;
}) {
  const router = useRouter();
  const [giaTriUngDung, setGiaTriUngDung] = useState("");
  const [chatLuongKyThuat, setChatLuongKyThuat] = useState("");
  const [hoanThien, setHoanThien] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitIdea() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}/manual-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: 1, moduleScores: { giaTriUngDung: Number(giaTriUngDung) } }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function submitProduct() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}/manual-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase: 2,
          moduleScores: { chatLuongKyThuat: Number(chatLuongKyThuat), hoanThien: Number(hoanThien) },
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function sendFeedback(status: "needs_fix" | "approved") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback, status }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
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
        <Badge variant="secondary">Phase {submission.currentPhase}</Badge>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-sm font-bold text-foreground">Phase 1 · Ý tưởng (/25)</div>
          {ideaScore ? (
            <div className="mt-1 text-sm text-muted-foreground">
              {ideaScore.moduleScores.giaTriUngDung}/25 — {ideaScore.source}
            </div>
          ) : (
            <div className="mt-2 flex gap-2">
              <Input
                type="number"
                max={25}
                placeholder="/25"
                value={giaTriUngDung}
                onChange={(e) => setGiaTriUngDung(e.target.value)}
                className="w-20"
              />
              <Button size="sm" onClick={submitIdea} disabled={loading || !giaTriUngDung}>
                Nhập tay
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-sm font-bold text-foreground">Phase 2 · Kỹ thuật (/40) + Hoàn thiện (/15)</div>
          {productScore ? (
            <div className="mt-1 text-sm text-muted-foreground">
              KT: {productScore.moduleScores.chatLuongKyThuat}/40 · HT: {productScore.moduleScores.hoanThien}/15
              <br />
              Feedback status: <b>{productScore.feedbackStatus}</b>
            </div>
          ) : (
            <div className="mt-2 flex gap-2">
              <Input
                type="number"
                max={40}
                placeholder="/40"
                value={chatLuongKyThuat}
                onChange={(e) => setChatLuongKyThuat(e.target.value)}
                className="w-16"
              />
              <Input
                type="number"
                max={15}
                placeholder="/15"
                value={hoanThien}
                onChange={(e) => setHoanThien(e.target.value)}
                className="w-16"
              />
              <Button size="sm" onClick={submitProduct} disabled={loading || !chatLuongKyThuat || !hoanThien}>
                Nhập tay
              </Button>
            </div>
          )}
        </div>
      </div>

      {productScore && productScore.feedbackStatus !== "approved" && (
        <div className="mt-3 flex flex-col gap-2">
          <Textarea
            placeholder="Feedback cụ thể cho thí sinh (chỉ rõ điều cần sửa)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => sendFeedback("needs_fix")} disabled={loading || !feedback}>
              Yêu cầu sửa
            </Button>
            <Button size="sm" onClick={() => sendFeedback("approved")} disabled={loading || !feedback}>
              Duyệt đạt · qua Phase 3
            </Button>
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
