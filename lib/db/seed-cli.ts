/**
 * Chạy tay: `pnpm db:seed`. Lệnh này XOÁ SẠCH dữ liệu rồi dựng lại bộ demo, nên chặn ở
 * production trừ khi người chạy tự khẳng định bằng SEED_FORCE=1.
 *
 * Seed lúc khởi động container KHÔNG đi qua đây — xem `lib/db/bootstrap.ts`, nhánh đó chỉ seed
 * khi database còn rỗng.
 */
import { seedDemoData } from "./seed";

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_FORCE !== "1") {
    console.error(
      "Từ chối seed trên production (lệnh này xoá sạch dữ liệu). Đặt SEED_FORCE=1 nếu chắc chắn."
    );
    process.exit(1);
  }
  await seedDemoData();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
