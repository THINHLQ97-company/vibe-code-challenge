import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { getSubmissionById, setPrebuiltFlag } from "@/lib/db/queries/submissions";

/**
 * BTC gắn cờ bài dùng repo/mẫu có sẵn — vi phạm thể lệ, không qua Phase 2.
 *
 * Tách riêng khỏi cổng an toàn (CP4): CP4 gác 7 điều cấm về dữ liệu và thương hiệu, còn đây là
 * chuyện bài có thật sự được vibe code trong kỳ thi hay không. Hai loại vi phạm khác nhau, người
 * xử khác nhau, nên không nhét chung một cột trạng thái.
 */
const schema = z.object({
  prebuilt: z.boolean(),
  note: z.string().max(2000).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin", "judge"]);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  if (parsed.data.prebuilt && (parsed.data.note ?? "").trim().length < 10) {
    return NextResponse.json(
      { error: "Cần ghi rõ căn cứ (commit nào, repo gốc nào) — thí sinh có quyền phản biện" },
      { status: 400 }
    );
  }

  const id = Number((await params).id);
  const submission = await getSubmissionById(id);
  if (!submission) {
    return NextResponse.json({ error: "Không tìm thấy bài dự thi" }, { status: 404 });
  }

  const row = await setPrebuiltFlag(id, parsed.data.prebuilt, parsed.data.note);
  return NextResponse.json({ submission: row });
}
