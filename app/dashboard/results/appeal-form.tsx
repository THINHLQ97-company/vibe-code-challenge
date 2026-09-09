"use client";

import { useState, type FormEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function AppealForm({ submissionId }: { submissionId: number }) {
  const [criteria, setCriteria] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/appeals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criteria, evidenceUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gửi thất bại");
        return;
      }
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return <p className="text-body text-teal-strong">✓ Đã gửi phản biện — BTC phản hồi trong ≤48h.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <p className="text-caption text-ink-2">
        Chỉ 1 lần, phải có bằng chứng kiểm chứng được (link chức năng chạy, commit, video, ảnh
        màn hình). Điểm chủ quan (Giá trị ứng dụng/Lan tỏa) chỉ nhận nếu có bằng chứng mới.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="criteria">Tiêu chí muốn phản biện</Label>
        <Textarea
          id="criteria"
          placeholder="VD: chức năng X thực ra có chạy, máy chấm nhầm"
          value={criteria}
          onChange={(e) => setCriteria(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="evidenceUrl">Link bằng chứng</Label>
        <Input
          id="evidenceUrl"
          type="url"
          placeholder="Link video/ảnh/commit"
          value={evidenceUrl}
          onChange={(e) => setEvidenceUrl(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-caption text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="w-fit">
        {loading ? "Đang gửi..." : "Gửi phản biện"}
      </Button>
    </form>
  );
}
