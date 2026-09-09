import { desc, lte, gte, and } from "drizzle-orm";
import { db } from "../index";
import { seasons } from "../schema";

export async function getActiveSeason() {
  const now = new Date();
  const inRange = await db.query.seasons.findFirst({
    where: and(lte(seasons.startDate, now), gte(seasons.endDate, now)),
    orderBy: desc(seasons.startDate),
  });
  if (inRange) return inRange;
  return db.query.seasons.findFirst({ orderBy: desc(seasons.startDate) });
}
