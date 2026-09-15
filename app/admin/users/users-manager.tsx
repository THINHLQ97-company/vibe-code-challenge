"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Table, type ColumnDef } from "@/components/dsvh/ui/Table";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Button } from "@/components/dsvh/ui/Button";
import { Input } from "@/components/dsvh/ui/Input";
import { Select } from "@/components/dsvh/ui/form/Select";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Note } from "@/components/dsvh/ui/data/Note";
import { Avatar } from "@/components/dsvh/ui/data/Avatar";
import { SegmentedControl } from "@/components/dsvh/ui/SegmentedControl";
import { MagnifyingGlassIcon, PlusIcon } from "@/components/dsvh/icons";

export type UserRow = {
  id: number;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  department: string | null;
  board: "ky_thuat" | "van_phong" | null;
  role: "candidate" | "judge" | "admin";
  loginMethod: "microsoft" | "password" | "none";
  lastLoginAt: string | null;
  submissionCount: number;
};

const ROLE_LABEL: Record<UserRow["role"], string> = {
  admin: "Quản trị",
  judge: "Giám khảo",
  candidate: "Thí sinh",
};
const ROLE_TONE: Record<UserRow["role"], "danger" | "accent" | "neutral"> = {
  admin: "danger",
  judge: "accent",
  candidate: "neutral",
};
const ROLE_OPTIONS = [
  { value: "candidate", label: "Thí sinh" },
  { value: "judge", label: "Giám khảo" },
  { value: "admin", label: "Quản trị" },
];
const BOARD_LABEL: Record<string, string> = { ky_thuat: "Kỹ thuật", van_phong: "Văn phòng" };

