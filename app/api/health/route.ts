import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  const startedAt = Date.now();
  let dbStatus: "ok" | "error" = "ok";
  try {
    await db.execute(sql`SELECT 1`);
  } catch {
    dbStatus = "error";
  }
  return NextResponse.json(
    {
      status: dbStatus === "ok" ? "ok" : "degraded",
      db: dbStatus,
      uptime_ms: Date.now() - startedAt,
    },
    { status: dbStatus === "ok" ? 200 : 503 },
  );
}
