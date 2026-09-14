import { AuthSplit } from "@/components/auth-split";
import { Note } from "@/components/dsvh/ui/data/Note";
import { isPasswordLoginEnabled } from "@/lib/settings";
import { PasswordLoginForm } from "./password-form";

/**
 * Đăng nhập NỘI BỘ bằng email + mật khẩu — dành cho ban tổ chức, ban giám khảo và tài khoản thử
 * nghiệm. KHÔNG liên kết từ trang chủ hay trang đăng nhập công khai: thí sinh chỉ có một đường là
 * tài khoản Microsoft, để không ai đi nhầm rồi báo "không đăng nhập được".
 *
 * Không phải cơ chế bảo mật — địa chỉ này ai gõ đúng cũng vào được trang. Lớp chặn thật nằm ở
 * `POST /api/auth/login`: tắt công tắc mật khẩu trong trang cấu hình là route đó từ chối, dù người
 * gọi đi qua giao diện nào.
 */
export const metadata = { title: "Đăng nhập nội bộ" };
export const dynamic = "force-dynamic";

export default async function InternalLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, passwordEnabled] = await Promise.all([searchParams, isPasswordLoginEnabled()]);

  return (
    <AuthSplit
      title="Đăng nhập nội bộ"
      subtitle="Dành cho ban tổ chức, ban giám khảo và tài khoản thử nghiệm."
    >
      <div className="flex flex-col gap-4">
        <PasswordLoginForm passwordEnabled={passwordEnabled} errorCode={error} />
        <Note>
          Thí sinh không dùng đường này — họ đăng nhập bằng tài khoản Microsoft của công ty ở trang
          đăng nhập chính.
        </Note>
      </div>
    </AuthSplit>
  );
}
