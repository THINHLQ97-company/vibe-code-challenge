"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Button } from "@/components/dsvh/ui/Button";
import { Avatar } from "@/components/dsvh/ui/data/Avatar";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Note } from "@/components/dsvh/ui/data/Note";
import { InfoRow } from "@/components/dsvh/ui/data/InfoRow";
import { Select } from "@/components/dsvh/ui/form/Select";
import { UploadSimpleIcon, TrashIcon } from "@/components/dsvh/icons";

const ACCEPT = "image/jpeg,image/png,image/webp";
/** Ảnh nguồn tối đa 12 MB — ảnh chụp điện thoại thường 3–8 MB, resize xong còn vài chục KB. */
const SOURCE_MAX_BYTES = 12 * 1024 * 1024;
const MAX_EDGE = 512;
const TARGET_MAX_BYTES = 1024 * 1024;

/**
 * Nén ảnh NGAY TRÊN TRÌNH DUYỆT trước khi gửi.
 *
 * Ảnh chụp điện thoại 3–8 MB mà đẩy thẳng lên thì vừa nghẽn request vừa phình DB, trong khi chỗ
 * hiển thị lớn nhất chỉ 40px. Vẽ lại vào canvas ở cạnh dài 512px rồi hạ dần chất lượng JPEG cho
 * tới khi dưới 1 MB — gần như luôn xong ở vòng đầu.
 */
async function resizeToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Trình duyệt không hỗ trợ xử lý ảnh");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  for (const quality of [0.85, 0.7, 0.55, 0.4]) {
    const url = canvas.toDataURL("image/jpeg", quality);
    // Ước lượng số byte thật từ độ dài base64 (mỗi 4 ký tự = 3 byte).
    const bytes = Math.ceil(((url.length - url.indexOf(",") - 1) * 3) / 4);
    if (bytes <= TARGET_MAX_BYTES) return url;
  }
  throw new Error("Không nén được ảnh xuống dưới 1 MB — thử ảnh khác");
}

export function ProfileForm({
  name,
  email,
  department,
  boardLabel,
  roleLabel,
  avatarUrl,
  departmentOptions,
}: {
  name: string;
  email: string;
  department: string;
  boardLabel: string;
  roleLabel: string;
  avatarUrl: string | null;
  departmentOptions: Array<{ value: string; label: string }>;
}) {
  const router = useRouter();
  const [avatar, setAvatar] = useState(avatarUrl);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarOk, setAvatarOk] = useState<string | null>(null);


  const [dept, setDept] = useState<string | null>(null);
  const [deptBusy, setDeptBusy] = useState(false);
  const [deptError, setDeptError] = useState<string | null>(null);

  async function saveDepartment() {
    if (!dept) return;
    setDeptError(null);
    setDeptBusy(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "department", department: dept }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeptError(data.error ?? "Không lưu được phòng ban");
        return;
      }
      router.refresh();
    } catch {
      setDeptError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setDeptBusy(false);
    }
  }

  async function saveAvatar(next: string | null) {
    setAvatarError(null);
    setAvatarOk(null);
    setAvatarBusy(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "avatar", avatar: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAvatarError(data.error ?? "Không lưu được ảnh");
        return;
      }
      setAvatar(data.avatarUrl ?? null);
      setAvatarOk(next ? "Đã cập nhật ảnh đại diện." : "Đã gỡ ảnh đại diện.");
      router.refresh();
    } catch {
      setAvatarError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setAvatarBusy(false);
    }
  }

  async function onPick(file: File | undefined) {
    setAvatarError(null);
    setAvatarOk(null);
    if (!file) return;
    if (file.size > SOURCE_MAX_BYTES) {
      setAvatarError("File gốc quá lớn (trên 12 MB). Chọn ảnh nhỏ hơn.");
      return;
    }
    setAvatarBusy(true);
    try {
      const dataUrl = await resizeToDataUrl(file);
      await saveAvatar(dataUrl);
    } catch (e) {
      setAvatarError(e instanceof Error ? e.message : "Không đọc được ảnh");
      setAvatarBusy(false);
    }
  }


  return (
    <>
      <Card>
        <CardHeader
          title="Ảnh đại diện"
          subtitle="Hiện ở thanh đầu trang và trong danh sách thí sinh của BTC"
        />
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={name} src={avatar ?? undefined} size="lg" />
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stroke bg-surface px-3 py-2 text-caption font-medium text-ink hover:border-stroke-hover hover:bg-surface-hover">
              <UploadSimpleIcon size={16} className="text-ink-2" />
              {avatar ? "Đổi ảnh" : "Tải ảnh lên"}
              <input
                type="file"
                accept={ACCEPT}
                className="sr-only"
                disabled={avatarBusy}
                onChange={(e) => void onPick(e.target.files?.[0])}
              />
            </label>
            {avatar && (
              <Button
                variant="ghost"
                size="sm"
                loading={avatarBusy}
                leftIcon={<TrashIcon size={15} />}
                onClick={() => void saveAvatar(null)}
              >
                Gỡ ảnh
              </Button>
            )}
          </div>
        </div>
        <Note className="mt-3">
          Ảnh được thu nhỏ về cạnh 512px và nén ngay trên máy bạn trước khi gửi, nên luôn dưới 1 MB.
          Nhận JPEG, PNG hoặc WebP.
        </Note>
        {avatarError && (
          <div className="mt-3">
            <Alert tone="error">{avatarError}</Alert>
          </div>
        )}
        {avatarOk && (
          <div className="mt-3">
            <Alert tone="success">{avatarOk}</Alert>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Thông tin tài khoản" subtitle="Do phòng nhân sự quản lý — liên hệ BTC nếu sai" />
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <InfoRow layout="stack" label="Họ tên" value={name} size="sm" />
          <InfoRow layout="stack" label="Email công ty" value={email} size="sm" />
          <InfoRow layout="stack" label="Phòng ban" value={department || "Chưa xác định"} size="sm" />
          <InfoRow layout="stack" label="Bảng thi" value={boardLabel} size="sm" />
          <InfoRow layout="stack" label="Vai trò" value={roleLabel} size="sm" />
        </dl>

        {/* Lối thoát khi Microsoft Graph trả về chuỗi phòng ban không khớp bảng quy đổi. Không có
            chỗ này thì người dùng kẹt vĩnh viễn ở trạng thái không bảng thi, và chỉ lộ ra lúc xếp
            hạng. Chọn xong thì mục này biến mất — máy chủ cũng chặn sửa lần hai. */}
        {!department && (
          <div className="mt-4 space-y-3 border-t border-stroke pt-4">
            <Alert tone="warning" title="Chưa xác định được phòng ban của bạn">
              Hệ thống không đọc được phòng ban từ tài khoản Microsoft của bạn, nên chưa xếp được
              bạn vào bảng thi. Chọn đúng phòng ban bên dưới — <b>chọn xong không tự sửa lại được</b>,
              cần đổi thì liên hệ ban tổ chức.
            </Alert>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-60 flex-1">
                <Select
                  label="Phòng ban của bạn"
                  placeholder="— Chọn phòng ban —"
                  options={departmentOptions}
                  value={dept}
                  onChange={setDept}
                />
              </div>
              <Button
                variant="solid"
                loading={deptBusy}
                disabled={!dept}
                onClick={() => void saveDepartment()}
              >
                Lưu phòng ban
              </Button>
            </div>
            {deptError && <Alert tone="error">{deptError}</Alert>}
          </div>
        )}
      </Card>

    </>
  );
}
