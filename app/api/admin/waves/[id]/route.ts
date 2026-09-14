import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { getWave, updateWave } from "@/lib/db/queries/waves";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  registrationOpensAt: z.string().datetime({ offset: true }).optional(),
  registrationClosesAt: z.string().datetime({ offset: true }).optional(),
  capacity: z.number().int().min(1).max(500).optional(),
  bonusPoints: z.number().int().min(0).max(20).optional(),
  status: z.enum(["draft", "open", "closed"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const id = Number((await params).id);
  const wave = await getWave(id);
  if (!wave) return NextResponse.json({ error: "Không tìm thấy đợt thi" }, { status: 404 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const opens = d.registrationOpensAt ? new Date(d.registrationOpensAt) : wave.registrationOpensAt;
  const closes = d.registrationClosesAt
    ? new Date(d.registrationClosesAt)
    : wave.registrationClosesAt;
  if (closes <= opens) {
    return NextResponse.json({ error: "Giờ đóng đăng ký phải sau giờ mở" }, { status: 400 });
  }

  const row = await updateWave(id, {
    ...(d.name !== undefined ? { name: d.name } : {}),
    ...(d.capacity !== undefined ? { capacity: d.capacity } : {}),
    ...(d.bonusPoints !== undefined ? { bonusPoints: d.bonusPoints } : {}),
    ...(d.status !== undefined ? { status: d.status } : {}),
    registrationOpensAt: opens,
    registrationClosesAt: closes,
  });
  return NextResponse.json({ wave: row });
}
