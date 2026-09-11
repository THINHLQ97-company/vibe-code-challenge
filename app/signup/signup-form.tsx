"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthSplit } from "@/components/auth-split";
import { PasswordInput } from "@/components/dsvh/ui/auth/PasswordInput";
import { Input } from "@/components/dsvh/ui/Input";
import { Select } from "@/components/dsvh/ui/form/Select";
import { Button } from "@/components/dsvh/ui/Button";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { EnvelopeIcon, UserIcon, ArrowRightIcon } from "@/components/dsvh/icons";
import { Note } from "@/components/dsvh/ui/data/Note";

const DEPARTMENTS = [
  { value: "TS", label: "TS — Hỗ trợ Kỹ thuật" },
  { value: "DE", label: "DE — Lập trình / Dev" },
  { value: "OP", label: "OP — Vận hành" },
  { value: "MK", label: "MK — Marketing" },
  { value: "FI", label: "FI — Tài chính / Kế toán" },
  { value: "HR", label: "HR — Nhân sự" },
  { value: "BZ", label: "BZ — Kinh doanh" },
];

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState<string | null>(null);
  const [employeeCode, setEmployeeCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!department) {
      setError("Chọn phòng ban của bạn");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          department,
          employeeCode: employeeCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Đăng ký thất bại");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplit
      title="Tạo tài khoản"
      subtitle="Dùng email công ty @matbao.com để đăng ký dự thi."
      footer={
        <span>
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-medium text-link hover:text-link-hover">
            Đăng nhập
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="Họ tên"
          leftIcon={<UserIcon size={16} />}
          placeholder="Nguyễn Văn A"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Email công ty"
          type="email"
          leftIcon={<EnvelopeIcon size={16} />}
          placeholder="ten@matbao.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Select
          label="Phòng ban"
          placeholder="— Chọn phòng —"
          options={DEPARTMENTS}
          value={department}
          onChange={setDepartment}
        />
        <Input
          label="Mã nhân viên"
          hint="Không bắt buộc"
          value={employeeCode}
          onChange={(e) => setEmployeeCode(e.target.value)}
        />
        <PasswordInput
          label="Mật khẩu"
          hint="Tối thiểu 8 ký tự"
          showStrength
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Note>Hệ thống tự xếp bạn vào bảng Kỹ thuật hay Văn phòng dựa trên phòng ban.</Note>
        {error && <Alert tone="error">{error}</Alert>}
        <Button
          type="submit"
          variant="solid"
          loading={loading}
          rightIcon={<ArrowRightIcon size={16} />}
          className="w-full"
        >
          Đăng ký
        </Button>
      </form>
    </AuthSplit>
  );
}
