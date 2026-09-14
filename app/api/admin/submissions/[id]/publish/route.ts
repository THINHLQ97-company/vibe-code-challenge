import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getSubmissionById, publishSubmission } from "@/lib/db/queries/submissions";
import { getAggregatedScores } from "@/lib/db/queries/scores";
import { missingCheckpoints } from "@/lib/checkpoints";
import { computeFinalScore } from "@/lib/scoring";
import { getWave } from "@/lib/db/queries/waves";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const submission = await getSubmissionById(Number(id));
  if (!submission) {
    return NextResponse.json({ error: "Không tìm thấy bài dự thi" }, { status: 404 });
  }
  if (submission.publishedAt) {
    return NextResponse.json({ error: "Bài này đã công bố kết quả" }, { status: 409 });
  }

  // Dùng repo/mẫu có sẵn là vi phạm thể lệ — không công bố, bất kể điểm cao thấp.
  if (submission.isPrebuiltRepo) {
    return NextResponse.json(
      { error: "Bài bị gắn cờ dùng repo/mẫu có sẵn — không đủ điều kiện công bố" },
      { status: 409 }
    );
  }

  // Thể lệ: phải đủ CP1–CP6 mới được công nhận đậu — kiểm một lượt, báo hết các mốc còn thiếu
  // thay vì bắt admin bấm lại từng lần để lộ ra từng lỗi.
  const missing = missingCheckpoints(submission);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Chưa đủ mốc bắt buộc: ${missing.join(", ")}`, missing },
      { status: 409 }
    );
  }

  // Điểm chốt = TRUNG BÌNH các phiếu giám khảo (thể lệ), chỉ rơi về điểm hệ chấm ngoài khi
  // chưa ai chấm tay. Trước đây lấy phiếu mới nhất nên hội đồng ba người chỉ tính được một.
  const scores = await getAggregatedScores(submission.id);
  if (!scores.hasIdeaScore || !scores.hasProductScore) {
    return NextResponse.json({ error: "Chưa đủ điểm Phase 1/2 để công bố" }, { status: 409 });
  }

  // Điểm thưởng đăng ký sớm đọc từ chính wave của bài, không tính lại từ thứ tự — BTC sửa được
  // điểm thưởng của một wave, và bài đã thuộc wave nào thì ăn theo đúng con số của wave đó.
  const wave = submission.waveId != null ? await getWave(submission.waveId) : null;

  const finalScore = computeFinalScore({
    technicalRaw: scores.chatLuongKyThuat.value,
    completion: scores.hoanThien.value,
    applicationValue: scores.giaTriUngDung.value,
    engagementTier: submission.engagementTier,
    waveBonus: wave?.bonusPoints ?? 0,
  });

  const row = await publishSubmission(submission.id, finalScore);
  return NextResponse.json({ submission: row, scoreBasis: scores });
}
