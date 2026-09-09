"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/dsvh/ui/Button";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Textarea } from "@/components/dsvh/ui/form/Textarea";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { ArrowSquareOutIcon } from "@/components/dsvh/icons";

export function AppealRow({
  appeal,
}: {
  appeal: {
    id: number;
    criteria: string;
    evidenceUrl: string;
    status: "pending" | "accepted" | "rejected";
    resolutionNote: string | null;
    createdAt: string;
    productName: string;
    userName: string;
  };
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resolve(status: "accepted" | "rejected") {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/appeals/${appeal.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Thao tác thất bại");
        return;
      }
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setLoading(false);
    }
  }

  const tone = appeal.status === "accepted" ? "success" : appeal.status === "rejected" ? "danger" : "warning";
  const label =
    appeal.status === "accepted" ? "Đã chấp nhận" : appeal.status === "rejected" ? "Đã từ chối" : "Chờ xử lý";

  return (
    <div className="rounded-card border border-stroke bg-surface-2 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-body font-semibold text-ink">{appeal.productName}</div>
          <div className="mt-0.5 text-caption text-ink-2">
            {appeal.userName} · gửi {appeal.createdAt}
          </div>
        </div>
        <Badge tone={tone}>{label}</Badge>
      </div>

      <p className="mt-2 text-caption text-ink-2">{appeal.criteria}</p>
      <a
        href={appeal.evidenceUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-1 flex w-fit items-center gap-1 text-caption text-link hover:text-link-hover"
      >
        Mở bằng chứng <ArrowSquareOutIcon size={14} />
      </a>

      {appeal.status === "pending" ? (
        <div className="mt-3 space-y-2">
          <Textarea
            label="Kết luận của BTC"
            hint="Nói rõ đối chiếu bằng chứng ra sao — thí sinh đọc được phần này"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="solid"
              size="sm"
              loading={loading}
              disabled={note.trim().length < 3}
              onClick={() => void resolve("accepted")}
            >
              Chấp nhận
            </Button>
            <Button
              variant="ghost"
              size="sm"
              loading={loading}
              disabled={note.trim().length < 3}
              onClick={() => void resolve("rejected")}
            >
              Từ chối
            </Button>
          </div>
        </div>
      ) : (
        appeal.resolutionNote && (
          <div className="mt-3">
            <Alert tone={appeal.status === "accepted" ? "success" : "info"} title="Kết luận">
              {appeal.resolutionNote}
            </Alert>
          </div>
        )
      )}

      {error && (
        <div className="mt-3">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
    </div>
  );
}
