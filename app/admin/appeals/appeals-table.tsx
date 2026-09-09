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
import { InfoRow } from "@/components/dsvh/ui/data/InfoRow";
import { ArrowSquareOutIcon, MagnifyingGlassIcon } from "@/components/dsvh/icons";

export type AppealRowData = {
  id: number;
  criteria: string;
  evidenceUrl: string;
  status: "pending" | "accepted" | "rejected";
  resolutionNote: string | null;
  createdAt: string;
  productName: string;
  userName: string;
  department: string;
};

const STATUS: Record<
  AppealRowData["status"],
  { label: string; tone: "warning" | "success" | "danger" }
> = {
  pending: { label: "Đang chờ xử lý", tone: "warning" },
  accepted: { label: "Được chấp nhận", tone: "success" },
  rejected: { label: "Bị từ chối", tone: "danger" },
};

export function AppealsTable({ rows }: { rows: AppealRowData[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState<AppealRowData | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.productName.toLowerCase().includes(needle) ||
        r.userName.toLowerCase().includes(needle) ||
        r.criteria.toLowerCase().includes(needle)
    );
  }, [rows, q]);

  function open(row: AppealRowData) {
    setActive(row);
    setNote(row.resolutionNote ?? "");
    setError(null);
  }

  async function resolve(status: "accepted" | "rejected") {
    if (!active) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/appeals/${active.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
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

  const columns: ColumnDef<AppealRowData>[] = [
    {
      key: "product",
      header: "Bài dự thi",
      maxWidth: 260,
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
      key: "criteria",
      header: "Tiêu chí phản biện",
      maxWidth: 380,
      render: (r) => <span className="block truncate text-ink-2">{r.criteria}</span>,
    },
    {
      key: "createdAt",
      header: "Ngày gửi",
      align: "center",
      hideBelow: "md",
      render: (r) => <span className="tabular-nums text-ink-2">{r.createdAt}</span>,
    },
    {
      key: "evidence",
      header: "Bằng chứng",
      align: "center",
      hideBelow: "lg",
      render: (r) => (
        <a
          href={r.evidenceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-link hover:text-link-hover"
        >
          Mở <ArrowSquareOutIcon size={13} />
        </a>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      align: "center",
      render: (r) => <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>,
    },
    {
      key: "action",
      header: "",
      align: "right",
      render: (r) => (
        <Button variant="ghost" size="sm" onClick={() => open(r)}>
          {r.status === "pending" ? "Xử lý" : "Xem"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <Input
        placeholder="Tìm theo sản phẩm, thí sinh hoặc tiêu chí"
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
        emptyText="Chưa có phản biện nào"
        emptySubtext="Thí sinh chỉ gửi được trong 48h kể từ khi công bố điểm, và mỗi bài một lần."
      />

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.productName}
        description={`Phản biện của ${active?.userName ?? ""}`}
        size="lg"
        footer={
          active?.status === "pending" ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setActive(null)}>
                Đóng
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={loading}
                disabled={note.trim().length < 3}
                onClick={() => void resolve("rejected")}
              >
                Từ chối
              </Button>
              <Button
                variant="solid"
                size="sm"
                loading={loading}
                disabled={note.trim().length < 3}
                onClick={() => void resolve("accepted")}
              >
                Chấp nhận & chấm lại
              </Button>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setActive(null)}>
                Đóng
              </Button>
            </div>
          )
        }
      >
        {active && (
          <div className="space-y-3">
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <InfoRow layout="stack" label="Tiêu chí phản biện" value={active.criteria} wrap size="sm" />
              <InfoRow layout="stack" label="Ngày gửi" value={active.createdAt} size="sm" numeric />
              <InfoRow
                layout="stack"
                label="Bằng chứng"
                value={
                  <a
                    href={active.evidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-link hover:text-link-hover"
                  >
                    Mở bằng chứng <ArrowSquareOutIcon size={13} />
                  </a>
                }
                size="sm"
              />
            </dl>

            {active.status !== "pending" ? (
              <Alert tone={active.status === "accepted" ? "success" : "warning"} title="Kết luận của BTC">
                {active.resolutionNote}
              </Alert>
            ) : (
              <Textarea
                label="Kết luận của BTC"
                hint="Bắt buộc — thí sinh đọc đúng dòng này để hiểu vì sao điểm giữ nguyên hay được sửa"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            )}

            {error && <Alert tone="error">{error}</Alert>}
          </div>
        )}
      </Modal>
    </div>
  );
}
