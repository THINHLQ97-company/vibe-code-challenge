import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getActiveSeason } from "@/lib/db/queries/seasons";
import { approveSubmission, countApprovedThisWeek, getSubmissionById } from "@/lib/db/queries/submissions";
import { getWave, countInWave } from "@/lib/db/queries/waves";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const submission = await getSubmissionById(Number(id));
  if (!submission) {
    return NextResponse.json({ error: "Không tìm thấy bài đăng ký" }, { status: 404 });
  }
  if (submission.registrationStatus === "approved") {
    return NextResponse.json({ error: "Đề tài đã được duyệt trước đó" }, { status: 409 });
  }

  /**
   * Trần số lượng lấy theo ĐỢT THI của bài, không phải theo tuần lịch.
   *
   * Wave và trần tuần là cùng một cơ chế, chỉ khác ở chỗ wave cho BTC tự chọn ngày mở/đóng thay vì
   * cắt cứng theo tuần. Giữ cả hai là hai giới hạn chồng nhau, và sẽ có lúc một bài bị chặn mà
   * không ai biết do wave đầy hay do trần tuần.
   *
   * Bài chưa thuộc wave nào (tạo trước khi có cơ chế này) vẫn theo trần tuần cũ.
   */
  if (submission.waveId != null) {
    const wave = await getWave(submission.waveId);
    if (wave) {
      const approvedInWave = await countInWave(wave.id);
      if (approvedInWave > wave.capacity) {
        return NextResponse.json(
          {
            error: `${wave.name} đã đủ ${wave.capacity} thí sinh — chuyển bài này sang đợt sau hoặc nâng trần của đợt`,
          },
          { status: 409 }
        );
      }
    }
  } else {
    const season = await getActiveSeason();
    if (season) {
      const approvedThisWeek = await countApprovedThisWeek(season.id);
      if (approvedThisWeek >= season.capPerWeek) {
        return NextResponse.json(
          {
            error: `Đã đạt trần ${season.capPerWeek} đề tài duyệt/tuần — chờ tuần sau hoặc BTC điều chỉnh trần`,
          },
          { status: 409 }
        );
      }
    }
  }

  const row = await approveSubmission(Number(id));
  return NextResponse.json({ submission: row });
}
