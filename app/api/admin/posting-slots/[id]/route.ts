import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { updateSlotCapacity } from "@/lib/db/queries/posting-slots";

export const dynamic = "force-dynamic";

const schema = z.object({ capacity: z.number().int().min(0).max(200) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Hạn mức không hợp lệ" }, { status: 400 });
  }

  const row = await updateSlotCapacity(Number((await params).id), parsed.data.capacity);
  if (!row) return NextResponse.json({ error: "Không tìm thấy khung giờ" }, { status: 404 });
  return NextResponse.json({ slot: row });
}
