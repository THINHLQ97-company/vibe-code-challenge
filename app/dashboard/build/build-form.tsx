"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/dsvh/ui/Input";
import { Button } from "@/components/dsvh/ui/Button";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";

export function BuildForm({
  submissionId,
  initialVibehostUrl,
  initialGithubRepoUrl,
  locked,
}: {
  submissionId: number;
  initialVibehostUrl: string;
  initialGithubRepoUrl: string;
  /** BTC đã chấm Phase 2 và không yêu cầu sửa ⇒ khoá, xem `BuildPage`. */
  locked: boolean;
}) {
  const router = useRouter();
  const [vibehostUrl, setVibehostUrl] = useState(initialVibehostUrl);
  const [githubRepoUrl, setGithubRepoUrl] = useState(initialGithubRepoUrl);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      <Input
        label="Link sản phẩm trên Vibe Host"
        type="url"
        placeholder="https://ten-san-pham.vibehost.vn"
        value={vibehostUrl}
        onChange={(e) => setVibehostUrl(e.target.value)}
        disabled={locked}
        required
      />
      <Input
        label="Link repo GitHub (private)"
        type="url"
        placeholder="https://github.com/tai-khoan/ten-repo"
        value={githubRepoUrl}
        onChange={(e) => setGithubRepoUrl(e.target.value)}
        disabled={locked}
        required
      />

      {error && <Alert tone="error">{error}</Alert>}

      {!locked && (
        <Button type="submit" variant="solid" loading={loading}>
          Nộp bài
        </Button>
      )}
    </form>
  );
}
