import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { requireApiKey } from "@/lib/integration-auth";
import { getSubmissionById } from "@/lib/db/queries/submissions";

export const dynamic = "force-dynamic";

/**
 * VÒNG RÀ LẠI sau khi bài bị trả về ở Phase 2.
 *
 * Khác hẳn chấm điểm: vòng này chỉ trả lời ĐẠT hay CHƯA ĐẠT, không nhận điểm. Điểm Phase 2 đã chốt
 * ở lần chấm đầu và không chấm lại — thí sinh sửa là để đi tiếp, không phải để nâng điểm.
 *
 * Cần endpoint riêng vì `/api/integrations/submissions?scored=false` lọc theo "đã có điểm từ công
 * cụ ngoài chưa", nên bài đã chấm một lần biến mất khỏi hàng đợi vĩnh viễn; công cụ chạy lại bao
 * nhiêu lần cũng không thấy bản sửa.
 */
export async function GET(req: NextRequest) {
  const denied = requireApiKey(req);
  if (denied) return denied;

  const rows = await db.query.submissions.findMany({
    where: eq(submissions.recheckStatus, "pending"),
  });

  return NextResponse.json({
    count: rows.length,
    submissions: rows.map((s) => ({
      id: s.id,
      githubRepoUrl: s.githubRepoUrl,
      vibehostUrl: s.vibehostUrl,
      // Lý do BTC trả về — công cụ cần biết phải soi lại đúng chỗ nào.
      returnedBecause: s.btcFeedback,
      updatedAt: s.updatedAt,
    })),
  });
}

const schema = z.discriminatedUnion("result", [
  z.object({ submissionId: z.number().int(), result: z.literal("passed"), note: z.string().max(2000).optional() }),
  z.object({
    submissionId: z.number().int(),
    result: z.literal("failed"),
    note: z.string().min(10, "Chưa đạt thì phải nêu rõ còn thiếu gì — thí sinh cần biết để sửa"),
  }),
]);

export async function POST(req: NextRequest) {
  const denied = requireApiKey(req);
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Payload không hợp lệ" },
      { status: 400 }
    );
  }
  const { submissionId, result, note } = parsed.data;

  const s = await getSubmissionById(submissionId);
  if (!s) return NextResponse.json({ error: "submissionId không tồn tại" }, { status: 404 });
  if (s.recheckStatus !== "pending") {
    return NextResponse.json(
      { error: "Bài này không đang chờ rà lại" },
      { status: 409 }
    );
  }

  const [row] = await db
    .update(submissions)
    .set({
      recheckStatus: result,
      recheckNote: note ?? null,
      /**
       * Rà lại ĐẠT thì đóng luôn cổng an toàn — vòng này chính là lần rà bảy điều cấm trên bản
       * sửa. Bắt thí sinh chờ thêm một lượt rà nữa cho cùng một bản mã là thừa.
       */
      ...(result === "passed" ? { securityStatus: "clean" as const } : {}),
      updatedAt: new Date(),
    })
    .where(eq(submissions.id, submissionId))
    .returning();

  return NextResponse.json({ ok: true, recheckStatus: row.recheckStatus });
}
