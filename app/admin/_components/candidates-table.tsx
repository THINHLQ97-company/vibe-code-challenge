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
            header: "Hoàn phí AI",
            hideBelow: "lg",
            render: (r) =>
              r.reimburse ? (
                <Badge tone="success">Đủ điều kiện</Badge>
              ) : (
                <span className="text-caption text-ink-3">Chưa</span>
              ),
          },
        ]}
      />
    </div>
  );
}
