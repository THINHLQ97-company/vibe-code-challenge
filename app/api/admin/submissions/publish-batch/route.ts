import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { publishOne, type PublishResult } from "@/lib/publish-one";

export const dynamic = "force-dynamic";

const schema = z.object({
  ids: z.array(z.number().int()).min(1, "Chọn ít nhất một bài").max(200),
});

/**
 * Công bố điểm cho NHIỀU bài cùng lúc. Chỉ admin.
 *
 * Chạy TUẦN TỰ, không song song: mỗi lượt công bố đọc rồi ghi cùng một bảng, chạy song song vài
 * chục bài chỉ để tiết kiệm vài giây là đổi lấy nguy cơ tranh chấp ghi.
 *
 * Trả kết quả THEO TỪNG BÀI, không phải một thông báo chung. Sẽ luôn có bài bị chặn — thiếu mốc
 * bắt buộc, bị gắn cờ, đã công bố rồi — và một lô mấy chục bài mà chỉ báo "xong" thì người bấm
 * không bao giờ biết bài nào chưa ra.
 */
export async function POST(req: NextRequest) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const results: PublishResult[] = [];
  for (const id of parsed.data.ids) results.push(await publishOne(id));

  return NextResponse.json({
    published: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
}
