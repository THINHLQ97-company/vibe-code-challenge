import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * Xác thực công cụ chấm điểm ngoài bằng header `X-API-Key`.
 *
 * Gom về một chỗ vì logic này từng được chép tay ở từng route — chép tay nghĩa là sửa một chỗ quên
 * chỗ kia, mà đây là cánh cửa duy nhất chặn người ngoài ghi điểm vào bảng kết quả.
 */
function valid(header: string | null): boolean {
  const expected = process.env.SCORING_API_KEY;
  // Chưa cấu hình khoá thì ĐÓNG, không phải mở. Mặc định phải là trạng thái an toàn: một bản triển
  // khai quên đặt biến mà lại mở toang cổng ghi điểm là kịch bản tệ nhất ở đây.
  if (!expected || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  // So sánh theo thời gian hằng định: `!==` trả lời sớm ở ký tự lệch đầu tiên, đủ để dò dần từng
  // ký tự của khoá qua thời gian phản hồi.
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Trả `null` nếu hợp lệ, hoặc sẵn một response 401 để route trả về ngay. */
export function requireApiKey(req: Request): NextResponse | null {
  if (valid(req.headers.get("x-api-key"))) return null;
  return NextResponse.json({ error: "API key không hợp lệ" }, { status: 401 });
}
