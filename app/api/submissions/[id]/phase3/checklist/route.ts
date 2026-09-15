import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { getSubmissionById } from "@/lib/db/queries/submissions";
import {
  CHECKLIST_ITEM_IDS,
  CHECKLIST_VERSION,
  isChecklistComplete,
} from "@/lib/phase3-checklist";

const schema = z.object({ items: z.array(z.string()).max(100) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["candidate"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const submission = await getSubmissionById(Number(id));
  if (!submission || submission.userId !== auth.session.userId) {
    return NextResponse.json({ error: "Không tìm thấy bài dự thi" }, { status: 404 });
  }
  if (submission.currentPhase < 3) {
    return NextResponse.json({ error: "Chưa tới bước chia sẻ" }, { status: 409 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  /**
   * Kiểm ĐỦ DÒNG ở phía máy chủ, không tin nút bấm ngoài trình duyệt.
   *
   * Cả sức nặng của checklist nằm ở chỗ "đã đọc từng điều". Nếu chỉ khoá nút ở giao diện thì một
   * lệnh gọi thẳng vào cổng này là qua được, và bằng chứng lưu xuống thành vô giá trị đúng lúc
   * cần dùng nó nhất — lúc ban tổ chức loại một bài đăng.
   */
  const known = new Set(CHECKLIST_ITEM_IDS);
  const items = [...new Set(parsed.data.items.filter((i) => known.has(i)))];
  if (!isChecklistComplete(items)) {
    return NextResponse.json(
      { error: "Cần tick đủ mọi dòng trong checklist trước khi đăng bài" },
      { status: 400 }
    );
  }

  const [row] = await db
    .update(submissions)
    .set({
      phase3ChecklistAckedAt: new Date(),
      phase3ChecklistVersion: CHECKLIST_VERSION,
      phase3ChecklistItems: items,
      updatedAt: new Date(),
    })
    .where(eq(submissions.id, submission.id))
    .returning();

  return NextResponse.json({ ackedAt: row.phase3ChecklistAckedAt });
}