export function UsersManager({ initial, meId }: { initial: UserRow[]; meId: number }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [roleTab, setRoleTab] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | "invite" | null>(null);

  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "judge" as string | null });

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return initial.filter((u) => {
      if (roleTab !== "all" && u.role !== roleTab) return false;
      if (!needle) return true;
      return (
        u.email.toLowerCase().includes(needle) ||
        (u.name ?? "").toLowerCase().includes(needle) ||
        (u.department ?? "").toLowerCase().includes(needle)
      );
    });
  }, [initial, q, roleTab]);

  async function changeRole(id: number, role: string | null) {
    if (!role) return;
    setError(null);
    setOk(null);
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Không đổi được vai trò");
        return;
      }
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setBusy(null);
    }
  }

  async function invite() {
    setError(null);
    setOk(null);
    setBusy("invite");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, name: form.name || undefined, role: form.role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Không mời được");
        return;
      }
      setOk(`Đã mời ${form.email}. Họ chỉ cần đăng nhập bằng Microsoft là vào đúng vai trò.`);
      setForm({ email: "", name: "", role: "judge" });
      setInviting(false);
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setBusy(null);
    }
  }

  const columns: ColumnDef<UserRow>[] = [
    {
      key: "user",
      header: "Người dùng",
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <Avatar src={u.avatarUrl ?? undefined} name={u.name ?? u.email} size="sm" />
          <div className="min-w-0">
            <div className="truncate text-caption font-medium text-ink">{u.name ?? "—"}</div>
            <div className="truncate text-meta text-ink-3">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "dept",
      header: "Phòng ban",
      align: "center",
      hideBelow: "md",
      render: (u) => (
        <span className="text-caption text-ink-2">
          {u.department ?? "—"}
          {u.board ? <span className="text-ink-3"> · {BOARD_LABEL[u.board]}</span> : null}
        </span>
      ),
    },
    {
      key: "login",
      header: "Đăng nhập",
      align: "center",
      render: (u) =>
        u.lastLoginAt ? (
          <span className="flex flex-col items-center leading-tight">
            <span className="text-caption text-ink">{u.lastLoginAt}</span>
            <span className="text-meta text-ink-3">
              {u.loginMethod === "microsoft" ? "Microsoft" : "mật khẩu"}
            </span>
          </span>
        ) : (
          // Phân biệt rõ "được mời, chờ vào" với "đã dùng hệ thống" — đây là thứ BTC cần biết khi
          // sắp khai mạc mà một giám khảo vẫn im lặng.
          <Badge tone="warning">Chưa đăng nhập</Badge>
        ),
    },
    {
      key: "sub",
      header: "Bài dự thi",
      align: "center",
      hideBelow: "md",
      render: (u) => (
        <span className="tabular-nums text-caption text-ink-2">
          {u.submissionCount > 0 ? u.submissionCount : "—"}
        </span>
      ),
    },
    {
      key: "role",
      header: "Vai trò",
      align: "center",
      render: (u) => <Badge tone={ROLE_TONE[u.role]}>{ROLE_LABEL[u.role]}</Badge>,
    },
    {
      key: "action",
      header: "Đổi vai trò",
      align: "right",
      render: (u) => (
        <div className="flex justify-end">
          <div className="w-36">
            <Select
              options={ROLE_OPTIONS}
              value={u.role}
              disabled={busy === u.id || u.id === meId}
              onChange={(v) => void changeRole(u.id, v)}
            />
          </div>
        </div>
      ),
    },
  ];

  const counts = {
    admin: initial.filter((u) => u.role === "admin").length,
    judge: initial.filter((u) => u.role === "judge").length,
    candidate: initial.filter((u) => u.role === "candidate").length,
  };

  return (
    <div className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      {ok && <Alert tone="success">{ok}</Alert>}

      <Card>
        <CardHeader
          title="Mời thành viên ban giám khảo"
          subtitle="Tạo sẵn vai trò trước khi họ đăng nhập lần đầu"
          action={
            <Button
              variant={inviting ? "ghost" : "solid"}
              size="sm"
              leftIcon={inviting ? undefined : <PlusIcon size={15} />}
              onClick={() => setInviting((v) => !v)}
            >
              {inviting ? "Huỷ" : "Mời người mới"}
            </Button>
          }
        />
        {inviting ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                label="Email công ty"
                placeholder="ten@matbao.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                label="Họ tên (không bắt buộc)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Select
                label="Vai trò"
                options={[
                  { value: "judge", label: "Giám khảo" },
                  { value: "admin", label: "Quản trị" },
                ]}
                value={form.role}
                onChange={(v) => setForm({ ...form, role: v })}
              />
            </div>
            <Button
              variant="solid"
              size="sm"
              loading={busy === "invite"}
              disabled={!form.email}
              onClick={() => void invite()}
            >
              Mời
            </Button>
          </div>
        ) : (
          <Note>
            Tài khoản chỉ sinh ra khi một người đăng nhập Microsoft lần đầu. Mời trước là tạo sẵn
            chỗ giữ vai trò — người được mời đăng nhập bình thường và vào thẳng đúng quyền, không
            cần ai nâng quyền thủ công.
          </Note>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Tất cả tài khoản"
          subtitle={`${counts.admin} quản trị · ${counts.judge} giám khảo · ${counts.candidate} thí sinh`}
        />
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <Input
            placeholder="Tìm theo tên, email hoặc phòng ban"
            leftIcon={<MagnifyingGlassIcon size={16} />}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-sm"
          />
          <SegmentedControl
            options={[
              { value: "all", label: "Tất cả" },
              { value: "admin", label: "Quản trị" },
              { value: "judge", label: "Giám khảo" },
              { value: "candidate", label: "Thí sinh" },
            ]}
            value={roleTab}
            onChange={setRoleTab}
            size="sm"
          />
        </div>
        <Table<UserRow>
          data={rows}
          columns={columns}
          getRowId={(u) => u.id}
          emptyText="Không có tài khoản nào khớp"
        />
        <Note className="mt-3">
          Không đổi được vai trò của chính mình — tránh trường hợp tự hạ quyền rồi không còn ai vào
          được trang quản trị.
        </Note>
      </Card>
    </div>
  );
}
