import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { getActiveSeason } from "@/lib/db/queries/seasons";
import { createSubmission, getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";

const registerSchema = z.object({
  productName: z.string().min(3),
  branch: z.enum(["A", "B"]),
  topicGroup: z.string().min(1),
  problemDesc: z.string().min(10),
  targetUsers: z.string().min(3),
  features: z.array(z.string().min(1)).min(3, "Cần liệt kê tối thiểu 3 chức năng"),
  databasePlan: z.string().min(3),
  hasWorkflow: z.boolean().optional().default(false),
  workflowDesc: z.string().optional(),
  deployMethod: z.string().min(1),
  isPrebuiltRepo: z.boolean().optional().default(false),
  aiTool: z.string().optional(),
  googleAiPro: z.boolean().optional().default(false),
  dataUsed: z.string().optional(),
  riskSelfAssessment: z.string().optional(),
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

  const submission = await createSubmission({
    ...parsed.data,
    userId: auth.session.userId,
    seasonId: season.id,
  });
  return NextResponse.json({ submission });
}
