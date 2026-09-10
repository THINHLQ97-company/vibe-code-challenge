"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/dsvh/ui/Input";
import { Textarea } from "@/components/dsvh/ui/form/Textarea";
import { Button } from "@/components/dsvh/ui/Button";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Note } from "@/components/dsvh/ui/data/Note";

export function AppealForm({ submissionId }: { submissionId: number }) {
  const router = useRouter();
  const [criteria, setCriteria] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
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
        setError(data.error ?? "Gửi phản biện thất bại");
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
    <form onSubmit={onSubmit} className="space-y-4">
      <Note>
        Phản biện cảm tính (&quot;em thấy xứng đáng hơn&quot;) sẽ bị bỏ qua. Bằng chứng phải kiểm
        chứng được: link chức năng chạy, commit, video, ảnh màn hình.
      </Note>
      <Textarea
        label="Tiêu chí muốn phản biện"
        hint="Nêu rõ mục điểm nào và vì sao bạn cho là chấm chưa đúng"
        placeholder="VD: chức năng nhắc hạn có chạy thật nhưng chưa được tính điểm"
        value={criteria}
        onChange={(e) => setCriteria(e.target.value)}
        required
      />
      <Input
        label="Link bằng chứng"
        type="url"
        placeholder="https://... (video/commit/ảnh màn hình)"
        value={evidenceUrl}
        onChange={(e) => setEvidenceUrl(e.target.value)}
        required
      />
      {error && <Alert tone="error">{error}</Alert>}
      <Button type="submit" variant="solid" loading={loading}>
        Gửi phản biện
      </Button>
    </form>
  );
}
