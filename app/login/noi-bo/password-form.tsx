"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PasswordInput } from "@/components/dsvh/ui/auth/PasswordInput";
import { Input } from "@/components/dsvh/ui/Input";
import { Button } from "@/components/dsvh/ui/Button";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { EnvelopeIcon, ArrowRightIcon } from "@/components/dsvh/icons";

/** Mã lỗi trên thanh địa chỉ → câu giải thích cho người dùng. */
const ERRORS: Record<string, string> = {
  ms_chua_cau_hinh:
    "Đăng nhập Microsoft chưa được cấu hình. Báo ban tổ chức — đây là việc của hệ thống, không phải lỗi của bạn.",
  ms_tu_choi: "Bạn đã huỷ ở màn hình Microsoft, hoặc quản trị viên chưa cấp quyền cho ứng dụng.",
  ms_phien_khong_hop_le:
    "Phiên đăng nhập hết hạn hoặc không hợp lệ. Bấm đăng nhập lại từ đầu giúp bạn.",
  ms_thieu_thong_tin: "Microsoft không trả về email của bạn. Báo ban tổ chức để kiểm tra hồ sơ.",
  ms_ngoai_cong_ty: "Chỉ tài khoản @matbao.com mới dự thi được.",
  ms_that_bai: "Không kết nối được với Microsoft. Thử lại sau ít phút.",
};

export function PasswordLoginForm({
  passwordEnabled,
  errorCode,
}: {
  passwordEnabled: boolean;
  errorCode?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(errorCode ? ERRORS[errorCode] ?? null : null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Đăng nhập thất bại");
        return;
      }
      router.push(data.user.role === "candidate" ? "/dashboard" : "/admin");
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert tone="error">{error}</Alert>}

      {passwordEnabled && (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            label="Email công ty"
            type="email"
            leftIcon={<EnvelopeIcon size={16} />}
            placeholder="ten@matbao.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <PasswordInput
            label="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="solid"
            loading={loading}
            rightIcon={<ArrowRightIcon size={16} />}
            className="w-full"
          >
            Đăng nhập
          </Button>
        </form>
      )}

      {passwordEnabled && (
        <p className="text-center text-caption text-ink-3">
          Tài khoản nội bộ dùng cho ban tổ chức và tài khoản thử nghiệm.{" "}
          <Link href="/signup" className="font-medium text-link hover:text-link-hover">
            Tạo tài khoản nội bộ
          </Link>
        </p>
      )}

      {!passwordEnabled && (
        <Alert tone="warning" title="Đăng nhập bằng mật khẩu đang tắt">
          Ban tổ chức đã chuyển sang chỉ nhận tài khoản Microsoft.{" "}
          <Link href="/login" className="font-medium text-link hover:text-link-hover">
            Về trang đăng nhập
          </Link>
        </Alert>
      )}
    </div>
  );
}
