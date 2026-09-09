"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/dsvh/ui/form/Textarea";
import { Button } from "@/components/dsvh/ui/Button";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";

const COMMON_QUESTIONS = [
  "Bước nào bạn bị kẹt lâu nhất, và kẹt bao lâu?",
  "Bạn có phải hỏi ai không, hỏi cái gì?",
  "Chữ nào trên giao diện bạn không hiểu nghĩa?",
  "Bạn gặp lỗi gì, hệ thống báo lỗi ra sao, bạn có hiểu thông báo lỗi không?",
  "Có lúc nào bạn định bỏ cuộc không, ở bước nào?",
  "Bạn dùng công cụ AI nào để sinh mã, mất bao lâu mới ra bản chạy được?",
];

const TECH_QUESTIONS = [
  "Nếu khách gặp đúng bước khó/lỗi này, bạn sẽ hướng dẫn họ vượt qua thế nào?",
  "Ba câu hỏi kỹ thuật bạn nghĩ khách sẽ hỏi về Vibe Host mà bạn chưa chắc cách trả lời.",
  "Thông báo lỗi nào của Vibe Host khó hiểu nhất — nên viết lại thế nào cho dễ hiểu?",
  "Một điều bạn muốn đội sản phẩm sửa ngay để giảm số ticket hỗ trợ.",
];

const OFFICE_QUESTIONS = [
  "Nếu giới thiệu Vibe Host cho một đồng nghiệp không rành kỹ thuật, bạn nói gì để họ hiểu nhanh?",
  "Ba câu bạn nghĩ người ngoài sẽ hỏi về Vibe Host mà bạn chưa biết trả lời.",
  "Việc nào của phòng bạn (hoặc việc cá nhân) có thể tự làm một công cụ nhỏ để đỡ mất thời gian hơn?",
  "Một điều bạn muốn đội sản phẩm sửa ngay để người không rành kỹ thuật cũng dùng được.",
];

export function SurveyForm({
  submissionId,
  board,
  alreadySubmitted,
}: {
  submissionId: number;
  board: "ky_thuat" | "van_phong";
  alreadySubmitted: boolean;
}) {
  const router = useRouter();
  const boardQuestions = board === "ky_thuat" ? TECH_QUESTIONS : OFFICE_QUESTIONS;
  const [common, setCommon] = useState<string[]>(Array(6).fill(""));
  const [boardSpecific, setBoardSpecific] = useState<string[]>(Array(4).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(alreadySubmitted);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (common.some((a) => !a.trim()) || boardSpecific.some((a) => !a.trim())) {
      setError("Cần trả lời đủ tất cả câu hỏi — phiếu này là mốc bắt buộc CP6.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/survey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ common, boardSpecific }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gửi thất bại");
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Alert tone="success" title="Đã nộp phiếu trải nghiệm">
        Cảm ơn bạn — CP6 đã hoàn thành. Nội dung phiếu được đội sản phẩm dùng để cải thiện Vibe Host.
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="text-meta font-semibold uppercase tracking-wide text-ink-3">Phần chung</div>
      {COMMON_QUESTIONS.map((q, i) => (
        <Textarea
          key={q}
          label={`${i + 1}. ${q}`}
          value={common[i]}
          onChange={(e) =>
            setCommon((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
          }
        />
      ))}

      <div className="pt-2 text-meta font-semibold uppercase tracking-wide text-ink-3">
        Phần riêng — {board === "ky_thuat" ? "Bảng Kỹ thuật" : "Bảng Văn phòng"}
      </div>
      {boardQuestions.map((q, i) => (
        <Textarea
          key={q}
          label={`${i + 7}. ${q}`}
          value={boardSpecific[i]}
          onChange={(e) =>
            setBoardSpecific((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
          }
        />
      ))}

      {error && <Alert tone="error">{error}</Alert>}

      <Button type="submit" variant="solid" loading={loading}>
        Nộp phiếu trải nghiệm
      </Button>
    </form>
  );
}
