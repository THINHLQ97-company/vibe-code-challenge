"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/dsvh/ui/Input";
import { Button } from "@/components/dsvh/ui/Button";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { ArrowsClockwiseIcon } from "@/components/dsvh/icons";

export function BuildForm({
  submissionId,
  initialVibehostUrl,
  initialGithubRepoUrl,
  githubVerified,
  initialError,
  lastCheckedAt,
}: {
  submissionId: number;
  initialVibehostUrl: string;
  initialGithubRepoUrl: string;
  githubVerified: boolean;
  initialError: string | null;
  lastCheckedAt: string | null;
}) {
  const router = useRouter();
  const [vibehostUrl, setVibehostUrl] = useState(initialVibehostUrl);
  const [githubRepoUrl, setGithubRepoUrl] = useState(initialGithubRepoUrl);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);
  const [rechecking, setRechecking] = useState(false);
  const [verified, setVerified] = useState(githubVerified);

  async function send(url: string, body?: unknown, setBusy?: (v: boolean) => void) {
    setError(null);
    setBusy?.(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gửi thất bại");
        return;
      }
      setVerified(!!data.githubVerified);
      if (!data.githubVerified) setError(data.githubError ?? "Chưa xác minh được quyền truy cập repo");
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setBusy?.(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(`/api/submissions/${submissionId}/phase2`, { vibehostUrl, githubRepoUrl }, setLoading);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Link sản phẩm trên Vibe Host"
        type="url"
        placeholder="https://ten-san-pham.vibehost.vn"
        value={vibehostUrl}
        onChange={(e) => setVibehostUrl(e.target.value)}
        required
      />
      <Input
        label="Link repo GitHub (private)"
        type="url"
        placeholder="https://github.com/tai-khoan/ten-repo"
        value={githubRepoUrl}
        onChange={(e) => setGithubRepoUrl(e.target.value)}
        required
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={verified ? "success" : "warning"}>
          {verified ? "Đã xác minh quyền truy cập repo" : "Chưa xác minh"}
        </Badge>
        {lastCheckedAt && <span className="text-meta text-ink-3">Kiểm tra lần cuối: {lastCheckedAt}</span>}
        {!verified && githubRepoUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            loading={rechecking}
            leftIcon={<ArrowsClockwiseIcon size={15} />}
            onClick={() => void send(`/api/submissions/${submissionId}/phase2/recheck`, undefined, setRechecking)}
          >
            Kiểm tra lại
          </Button>
        )}
      </div>

      {error && (
        <Alert tone="warning" title="Chưa xác minh được repo">
          {error}
        </Alert>
      )}

      <Button type="submit" variant="solid" loading={loading}>
        Lưu & xác minh
      </Button>
    </form>
  );
}
