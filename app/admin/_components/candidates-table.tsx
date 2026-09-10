"use client";

import { useMemo, useState } from "react";
import { Table } from "@/components/dsvh/ui/Table";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Input } from "@/components/dsvh/ui/Input";
import { Avatar } from "@/components/dsvh/ui/data/Avatar";
import { UsersThreeIcon, MagnifyingGlassIcon } from "@/components/dsvh/icons";

export type CandidateRow = {
  id: number;
  userName: string;
  avatarUrl: string | null;
  department: string;
  board: string;
  productName: string;
  stageLabel: string;
  stageTone: "neutral" | "success" | "warning" | "danger";
  /** Số mốc đã qua và mốc đang bị chặn (nếu có) — để BTC quét cả danh sách bằng mắt. */
  cpDone: number;
  cpTotal: number;
  cpBlocked: string | null;
  finalScore: number | null;
  reimburse: boolean;
};

export function CandidatesTable({ rows }: { rows: CandidateRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.userName.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <div className="space-y-3">
      <Input
        placeholder="Tìm theo tên, phòng ban hoặc sản phẩm"
        leftIcon={<MagnifyingGlassIcon size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <Table<CandidateRow>
        data={filtered}
        getRowId={(r) => r.id}
        emptyText={search ? "Không có thí sinh nào khớp" : "Chưa có thí sinh nào đăng ký"}
        emptySubtext={
          search
            ? "Thử từ khoá khác hoặc xoá ô tìm kiếm."
            : "Danh sách sẽ hiện khi nhân sự bắt đầu đăng ký đề tài."
        }
        emptyIcon={<UsersThreeIcon size={36} />}
        columns={[
          {
            key: "user",
            header: "Thí sinh",
            render: (r) => (
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar name={r.userName} src={r.avatarUrl ?? undefined} size="sm" />
                <div className="min-w-0">
                  <div className="truncate text-body text-ink">{r.userName}</div>
                  <div className="truncate text-caption text-ink-2">
                    {r.department} · {r.board}
                  </div>
                </div>
              </div>
            ),
          },
          { key: "product", header: "Sản phẩm", accessorKey: "productName", maxWidth: 260 },
          {
            key: "stage",
            header: "Trạng thái",
            render: (r) => <Badge tone={r.stageTone}>{r.stageLabel}</Badge>,
          },
          {
            key: "moc",
            header: "Mốc",
            align: "center",
            hideBelow: "md",
            render: (r) => (
              <div className="flex flex-col items-center gap-1">
                <span className="flex gap-0.5" aria-hidden>
                  {Array.from({ length: r.cpTotal }, (_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-3 rounded-full ${
                        i < r.cpDone ? "bg-teal" : r.cpBlocked && i === r.cpDone ? "bg-red" : "bg-stroke"
                      }`}
                    />
                  ))}
                </span>
                <span className="text-meta tabular-nums text-ink-3">
                  {r.cpDone}/{r.cpTotal}
                </span>
              </div>
            ),
          },
          {
            key: "score",
            header: "Điểm",
            align: "right",
            width: 80,
            render: (r) =>
              r.finalScore != null ? (
                <span className="font-semibold tabular-nums text-ink">{r.finalScore}</span>
              ) : (
                <span className="text-ink-3">—</span>
              ),
          },
          {
            key: "reimburse",
            header: "Diện hoàn phí",
            hideBelow: "lg",
            render: (r) =>
              r.reimburse ? (
                <Badge tone="success">Đã đậu</Badge>
              ) : (
                <span className="text-caption text-ink-3">Chưa</span>
              ),
          },
        ]}
      />
    </div>
  );
}
