import { AuthSplit } from "@/components/auth-split";
import { isPasswordLoginEnabled } from "@/lib/settings";
import { isMicrosoftConfigured } from "@/lib/auth/microsoft";
import { LoginForm } from "./login-form";

/**
 * Component MÁY CHỦ: hai câu hỏi "mật khẩu có đang mở không" và "Microsoft đã cấu hình chưa" chỉ
 * trả lời được ở máy chủ (một cái đọc database, một cái đọc biến môi trường bí mật). Phần tương
 * tác tách sang `login-form.tsx`.
 */
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, passwordEnabled] = await Promise.all([searchParams, isPasswordLoginEnabled()]);
  const microsoftEnabled = isMicrosoftConfigured();

  return (
    <AuthSplit
      title="Đăng nhập"
      subtitle={
        microsoftEnabled && !passwordEnabled
          ? "Dùng tài khoản Microsoft của công ty để vào khu vực thí sinh."
          : "Chào mừng trở lại! Nhập thông tin để tiếp tục."
      }
    >
      <LoginForm
        passwordEnabled={passwordEnabled}
        microsoftEnabled={microsoftEnabled}
        errorCode={error}
      />
    </AuthSplit>
  );
}
