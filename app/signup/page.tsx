"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

const DEPARTMENTS: { value: string; label: string }[] = [
  { value: "TS", label: "TS — Hỗ trợ Kỹ thuật" },
  { value: "DE", label: "DE — Dev" },
  { value: "OP", label: "OP — Vận hành" },
  { value: "MK", label: "MK — Marketing" },
  { value: "FI", label: "FI — Tài chính/Kế toán" },
  { value: "HR", label: "HR — Nhân sự" },
  { value: "SALES", label: "Kinh Doanh" },
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, department, employeeCode: employeeCode || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Đăng ký thất bại");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Đăng ký tài khoản"
      subtitle="Matbao Vibe Code Challenge"
      footer={
        <span>
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-link hover:text-link-hover">
            Đăng nhập
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Họ tên</Label>
          <Input id="name" placeholder="Nguyễn Văn A" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email công ty</Label>
          <Input
            id="email"
            type="email"
            placeholder="ten@matbao.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="department">Phòng</Label>
          <select
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
            className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-base outline-none focus-visible:border-ring md:text-sm"
          >
            <option value="">— Chọn phòng —</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="employeeCode">Mã nhân viên (tuỳ chọn)</Label>
          <Input id="employeeCode" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} />
        </div>
        <PasswordInput
          label="Mật khẩu"
          hint="Tối thiểu 8 ký tự"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-caption text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="mt-1 w-full">
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </Button>
      </form>
    </AuthCard>
  );
}
