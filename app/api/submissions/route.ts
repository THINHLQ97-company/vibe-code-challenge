import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { getActiveSeason } from "@/lib/db/queries/seasons";
import { createSubmission, getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { listWaves, getOpenWave, countInWave } from "@/lib/db/queries/waves";

const registerSchema = z.object({
  productName: z.string().min(3),
  branch: z.enum(["A", "B"]),
  topicGroup: z.string().min(1),
  problemDesc: z.string().min(10),
  targetUsers: z.string().min(3),
  /**
   * NGƯNG thu thập từ form (10/09/2026) — PRD đã mô tả phạm vi và chức năng. Vẫn nhận nếu có, để
   * bản ghi cũ và các công cụ ngoài không gãy, nhưng không còn bắt buộc.
   */
  features: z.array(z.string().min(1)).optional().default([]),
  // Đầu vào chấm Phase 1. Chặn trên 200 000 ký tự để một file dán nhầm không thổi bay request.
  prdContent: z
    .string({ required_error: "Cần đính tài liệu PRD — đây là căn cứ chấm điểm ý tưởng ở Phase 1" })
    .min(200, "Tài liệu PRD quá ngắn — đây là căn cứ chấm điểm ý tưởng ở Phase 1")
    .max(200_000, "Tài liệu quá dài, rút gọn còn phần mô tả sản phẩm"),
  prdFileName: z.string().max(255).optional(),
  databasePlan: z.string().optional(),
  hasWorkflow: z.boolean().optional().default(false),
  workflowDesc: z.string().optional(),
  // Chỉ còn một cách hợp lệ; `isPrebuiltRepo` KHÔNG nhận từ thí sinh nữa — nay là cờ do BTC gắn
  // khi phát hiện vi phạm, không phải điều thí sinh tự khai để chịu trừ điểm.
  // `z.literal` phát mã lỗi `invalid_literal` và bỏ qua `message`, nên câu báo lỗi rơi về tiếng
  // Anh mặc định của zod. Dùng refine để giữ được câu tiếng Việt.
  deployMethod: z
    .string()
    .refine((v) => v === "Tự dựng mới trong kỳ thi", {
      message: "Sản phẩm phải được tự dựng mới trong kỳ thi — không nhận repo/mẫu có sẵn",
    }),
  aiTool: z.string().optional(),
  googleAiPro: z.boolean().optional().default(false),
  dataUsed: z.string().optional(),
  riskSelfAssessment: z.string().optional(),
  /**
   * NGƯNG thu thập từ form (11/09/2026) — mọi thí sinh đều 15 ngày kể từ khi duyệt. Vẫn nhận nếu
   * có để bản ghi cũ và công cụ ngoài không gãy, nhưng không còn là lựa chọn của thí sinh.
   */
  requestedDeadlineDays: z.number().int().min(1).max(15).default(15),
  confirmFakeData: z.boolean().refine((v) => v, "Bắt buộc xác nhận dữ liệu giả"),
  confirmNoMatbaoInfo: z.boolean().refine((v) => v, "Bắt buộc cam kết không lộ thông tin Mắt Bão"),
  confirmTemplateConsent: z.boolean().refine((v) => v, "Bắt buộc đồng ý dùng repo làm Template"),
});

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const submission = await getCurrentSubmissionForUser(auth.session.userId);
  return NextResponse.json({ submission: submission ?? null });
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(["candidate"]);
  if ("error" in auth) return auth.error;

  const existing = await getCurrentSubmissionForUser(auth.session.userId);
  if (existing && existing.registrationStatus !== "returned") {
    return NextResponse.json(
      { error: "Bạn đã có đề tài đang xử lý — chỉ được 1 đề tài/mùa thi" },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const season = await getActiveSeason();
  if (!season) {
    return NextResponse.json({ error: "Chưa có mùa thi nào đang mở" }, { status: 400 });
  }

  /**
   * Gắn bài vào ĐỢT THI đang mở đăng ký.
   *
   * Nếu mùa thi CHƯA có wave nào thì giữ nguyên cách cũ (đăng ký tự do, trần theo tuần) — để bản
   * đang chạy và dữ liệu demo không gãy khi cơ chế wave mới được bật. Nhưng khi đã có wave, mở
   * đăng ký ngoài cửa sổ là vô nghĩa: thí sinh sẽ không thuộc đợt nào, không có điểm thưởng, và
   * không so trung vị lan tỏa với ai được.
   */
  const waves = await listWaves(season.id);
  let waveId: number | null = null;
  if (waves.length > 0) {
    const openWave = await getOpenWave(season.id);
    if (!openWave) {
      return NextResponse.json(
        { error: "Hiện chưa tới đợt đăng ký nào — xem lịch các đợt ở trang chủ" },
        { status: 409 }
      );
    }
    if ((await countInWave(openWave.id)) >= openWave.capacity) {
      return NextResponse.json(
        { error: `${openWave.name} đã đủ ${openWave.capacity} thí sinh — chờ đợt kế tiếp` },
        { status: 409 }
      );
    }
    waveId = openWave.id;
  }

  const submission = await createSubmission({
    ...parsed.data,
    userId: auth.session.userId,
    seasonId: season.id,
    waveId,
  });
  return NextResponse.json({ submission });
}
