"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function BuildForm({
  submissionId,
  initialVibehostUrl,
  initialGithubRepoUrl,
  githubVerified,
}: {
  submissionId: number;
  initialVibehostUrl: string;
  initialGithubRepoUrl: string;
  githubVerified: boolean;
}) {
  const router = useRouter();
  const [vibehostUrl, setVibehostUrl] = useState(initialVibehostUrl);
  const [githubRepoUrl, setGithubRepoUrl] = useState(initialGithubRepoUrl);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(githubVerified);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/phase2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibehostUrl, githubRepoUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gửi thất bại");
        return;
      }
      setVerified(!!data.githubVerified);
      if (!data.githubVerified) {
        setError(data.githubError ?? "Chưa verify được GitHub");
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="vibehostUrl">Link sản phẩm Vibe Host</Label>
        <Input
          id="vibehostUrl"
          type="url"
          placeholder="https://ten-san-pham.vibehost.vn"
          value={vibehostUrl}
          onChange={(e) => setVibehostUrl(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="githubRepoUrl">Link GitHub repo (private)</Label>
        <Input
          id="githubRepoUrl"
          type="url"
          placeholder="https://github.com/ten-ban/ten-repo"
          value={githubRepoUrl}
          onChange={(e) => setGithubRepoUrl(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={verified ? "default" : "secondary"}>
          {verified ? "✓ Đã verify GitHub" : "Chưa verify"}
        </Badge>
        {error && <span className="text-caption text-destructive">{error}</span>}
      </div>
      <Button type="submit" disabled={loading} className="w-fit">
        {loading ? "Đang kiểm tra..." : "Gửi & verify"}
      </Button>
    </form>
  );
}
