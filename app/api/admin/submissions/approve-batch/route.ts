import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { approveSubmission, getSubmissionById } from "@/lib/db/queries/submissions";
import { getWave, countInWave } from "@/lib/db/queries/waves";

export const dynamic = "force-dynamic";

const schema = z.object({ ids: z.array(z.number().int()).min(1).max(200) });

type Result = { id: number; ok: boolean; error?: string };

/**
 * Duyệt NHIỀU đề tài một lượt.
 *
 * Chạy TUẦN TỰ chứ không song song — trần số lượng của đợt phải được kiểm lại sau mỗi lần duyệt,
 * chạy song song thì cả lô cùng đọc một con số cũ và duyệt vượt trần.
 *
 * Trả kết quả theo TỪNG bài: sẽ có bài đã duyệt rồi, có bài làm đợt tràn trần. Báo "xong" cho cả
 * lô là giấu mất những bài không qua.
 */
export async function POST(req: NextRequest) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const results: Result[] = [];
  for (const id of parsed.data.ids) {
    const s = await getSubmissionById(id);
    if (!s) {
      results.push({ id, ok: false, error: "Không tìm thấy" });
      continue;
    }
    if (s.registrationStatus === "approved") {
      results.push({ id, ok: false, error: "Đã duyệt trước đó" });
      continue;
    }
    if (s.waveId != null) {
      const wave = await getWave(s.waveId);
      if (wave && (await countInWave(wave.id)) > wave.capacity) {
        results.push({ id, ok: false, error: `${wave.name} đã đầy` });
        continue;
      }
    }
    await approveSubmission(id);
    results.push({ id, ok: true });
  }

  return NextResponse.json({
    approved: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
}
