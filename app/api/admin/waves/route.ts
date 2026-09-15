import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { getActiveSeason } from "@/lib/db/queries/seasons";
import { listWaves, createWave, countByWave } from "@/lib/db/queries/waves";
import { defaultBonusForWave } from "@/lib/wave-bonus";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(1, "Đặt tên cho đợt thi").max(80),
  registrationOpensAt: z.string().datetime({ offset: true }),
  registrationClosesAt: z.string().datetime({ offset: true }),
  capacityKyThuat: z.number().int().min(0).max(500),
  capacityVanPhong: z.number().int().min(0).max(500),
  /** Bỏ trống thì lấy mức mặc định theo thứ tự đợt. */
  bonusPoints: z.number().int().min(0).max(20).optional(),
});

export async function GET() {
  const auth = await requireSession(["admin", "judge"]);
  if ("error" in auth) return auth.error;
  const season = await getActiveSeason();
  if (!season) return NextResponse.json({ waves: [] });
  const [waves, counts] = await Promise.all([listWaves(season.id), countByWave(season.id)]);
  return NextResponse.json({
    waves: waves.map((w) => ({ ...w, registered: counts.get(w.id) ?? 0 })),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }
  const season = await getActiveSeason();
  if (!season) return NextResponse.json({ error: "Chưa có mùa thi nào đang mở" }, { status: 400 });

  const opens = new Date(parsed.data.registrationOpensAt);
  const closes = new Date(parsed.data.registrationClosesAt);
  if (closes <= opens) {
    return NextResponse.json({ error: "Giờ đóng đăng ký phải sau giờ mở" }, { status: 400 });
  }

  /**
   * `orderIndex` tự tăng theo số đợt đã có, KHÔNG cho nhập tay. Thứ tự đợt quyết định điểm thưởng
   * mặc định, mà cho sửa thứ tự thì một thao tác nhầm sẽ đổi điểm của những người đã thi xong.
   */
  const existing = await listWaves(season.id);
  const orderIndex = existing.length + 1;

  const wave = await createWave({
    seasonId: season.id,
    name: parsed.data.name,
    orderIndex,
    registrationOpensAt: opens,
    registrationClosesAt: closes,
    capacity: parsed.data.capacityKyThuat + parsed.data.capacityVanPhong,
    capacityKyThuat: parsed.data.capacityKyThuat,
    capacityVanPhong: parsed.data.capacityVanPhong,
    bonusPoints: parsed.data.bonusPoints ?? defaultBonusForWave(orderIndex),
    status: "draft",
  });
  return NextResponse.json({ wave });
}
