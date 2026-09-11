import { redirect } from "next/navigation";
import { isPasswordLoginEnabled } from "@/lib/settings";
import { SignupForm } from "./signup-form";

/**
 * Chặn ở MÁY CHỦ, không chỉ ẩn link. BTC tắt đường mật khẩu để vào thi thật mà trang này vẫn mở
 * thì người ta điền hết một biểu mẫu rồi mới ăn lỗi 403 ở bước cuối — vừa mất công vừa khó hiểu.
 */
export const dynamic = "force-dynamic";

export default async function SignupPage() {
  if (!(await isPasswordLoginEnabled())) redirect("/login");
  return <SignupForm />;
}
