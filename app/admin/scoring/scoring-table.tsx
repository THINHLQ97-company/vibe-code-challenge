"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Table, type ColumnDef } from "@/components/dsvh/ui/Table";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Input } from "@/components/dsvh/ui/Input";
import { MagnifyingGlassIcon, RobotIcon, ArrowRightIcon } from "@/components/dsvh/icons";

export type ScoringRowData = {
  id: number;
  productName: string;
  userName: string;
  department: string;
  currentPhase: number;
  isPrebuiltRepo: boolean;
  hasPrd: boolean;
  ideaValue: number | null;
  ideaBasis: "judges" | "external_ai" | "none";
  productValue: number | null;
  productBasis: "judges" | "external_ai" | "none";
  judgeCount: number;
  iScored: boolean;
  feedbackStatus: string;
};

const FEEDBACK: Record<string, { label: string; tone: "neutral" | "warning" | "success" }> = {
  pending: { label: "Chờ chấm", tone: "neutral" },
  needs_fix: { label: "Cần sửa", tone: "warning" },
  approved: { label: "Đạt", tone: "success" },
};

/** Ô điểm: số + nguồn điểm, để BTC nhìn phát biết đang là điểm máy hay điểm hội đồng. */
function ScoreCell({
  value,
  basis,
  max,
}: {
  value: number | null;
  basis: ScoringRowData["ideaBasis"];
  max: number;
}) {
  if (value == null) {
    return <span className="text-caption text-ink-3">chưa chấm</span>;
  }
  return (
    <span className="flex items-center justify-end gap-1.5">
      {basis === "external_ai" && <RobotIcon size={13} className="text-ink-3" />}
      <span className="font-semibold tabular-nums text-ink">{value}</span>
      <span className="text-meta text-ink-3">/{max}</span>
    </span>
  );
}

export function ScoringTable({ rows }: { rows: ScoringRowData[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.productName.toLowerCase().includes(needle) ||
        r.userName.toLowerCase().includes(needle) ||
        r.department.toLowerCase().includes(needle)
    );
  }, [rows, q]);

  const columns: ColumnDef<ScoringRowData>[] = [
    {
      key: "product",
      header: "Sản phẩm",
      maxWidth: 280,
      render: (r) => (
        <div className="min-w-0">
          <Link
            href={`/admin/scoring/${r.id}`}
            className="block truncate font-medium text-link hover:text-link-hover"
          >
            {r.productName}
          </Link>
          <div className="truncate text-meta text-ink-3">
            {r.userName} · {r.department}
          </div>
        </div>
      ),
    },
    {
      key: "phase",
      header: "Phase",
      align: "center",
      hideBelow: "md",
      render: (r) => <Badge tone="neutral">{r.currentPhase}</Badge>,
    },
    {
      key: "prd",
      header: "PRD",
      align: "center",
      hideBelow: "lg",
      render: (r) =>
        r.hasPrd ? (
          <span className="text-caption text-teal-strong">có</span>
        ) : (
          <span className="text-caption text-amber-strong">thiếu</span>
        ),
    },
    {
      key: "idea",
      header: "Ý tưởng",
      align: "right",
      render: (r) => <ScoreCell value={r.ideaValue} basis={r.ideaBasis} max={25} />,
    },
    {
      key: "productScore",
      header: "Sản phẩm",
      align: "right",
      render: (r) => <ScoreCell value={r.productValue} basis={r.productBasis} max={55} />,
    },
    {
      key: "judges",
      header: "Giám khảo",
      align: "center",
      hideBelow: "md",
      render: (r) => (
        <span className="tabular-nums text-caption text-ink-2">
          {r.judgeCount > 0 ? `${r.judgeCount} phiếu` : "—"}
        </span>
      ),
    },
    {
      key: "mine",
      header: "Phiếu của tôi",
      align: "center",
      render: (r) =>
        r.iScored ? (
          <Badge tone="success">Đã chấm</Badge>
        ) : (
          <Badge tone="warning">Chưa chấm</Badge>
        ),
    },
    {
      key: "feedback",
      header: "Phase 2",
      align: "center",
      hideBelow: "lg",
      render: (r) => {
        const f = FEEDBACK[r.feedbackStatus] ?? FEEDBACK.pending;
        return <Badge tone={f.tone}>{f.label}</Badge>;
      },
    },
    {
      key: "open",
      header: "",
      align: "right",
      render: (r) => (
        <Link
          href={`/admin/scoring/${r.id}`}
          aria-label={`Mở trang chấm điểm ${r.productName}`}
          className="inline-flex items-center gap-1 text-caption font-medium text-link hover:text-link-hover"
        >
          Chấm
          <ArrowRightIcon size={14} />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <Input
        placeholder="Tìm theo tên sản phẩm, thí sinh hoặc phòng ban"
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
        emptySubtext="Đổi từ khoá tìm kiếm, hoặc duyệt thêm đề tài ở mục Duyệt đề tài."
      />
    </div>
  );
}
