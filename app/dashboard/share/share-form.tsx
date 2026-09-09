"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ShareForm({
  submissionId,
  initialUrl,
  approved,
  engagementCount,
  engagementTier,
}: {
  submissionId: number;
  initialUrl: string;
  approved: boolean;
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="facebookPostUrl">Link bài đăng (ẩn danh)</Label>
          <Input
            id="facebookPostUrl"
            type="url"
            placeholder="https://facebook.com/groups/.../posts/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Đang gửi..." : "Gửi link bài"}
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-2 text-sm">
        <Badge variant={approved ? "default" : "secondary"}>
          {approved && <CheckCircle2 size={12} />}
          {approved ? "BGK đã duyệt bài" : "Chờ BGK duyệt"}
        </Badge>
        {engagementCount != null && (
          <span className="text-muted-foreground">
            Tương tác: {engagementCount} · Bậc điểm: {engagementTier ?? "—"}/4
          </span>
        )}
      </div>
    </div>
  );
}
