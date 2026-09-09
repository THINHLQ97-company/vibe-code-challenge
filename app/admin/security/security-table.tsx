"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, type ColumnDef } from "@/components/dsvh/ui/Table";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Button } from "@/components/dsvh/ui/Button";
import { Input } from "@/components/dsvh/ui/Input";
import { Modal } from "@/components/dsvh/ui/overlay/Modal";
import { Textarea } from "@/components/dsvh/ui/form/Textarea";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Note } from "@/components/dsvh/ui/data/Note";
import { GlobeIcon, GitBranchIcon, MagnifyingGlassIcon } from "@/components/dsvh/icons";

export type SecurityRowData = {
  id: number;
  productName: string;
  userName: string;
  department: string;
  securityStatus: "pending" | "clean" | "flagged";
  securityNote: string | null;
  vibehostUrl: string | null;
  githubRepoUrl: string | null;
};

const STATUS: Record<
  SecurityRowData["securityStatus"],
  { label: string; tone: "success" | "danger" | "warning" }
> = {
  clean: { label: "Đã qua cổng", tone: "success" },
  flagged: { label: "Bị gắn cờ", tone: "danger" },
  pending: { label: "Chưa rà soát", tone: "warning" },
};

export function SecurityTable({ rows }: { rows: SecurityRowData[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState<SecurityRowData | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.productName.toLowerCase().includes(needle) || r.userName.toLowerCase().includes(needle)
    );
  }, [rows, q]);

  function open(row: SecurityRowData) {
    setActive(row);
    setNote(row.securityNote ?? "");
    setError(null);
  }

  async function setStatus(status: "clean" | "flagged") {
    if (!active) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions/${active.id}/security`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: status === "flagged" ? note : undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Thao tác thất bại");
        return;
      }
      setActive(null);
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setLoading(false);
    }
  }

  const columns: ColumnDef<SecurityRowData>[] = [
    {
      key: "product",
      header: "Sản phẩm",
      maxWidth: 300,
      render: (r) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-ink">{r.productName}</div>
          <div className="truncate text-meta text-ink-3">
            {r.userName} · {r.department}
          </div>
        </div>
      ),
    },
    {
      key: "links",
      header: "Soi bài",
      hideBelow: "md",
      render: (r) => (
        <span className="flex items-center gap-3">
          {r.vibehostUrl ? (
            <a
              href={r.vibehostUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-link hover:text-link-hover"
            >
              <GlobeIcon size={14} /> Sản phẩm
            </a>
          ) : (
            <span className="text-ink-3">—</span>
          )}
          {r.githubRepoUrl && (
            <a
              href={r.githubRepoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-link hover:text-link-hover"
            >
              <GitBranchIcon size={14} /> Mã nguồn
            </a>
          )}
        </span>
      ),
    },
    {
      key: "note",
      header: "Ghi chú rà soát",
      maxWidth: 320,
      hideBelow: "lg",
      render: (r) => (
        <span className="block truncate text-ink-2">{r.securityNote || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      align: "center",
      render: (r) => <Badge tone={STATUS[r.securityStatus].tone}>{STATUS[r.securityStatus].label}</Badge>,
    },
    {
      key: "action",
      header: "",
      align: "right",
      render: (r) => (
        <Button variant="ghost" size="sm" onClick={() => open(r)}>
          {r.securityStatus === "clean" ? "Xem lại" : "Rà soát"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <Input
        placeholder="Tìm theo tên sản phẩm hoặc thí sinh"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        leftIcon={<MagnifyingGlassIcon size={16} />}
      />
      <Table
        data={filtered}
        columns={columns}
        getRowId={(r) => r.id}
        variant="zebra"
        density="comfortable"
        stickyHeader={false}
        emptyText="Không có bài nào khớp"
        emptySubtext="Bài vào diện rà soát khi thí sinh nộp sản phẩm ở Phase 2."
      />

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.productName}
        description={`Rà soát 7 điều cấm · ${active?.userName ?? ""}`}
        size="lg"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setActive(null)}>
              Đóng
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={loading}
              disabled={note.trim().length < 3}
              onClick={() => void setStatus("flagged")}
            >
              Gắn cờ vi phạm
            </Button>
            <Button variant="solid" size="sm" loading={loading} onClick={() => void setStatus("clean")}>
              Cho qua cổng
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex flex-wrap gap-4 text-caption">
            {active?.vibehostUrl && (
              <a
                href={active.vibehostUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-link hover:text-link-hover"
              >
                <GlobeIcon size={15} /> Mở sản phẩm
              </a>
            )}
            {active?.githubRepoUrl && (
              <a
                href={active.githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-link hover:text-link-hover"
              >
                <GitBranchIcon size={15} /> Soi mã nguồn
              </a>
            )}
          </div>
          <Textarea
            label="Ghi rõ vi phạm điều nào"
            hint="Bắt buộc khi gắn cờ — thí sinh cần biết sửa gì. Cho qua cổng thì để trống cũng được."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Note tone="danger">
            Điều cấm 1 (dữ liệu khách thật) và 7 (tài liệu nội bộ) là tuyệt đối: Vibe Host v2 gửi mã
            nguồn ra nhà cung cấp AI nước ngoài khi tự sửa lỗi deploy.
          </Note>
          {error && <Alert tone="error">{error}</Alert>}
        </div>
      </Modal>
    </div>
  );
}
