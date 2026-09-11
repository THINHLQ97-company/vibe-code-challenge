"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/dsvh/ui/form/Switch";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";

export function LoginToggle({
  initial,
  microsoftReady,
}: {
  initial: boolean;
  microsoftReady: boolean;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(next: boolean) {
    setError(null);
    setSaving(true);
    const previous = enabled;
    setEnabled(next); // đổi ngay cho người bấm thấy phản hồi
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordLoginEnabled: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setEnabled(previous); // hỏng thì trả nút về đúng trạng thái thật, đừng để nó nói dối
        setError(data.error ?? "Không lưu được thay đổi");
        return;
      }
      router.refresh();
    } catch {
      setEnabled(previous);
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <Switch
        checked={enabled}
        disabled={saving}
        onChange={(v) => void save(v)}
        label="Cho phép đăng nhập bằng email và mật khẩu"
      />

      {/* Cảnh báo TRƯỚC khi bấm, không phải sau. Tắt mật khẩu trong lúc Microsoft chưa cấu hình là
          tự khoá mình ra ngoài — và khoá luôn cả BTC, tức không còn ai vào đây bật lại được. */}
      {enabled && !microsoftReady && (
        <Alert tone="warning" title="Chưa tắt được đường mật khẩu">
          Đăng nhập Microsoft chưa cấu hình xong (thiếu biến môi trường của ứng dụng Entra). Tắt
          mật khẩu lúc này là không còn ai đăng nhập được, kể cả ban tổ chức.
        </Alert>
      )}

      {!enabled && (
        <Alert tone="success" title="Đang ở chế độ thi thật">
          Chỉ tài khoản Microsoft @matbao.com đăng nhập được. Các tài khoản demo dùng mật khẩu tạm
          thời không vào được cho tới khi bật lại công tắc này.
        </Alert>
      )}

      {error && <Alert tone="error">{error}</Alert>}
    </div>
  );
}
