"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/dsvh/ui/Button";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
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
  published: boolean;
  /** Số phiếu giám khảo đã có ở từng phase — để biết bài nào còn suất chấm. */
  ballots: { phase1: number; phase2: number };
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

export function ScoringTable({
  rows,
  canPublish,
}: {
  rows: ScoringRowData[];
  /** Chỉ admin mới công bố được — giám khảo không thấy cả thanh công bố lẫn ô chọn. */
  canPublish: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [report, setReport] = useState<{ published: number; failed: number; lines: string[] } | null>(
    null
  );

  async function publishSelected() {
    setReport(null);
    setPublishing(true);
    try {
      const res = await fetch("/api/admin/submissions/publish-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected.map(Number) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReport({ published: 0, failed: selected.length, lines: [data.error ?? "Không công bố được"] });
        return;
      }
      // Liệt kê TỪNG bài không công bố được kèm lý do. Một lô mấy chục bài mà chỉ báo "xong" thì
      // người bấm không bao giờ biết bài nào chưa ra.
      const byId = new Map(rows.map((r) => [r.id, r.productName]));
      const lines = (data.results as Array<{ id: number; ok: boolean; error?: string }>)
        .filter((r) => !r.ok)
        .map((r) => `${byId.get(r.id) ?? `Bài #${r.id}`}: ${r.error}`);
      setReport({ published: data.published, failed: data.failed, lines });
      setSelected([]);
      router.refresh();
    } catch {
      setReport({ published: 0, failed: selected.length, lines: ["Không kết nối được máy chủ"] });
    } finally {
      setPublishing(false);
    }
  }


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
       * Đợt và điểm thưởng đứng CẠNH NHAU, ngay TRƯỚC cột Tổng — đọc theo thứ tự trái sang phải
       * là thấy đủ các số hạng rồi mới tới tổng. Trước đây điểm thưởng chỉ nằm ẩn trong ghi chú
       * dưới ô Tổng, nên nhìn bảng không biết con số cộng thêm từ đâu ra.
       */
      key: "wave",
      header: "Đợt",
      align: "center",
      render: (r) =>
        r.waveName ? (
          <span className="text-caption text-ink">{r.waveName}</span>
        ) : (
          <span className="text-caption text-ink-3">—</span>
        ),
    },
    {
      key: "bonus",
      header: "Thưởng",
      align: "right",
      render: (r) =>
        r.waveName == null ? (
          <span className="text-caption text-ink-3">—</span>
        ) : r.waveBonus > 0 ? (
          <span className="font-semibold tabular-nums text-teal-strong">+{r.waveBonus}</span>
        ) : (
          <span className="tabular-nums text-caption text-ink-3">0</span>
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
            {missing > 0 && <span className="text-meta text-ink-3">thiếu {missing} phần</span>}
          </span>
        );
      },
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
      {report && (
        <Alert
          tone={report.failed > 0 ? "warning" : "success"}
          title={`Công bố ${report.published} bài${report.failed > 0 ? `, ${report.failed} bài chưa ra` : ""}`}
        >
          {report.lines.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {report.lines.map((l) => (
                <li key={l} className="text-caption">
                  · {l}
                </li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      {canPublish && selected.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stroke bg-surface-2 px-3 py-2">
          <span className="text-caption text-ink-2">Đã chọn {selected.length} bài</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
              Bỏ chọn
            </Button>
            <Button
              variant="solid"
              size="sm"
              loading={publishing}
              onClick={() => void publishSelected()}
            >
              Công bố {selected.length} bài
            </Button>
          </div>
        </div>
      )}

      <Table
        data={filtered}
        columns={columns}
        getRowId={(r) => r.id}
        selectable={canPublish}
        selectedRowIds={selected}
        onSelectionChange={setSelected}
        variant="zebra"
        density="comfortable"
        stickyHeader={false}
        emptyText="Không có bài nào khớp"
        emptySubtext="Đổi từ khoá tìm kiếm, hoặc duyệt thêm đề tài ở mục Duyệt đề tài."
      />
    </div>
  );
}
