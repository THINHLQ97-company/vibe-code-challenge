import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getActiveSeason } from "@/lib/db/queries/seasons";
import { approveSubmission, countApprovedThisWeek, getSubmissionById } from "@/lib/db/queries/submissions";

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

  const row = await approveSubmission(Number(id));
  return NextResponse.json({ submission: row });
}
