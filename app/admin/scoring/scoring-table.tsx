"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Table, type ColumnDef } from "@/components/dsvh/ui/Table";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Input } from "@/components/dsvh/ui/Input";
import { MagnifyingGlassIcon, RobotIcon, ArrowRightIcon } from "@/components/dsvh/icons";
import { RUBRIC, ENGAGEMENT_MAX, TOTAL_MAX } from "@/lib/scoring-rubric";

// Trần điểm LẤY TỪ barem chung, không gõ cứng: bảng này từng ghi 25 và 55 bằng tay, và đó chính
// là cách barem trên trang giới thiệu trôi đi một hướng khác với barem hệ thống đang dùng.
const IDEA_MAX = RUBRIC.filter((m) => m.phase === 1).reduce((a, m) => a + m.max, 0);
const PRODUCT_MAX = RUBRIC.filter((m) => m.phase === 2).reduce((a, m) => a + m.max, 0);

export type ScoringRowData = {
  id: number;
  productName: string;
  userName: string;
  department: string;
  currentPhase: number;
  isPrebuiltRepo: boolean;  // BTC gắn cờ vi phạm
  hasPrd: boolean;
  ideaValue: number | null;
  ideaBasis: "judges" | "external_ai" | "none";
  productValue: number | null;
  productBasis: "judges" | "external_ai" | "none";
  judgeCount: number;
  /** Phase 3 — điểm quy đổi từ bậc tương tác; `null` = BTC chưa chốt bậc. */
  engagementValue: number | null;
  engagementTier: number | null;
  /** Điểm thưởng đăng ký sớm của đợt mà bài thuộc về. */
  waveBonus: number;
  waveName: string | null;
  iScored: boolean;
  stageLabel: string;
  stageTone: "neutral" | "success" | "warning" | "danger";
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
      render: (r) => <ScoreCell value={r.ideaValue} basis={r.ideaBasis} max={IDEA_MAX} />,
    },
    {
      key: "productScore",
      header: "Sản phẩm",
      align: "right",
      render: (r) => <ScoreCell value={r.productValue} basis={r.productBasis} max={PRODUCT_MAX} />,
    },
    {
      key: "engagement",
      header: "Lan tỏa",
      align: "right",
      render: (r) =>
        r.engagementValue == null ? (
          <span className="text-caption text-ink-3">chưa chốt</span>
        ) : (
          <span className="flex items-center justify-end gap-1.5">
            <span className="font-semibold tabular-nums text-ink">{r.engagementValue}</span>
            <span className="text-meta text-ink-3">/{ENGAGEMENT_MAX}</span>
          </span>
        ),
    },
    {
      /**
       * Tổng CẢ BA phase. Trước đây bảng chỉ có hai cột điểm rời nhau và điểm lan tỏa nằm ở màn
       * khác — muốn biết một bài đang đứng ở đâu trên thang 100 thì phải tự cộng nhẩm qua hai màn.
       * Cộng phần nào đã có, và nói rõ còn thiếu phần nào để con số không bị đọc nhầm là điểm chốt.
       */
      key: "total",
      header: "Tổng",
      align: "right",
      render: (r) => {
        const parts = [r.ideaValue, r.productValue, r.engagementValue];
        const have = parts.filter((v): v is number => v != null);
        if (have.length === 0) return <span className="text-caption text-ink-3">—</span>;
        /**
         * PHẢI cộng điểm thưởng đợt vào đây. Không cộng thì cột này ra 91.5 trong khi điểm công bố
         * của đúng bài đó là 96.5 — hai màn của cùng một hệ thống nói hai con số khác nhau, và BTC
         * không có cách nào biết bên nào đúng.
         */
        const sum = Math.round((have.reduce((a, v) => a + v, 0) + r.waveBonus) * 10) / 10;
        const missing = parts.length - have.length;
        return (
          <span className="flex flex-col items-end leading-tight">
            <span>
              <span className="font-semibold tabular-nums text-ink">{sum}</span>
              <span className="text-meta text-ink-3">/{TOTAL_MAX + r.waveBonus}</span>
            </span>
            {r.waveBonus > 0 && (
              <span className="text-meta text-teal-strong">gồm +{r.waveBonus} thưởng đợt</span>
            )}
            {missing > 0 && <span className="text-meta text-ink-3">thiếu {missing} phần</span>}
          </span>
        );
      },
    },
    {
      /**
       * Đặt NGAY SAU cột Tổng: tổng điểm đã gồm điểm thưởng của đợt, nên người đọc phải thấy ngay
       * bài này thuộc đợt nào mới hiểu con số cộng thêm từ đâu ra.
       */
      key: "wave",
      header: "Đợt",
      align: "center",
      render: (r) =>
        r.waveName ? (
          <span className="flex flex-col items-center leading-tight">
            <span className="text-caption text-ink">{r.waveName}</span>
            {r.waveBonus > 0 && (
              <span className="text-meta text-teal-strong">+{r.waveBonus} điểm</span>
            )}
          </span>
        ) : (
          <span className="text-caption text-ink-3">—</span>
        ),
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
      key: "stage",
      header: "Đang ở đâu",
      align: "center",
      render: (r) => <Badge tone={r.stageTone}>{r.stageLabel}</Badge>,
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
