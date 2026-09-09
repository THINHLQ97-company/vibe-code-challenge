"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/dsvh/ui/Button";
import { SignOutIcon } from "@/components/dsvh/icons";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="quiet" size="sm" onClick={onClick} loading={loading} leftIcon={<SignOutIcon size={16} />}>
      Đăng xuất
    </Button>
  );
}
