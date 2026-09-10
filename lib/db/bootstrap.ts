import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./index";

/**
 * Chuẩn bị database ngay khi tiến trình khởi động.
 *
 * Vì sao cần: trên nền tảng lưu trữ (Vibe Host, Coolify…) mình chỉ đưa được mã nguồn, không có
 * chỗ nào để gõ tay `pnpm db:migrate` vào đúng database mà nền tảng cấp — chuỗi kết nối của nó
 * không ra được khỏi mạng nội bộ của nền tảng. Không có bước này thì container lên xanh nhưng mọi
 * trang đều 500 vì chưa có bảng nào, hoặc có bảng mà không có tài khoản nào để đăng nhập.
 *
 * Hai việc, hai mức thận trọng khác nhau:
 *   · Migration: LUÔN chạy. Thêm bảng/cột là thao tác cộng dồn, chạy lại không mất gì.
 *   · Seed demo: XOÁ SẠCH dữ liệu, nên chỉ chạy khi có `BOOTSTRAP_SEED_DEMO=1` VÀ bảng users còn
 *     rỗng. Hai điều kiện chứ không một: cờ env sót lại sau này không được phép thổi bay dữ liệu
 *     thật của một mùa thi đang chạy.
 */
const LOCK_KEY = 728_411; // khoá tư vấn dùng riêng cho bootstrap

let started: Promise<void> | null = null;

async function run() {
  // Nhiều bản sao cùng khởi động sẽ cùng chạy migration một lúc. Khoá tư vấn cấp phiên khiến các
  // bản còn lại xếp hàng, xong thì thấy migration đã áp dụng rồi và không làm gì thêm.
  await db.execute(sql`SELECT pg_advisory_lock(${LOCK_KEY})`);
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("[bootstrap] migration đã áp dụng xong");

    if (process.env.BOOTSTRAP_SEED_DEMO !== "1") return;

    const rows = await db.execute<{ n: number }>(sql`SELECT count(*)::int AS n FROM users`);
    const count = Number((rows as unknown as Array<{ n: number }>)[0]?.n ?? 0);
    if (count > 0) {
      console.log(`[bootstrap] bỏ qua seed — đã có ${count} tài khoản trong database`);
      return;
    }

    // Nạp muộn: chỉ khi thật sự seed mới kéo bộ dữ liệu demo vào bộ nhớ.
    const { seedDemoData } = await import("./seed");
    await seedDemoData();
    console.log("[bootstrap] đã seed dữ liệu demo cho database rỗng");
  } finally {
    await db.execute(sql`SELECT pg_advisory_unlock(${LOCK_KEY})`);
  }
}

export function ensureBootstrapped(): Promise<void> {
  // Chỉ một lần mỗi tiến trình, kể cả khi có nhiều thứ cùng gọi.
  started ??= run().catch((err) => {
    // Không ném ra ngoài: ném ở đây làm sập luôn tiến trình và mất cả trang lỗi lẫn /api/health,
    // tức là mất luôn manh mối để biết vì sao hỏng. Ghi log rồi để ứng dụng tự báo lỗi khi truy vấn.
    console.error("[bootstrap] THẤT BẠI — database có thể chưa sẵn sàng:", err);
  });
  return started;
}
