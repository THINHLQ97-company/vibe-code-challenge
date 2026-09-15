import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { publish, unpublish, PUBLISH_LABEL, type PublishResult } from "@/lib/publish-one";

export const dynamic = "force-dynamic";

const schema = z.object({
  ids: z.array(z.number().int()).min(1, "Chọn ít nhất một bài").max(200),
  target: z.union([z.literal(1), z.literal(2), z.literal("final")]),
  /** `true` = GỠ điểm đã gửi thay vì gửi. */
  undo: z.boolean().optional().default(false),
});

/**
 * Gửi (hoặc gỡ) điểm cho NHIỀU bài cùng lúc. Chỉ admin.
 *
 * Chạy TUẦN TỰ, không song song: mỗi lượt đọc rồi ghi cùng một bảng, chạy song song vài chục bài
 * chỉ để tiết kiệm vài giây là đổi lấy nguy cơ tranh chấp ghi.
 *
 * Trả kết quả THEO TỪNG BÀI. Sẽ luôn có bài bị chặn — chưa có điểm, chưa qua cổng an toàn, đã gửi
 * rồi — và một lô mấy chục bài mà chỉ báo "xong" thì người bấm không bao giờ biết bài nào chưa ra.
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
  const { ids, target, undo } = parsed.data;

  const results: PublishResult[] = [];
  for (const id of ids) results.push(undo ? await unpublish(id, target) : await publish(id, target));

  return NextResponse.json({
    label: PUBLISH_LABEL[String(target)],
    published: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
}
