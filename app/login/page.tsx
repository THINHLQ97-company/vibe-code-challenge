"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthSplit } from "@/components/auth-split";
import { PasswordInput } from "@/components/dsvh/ui/auth/PasswordInput";
import { Input } from "@/components/dsvh/ui/Input";
import { Button } from "@/components/dsvh/ui/Button";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { EnvelopeIcon, ArrowRightIcon } from "@/components/dsvh/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
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
    <AuthSplit
      title="Đăng nhập"
      subtitle="Chào mừng trở lại! Nhập thông tin để tiếp tục."
      footer={
        <span>
          Chưa có tài khoản?{" "}
          <Link href="/signup" className="font-medium text-link hover:text-link-hover">
            Đăng ký ngay
          </Link>
        </span>
      }
    >
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
        {error && <Alert tone="error">{error}</Alert>}
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
    </AuthSplit>
  );
}
