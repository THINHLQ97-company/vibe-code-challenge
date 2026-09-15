import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getActiveSeason } from "@/lib/db/queries/seasons";
import { approveSubmission, countApprovedThisWeek, getSubmissionById } from "@/lib/db/queries/submissions";
import { getWave, countInWaveByBoard, capacityForBoard } from "@/lib/db/queries/waves";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
      const owner = await db.query.users.findFirst({ where: eq(users.id, submission.userId) });
      const board = owner?.board ?? null;
      const counts = await countInWaveByBoard(wave.id);
      const used = board === "ky_thuat" ? counts.ky_thuat : counts.van_phong;
      const cap = capacityForBoard(wave, board);
      if (used > cap) {
        const label = board === "ky_thuat" ? "Bảng Kỹ thuật" : "Bảng Văn phòng";
        return NextResponse.json(
          {
            error: `${wave.name} đã vượt ${cap} suất của ${label} — chuyển bài sang đợt sau hoặc nâng trần`,
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
