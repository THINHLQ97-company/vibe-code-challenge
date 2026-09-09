"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/dsvh/ui/Button";
import { Input } from "@/components/dsvh/ui/Input";
import { Textarea } from "@/components/dsvh/ui/form/Textarea";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Note } from "@/components/dsvh/ui/data/Note";
import { GlobeIcon, GitBranchIcon, WarningIcon, CheckCircleIcon } from "@/components/dsvh/icons";

type SubmissionInfo = {
  id: number;
  productName: string;
  currentPhase: number;
  isPrebuiltRepo: boolean;
  vibehostUrl: string | null;
  githubRepoUrl: string | null;
  githubVerified: boolean;
  githubVerifyError: string | null;
  userName: string;
  department: string;
};

type IdeaScoreInfo = { giaTriUngDung: number; source: string; summary: string | null };
type ProductScoreInfo = {
  chatLuongKyThuat: number;
  hoanThien: number;
  source: string;
  feedbackStatus: string;
  btcFeedback: string | null;
};

export function ScoringRow({
  submission,
  ideaScore,
  productScore,
}: {
  submission: SubmissionInfo;
  ideaScore: IdeaScoreInfo | null;
  productScore: ProductScoreInfo | null;
}) {
  const router = useRouter();
  const [giaTri, setGiaTri] = useState("");
  const [kyThuat, setKyThuat] = useState("");
  const [hoanThien, setHoanThien] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const technicalCap = submission.isPrebuiltRepo ? 20 : 40;

  async function call(path: string, body: unknown) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  return (
    <div className="rounded-card border border-stroke bg-surface-2 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-body font-semibold text-ink">{submission.productName}</div>
          <div className="mt-0.5 text-caption text-ink-2">
            {submission.userName} · {submission.department}
          </div>
        </div>
        <Badge tone="neutral">Phase {submission.currentPhase}</Badge>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-caption">
        {submission.vibehostUrl && (
          <a
            href={submission.vibehostUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-link hover:text-link-hover"
          >
            <GlobeIcon size={14} /> Mở sản phẩm
          </a>
        )}
        {submission.githubRepoUrl && (
          <a
            href={submission.githubRepoUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-link hover:text-link-hover"
          >
            <GitBranchIcon size={14} /> Mã nguồn
          </a>
        )}
        {submission.githubRepoUrl &&
          (submission.githubVerified ? (
            <span className="flex items-center gap-1 text-teal-strong">
              <CheckCircleIcon size={14} /> Đã xác minh quyền repo
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-strong">
              <WarningIcon size={14} />
              Chưa xác minh{submission.githubVerifyError ? `: ${submission.githubVerifyError}` : ""}
            </span>
          ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-stroke bg-surface p-3">
          <div className="text-caption font-semibold text-ink">Phase 1 · Giá trị ứng dụng (/25)</div>
          {ideaScore ? (
            <div className="mt-1.5 text-caption text-ink-2">
              <span className="text-title font-bold text-ink tabular-nums">
                {ideaScore.giaTriUngDung}
              </span>
              /25 · nguồn: {ideaScore.source === "external_ai" ? "hệ chấm ngoài" : "BTC nhập tay"}
              {ideaScore.summary && <div className="mt-1">{ideaScore.summary}</div>}
            </div>
          ) : (
            <div className="mt-2 flex gap-2">
              <Input
                type="number"
                min={0}
                max={25}
                placeholder="/25"
                value={giaTri}
                onChange={(e) => setGiaTri(e.target.value)}
                className="w-24"
              />
              <Button
                variant="ghost"
                size="sm"
                loading={loading}
                disabled={!giaTri}
                onClick={() =>
                  void call("manual-score", {
                    phase: 1,
                    moduleScores: { giaTriUngDung: Number(giaTri) },
                  })
                }
              >
                Nhập tay
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-stroke bg-surface p-3">
          <div className="text-caption font-semibold text-ink">
            Phase 2 · Kỹ thuật (/{technicalCap}) + Hoàn thiện (/15)
          </div>
          {productScore ? (
            <div className="mt-1.5 text-caption text-ink-2">
              <span className="text-title font-bold text-ink tabular-nums">
                {Math.min(productScore.chatLuongKyThuat, technicalCap)}
              </span>
              /{technicalCap} ·{" "}
              <span className="text-title font-bold text-ink tabular-nums">
                {productScore.hoanThien}
              </span>
              /15
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              <Input
                type="number"
                min={0}
                max={40}
                placeholder="KT"
                value={kyThuat}
                onChange={(e) => setKyThuat(e.target.value)}
                className="w-20"
              />
              <Input
                type="number"
                min={0}
                max={15}
                placeholder="HT"
                value={hoanThien}
                onChange={(e) => setHoanThien(e.target.value)}
                className="w-20"
              />
              <Button
                variant="ghost"
                size="sm"
                loading={loading}
                disabled={!kyThuat || !hoanThien}
                onClick={() =>
                  void call("manual-score", {
                    phase: 2,
                    moduleScores: {
                      chatLuongKyThuat: Number(kyThuat),
                      hoanThien: Number(hoanThien),
                    },
                  })
                }
              >
                Nhập tay
              </Button>
            </div>
          )}
        </div>
      </div>

      {submission.isPrebuiltRepo && (
        <Note tone="warning" className="mt-3">
          Bài deploy từ repo có sẵn — điểm kỹ thuật bị tính trần {technicalCap} khi chốt tổng.
        </Note>
      )}

      {productScore && productScore.feedbackStatus === "approved" ? (
        <div className="mt-3">
          <Alert tone="success" title="Đã duyệt Phase 2">
            {productScore.btcFeedback}
          </Alert>
        </div>
      ) : productScore ? (
        <div className="mt-3 space-y-2">
          <Textarea
            label="Phản hồi cho thí sinh"
            hint="Chỉ rõ điểm cần sửa — nhận xét chung chung không giúp thí sinh sửa được"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              loading={loading}
              disabled={feedback.trim().length < 3}
              onClick={() => void call("feedback", { feedback, status: "needs_fix" })}
            >
              Yêu cầu sửa
            </Button>
            <Button
              variant="solid"
              size="sm"
              loading={loading}
              disabled={feedback.trim().length < 3}
              onClick={() => void call("feedback", { feedback, status: "approved" })}
            >
              Duyệt đạt · mở Phase 3
            </Button>
          </div>
        </div>
      ) : null}

      {error && (
        <div className="mt-3">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
    </div>
  );
}
