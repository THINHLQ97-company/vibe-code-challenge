import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiKey } from "@/lib/integration-auth";
import { listForScoring } from "@/lib/db/queries/submissions";
import { modulesForPhase } from "@/lib/scoring-rubric";

export const dynamic = "force-dynamic";

const query = z.object({
  phase: z.coerce.number().int().refine((v) => v === 1 || v === 2, "phase phải là 1 hoặc 2"),
  // Mặc định `false` = chỉ lấy bài CHƯA chấm. Đây là nhu cầu thường trực của công cụ chấm; muốn
  // lấy hết thì khai rõ `scored=all`.
  scored: z.enum(["true", "false", "all"]).default("false"),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  after: z.coerce.number().int().min(0).default(0),
});

/**
 * Danh sách bài chờ chấm — điểm khởi đầu của công cụ chấm ngoài.
 *
 * Phân trang bằng con trỏ `after` (id cuối của trang trước) chứ không bằng `offset`: công cụ chấm
 * vừa duyệt vừa ghi điểm, mà ghi điểm làm bài đó rời khỏi danh sách "chưa chấm" — với `offset` thì
 * mọi bài phía sau lùi lên một bậc và cứ mỗi trang lại nhảy cóc mất một bài.
 */
export async function GET(req: NextRequest) {
  const denied = requireApiKey(req);
  if (denied) return denied;

  const parsed = query.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Tham số không hợp lệ" },
      { status: 400 }
    );
  }
  const { phase, scored, limit, after } = parsed.data;
  const p = phase as 1 | 2;

  const rows = await listForScoring({
    phase: p,
    scored: scored === "all" ? undefined : scored === "true",
    limit,
    afterId: after,
  });

  return NextResponse.json({
    phase: p,
    modules: modulesForPhase(p).map((m) => ({ key: m.key, label: m.label, max: m.max })),
    count: rows.length,
    // `null` = hết dữ liệu. Công cụ chấm lặp cho tới khi nhận `null`, không phải đoán theo `count`.
    nextCursor: rows.length === limit ? rows[rows.length - 1].id : null,
    submissions: rows.map((r) => ({
      id: r.id,
      board: r.user.board,
      branch: r.branch,
      topicGroup: r.topicGroup,
      currentPhase: r.currentPhase,
      // Đủ để công cụ quyết định có cần tải chi tiết hay không, chưa phải toàn bộ nội dung.
      hasPrd: !!r.prdContent,
      vibehostUrl: r.vibehostUrl,
      githubRepoUrl: r.githubRepoUrl,
      githubVerified: !!r.githubVerifiedAt,
      updatedAt: r.updatedAt,
    })),
  });
}
