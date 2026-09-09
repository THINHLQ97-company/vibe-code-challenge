"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/dsvh/ui/auth/AuthCard";
import { PasswordInput } from "@/components/dsvh/ui/auth/PasswordInput";
import { Input } from "@/components/dsvh/ui/Input";
import { Button } from "@/components/dsvh/ui/Button";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";

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
    <AuthCard
      title="Đăng nhập"
      subtitle="Vibe Code Challenge · Mắt Bão"
      footer={
        <span>
          Chưa có tài khoản?{" "}
          <Link href="/signup" className="text-link hover:text-link-hover">
            Đăng ký
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="Email công ty"
          type="email"
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
        <Button type="submit" variant="solid" loading={loading} className="w-full">
          Đăng nhập
        </Button>
      </form>
    </AuthCard>
  );
}
