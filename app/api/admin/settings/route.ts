import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { SETTING_KEYS, setSetting, getSetting } from "@/lib/settings";

const schema = z.object({
  passwordLoginEnabled: z.boolean(),
});

export async function GET() {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;
  return NextResponse.json({
    passwordLoginEnabled: (await getSetting(SETTING_KEYS.passwordLoginEnabled)) === "1",
  });
}

export async function POST(req: NextRequest) {
  // CHỈ admin. Giám khảo chấm bài, không có việc gì phải đóng/mở đường đăng nhập của cả hệ thống.
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  await setSetting(
    SETTING_KEYS.passwordLoginEnabled,
    parsed.data.passwordLoginEnabled ? "1" : "0",
    auth.session.userId
  );
  return NextResponse.json({ ok: true });
}
