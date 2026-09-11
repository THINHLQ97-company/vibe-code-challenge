import { eq } from "drizzle-orm";
import { db } from "./db";
import { appSettings } from "./db/schema";

/**
 * Công tắc vận hành đọc/ghi từ trang BTC.
 *
 * Mỗi khoá khai đúng một chỗ ở đây kèm giá trị mặc định, để nơi gọi không phải nhớ chuỗi khoá và
 * không phải tự đoán khi bảng chưa có hàng nào.
 */
export const SETTING_KEYS = {
  /**
   * Bật/tắt đường đăng nhập bằng email + mật khẩu.
   *
   * Mặc định BẬT. Lý do không mặc định tắt: mặc định phải là trạng thái an toàn khi thiếu dữ liệu,
   * mà lúc bảng cấu hình còn rỗng (vừa migrate xong, hoặc database mới) thì "tắt" đồng nghĩa
   * KHÔNG AI đăng nhập được kể cả BTC — trong khi đăng nhập Microsoft có thể chưa cấu hình xong.
   * Tự khoá mình ra ngoài hệ thống là hỏng nặng hơn nhiều so với để mở thêm một đường đăng nhập
   * có mật khẩu. BTC tự tắt khi vào thi thật.
   */
  passwordLoginEnabled: "password_login_enabled",
} as const;

const DEFAULTS: Record<string, string> = {
  [SETTING_KEYS.passwordLoginEnabled]: "1",
};

export async function getSetting(key: string): Promise<string> {
  const row = await db.query.appSettings.findFirst({ where: eq(appSettings.key, key) });
  return row?.value ?? DEFAULTS[key] ?? "";
}

export async function setSetting(key: string, value: string, updatedBy?: number): Promise<void> {
  await db
    .insert(appSettings)
    .values({ key, value, updatedBy: updatedBy ?? null })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value, updatedAt: new Date(), updatedBy: updatedBy ?? null },
    });
}

/** Đăng nhập bằng mật khẩu có đang được phép không. */
export async function isPasswordLoginEnabled(): Promise<boolean> {
  return (await getSetting(SETTING_KEYS.passwordLoginEnabled)) === "1";
}
