"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PasswordInput } from "@/components/dsvh/ui/auth/PasswordInput";
import { Input } from "@/components/dsvh/ui/Input";
import { Button } from "@/components/dsvh/ui/Button";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Note } from "@/components/dsvh/ui/data/Note";
import { EnvelopeIcon, ArrowRightIcon } from "@/components/dsvh/icons";

/** Dấu bốn ô của Microsoft, vẽ tay theo đúng bốn màu thương hiệu. */
function MicrosoftMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <rect x="1" y="1" width="8" height="8" fill="#F25022" />
      <rect x="11" y="1" width="8" height="8" fill="#7FBA00" />
      <rect x="1" y="11" width="8" height="8" fill="#00A4EF" />
      <rect x="11" y="11" width="8" height="8" fill="#FFB900" />
    </svg>
  );
}

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

export function LoginForm({
  passwordEnabled,
  microsoftEnabled,
  errorCode,
}: {
  passwordEnabled: boolean;
  microsoftEnabled: boolean;
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

      {/* Đường Microsoft đặt TRÊN: khi thi thật đây là cách đăng nhập duy nhất, nên nó phải là thứ
          mắt chạm đầu tiên chứ không nằm dưới đáy như một lựa chọn phụ. */}
      {microsoftEnabled && (
        <a href="/api/auth/microsoft" className="block">
          <Button variant="ghost" className="w-full" leftIcon={<MicrosoftMark size={17} />}>
            Đăng nhập bằng tài khoản Microsoft công ty
          </Button>
        </a>
      )}

      {microsoftEnabled && passwordEnabled && (
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-stroke" />
          <span className="text-caption text-ink-3">hoặc</span>
          <span className="h-px flex-1 bg-stroke" />
        </div>
      )}

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
          Chưa có tài khoản?{" "}
          <Link href="/signup" className="font-medium text-link hover:text-link-hover">
            Đăng ký ngay
          </Link>
        </p>
      )}

      {/* Cả hai đường đều đóng = không ai vào được. Nói rõ ra, vì một trang đăng nhập trống trơn
          trông y như trang bị lỗi. */}
      {!passwordEnabled && !microsoftEnabled && (
        <Alert tone="error" title="Chưa có cách đăng nhập nào đang mở">
          Ban tổ chức đã tắt đăng nhập bằng mật khẩu nhưng đăng nhập Microsoft chưa được cấu hình.
          Liên hệ ban tổ chức để mở lại.
        </Alert>
      )}

      {!passwordEnabled && microsoftEnabled && (
        <Note>
          Kỳ thi đang chạy nên chỉ nhận đăng nhập bằng tài khoản Microsoft của công ty — cách này
          cũng giúp hệ thống tự xếp bạn vào đúng bảng thi theo phòng ban.
        </Note>
      )}
    </div>
  );
}
