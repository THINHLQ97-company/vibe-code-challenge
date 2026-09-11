import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiKey } from "@/lib/integration-auth";
import { getSubmissionById, setSecurityStatus } from "@/lib/db/queries/submissions";

export const dynamic = "force-dynamic";

/**
 * Kết quả rà soát CỔNG AN TOÀN (CP4) do công cụ ngoài đẩy về.
 *
 * Schema đã ghi từ đầu rằng cột này "điền từ hệ chấm ngoài hoặc admin", nhưng chỉ có đường của
 * admin được dựng — công cụ ngoài rà xong bảy điều cấm thì không có chỗ nào ghi kết quả vào.
 *
 * Đây là CỔNG CHẶN, không phải điểm: `flagged` giữ bài lại không cho công bố cho tới khi thí sinh
 * sửa và BTC rà lại. Vì vậy bắt buộc có `note` khi gắn cờ — chặn bài mà không nói vì sao thì thí
 * sinh không có gì để sửa.
 */
/**
 * Một object + `refine`, KHÔNG dùng `discriminatedUnion`: khi `note` thiếu ở nhánh `flagged`, union
 * chỉ trả được câu "Required" — vô nghĩa với đội đọc lỗi qua API. `refine` cho phép nói đúng cái
 * cần nói.
 */
const schema = z
  .object({
    submissionId: z.number().int(),
    status: z.enum(["clean", "flagged"]),
    note: z.string().max(2000).optional(),
  })
  .refine((v) => v.status !== "flagged" || (v.note?.trim().length ?? 0) >= 10, {
    path: ["note"],
    message: "Gắn cờ phải nêu rõ vi phạm điều cấm nào — thí sinh cần biết để sửa",
  });

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
  const { submissionId, status, note } = parsed.data;

  if (!(await getSubmissionById(submissionId))) {
    return NextResponse.json({ error: "submissionId không tồn tại" }, { status: 404 });
  }

  const row = await setSecurityStatus(submissionId, status, note);
  return NextResponse.json({ ok: true, securityStatus: row.securityStatus });
}
