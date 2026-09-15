"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/dsvh/ui/Button";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { SegmentedControl } from "@/components/dsvh/ui/SegmentedControl";
import { Checkbox } from "@/components/dsvh/ui/form/Checkbox";
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
  board: "ky_thuat" | "van_phong" | null;
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
  phase1Published: boolean;
  phase2Published: boolean;
  /** Số phiếu giám khảo đã có ở từng phase — để biết bài nào còn suất chấm. */
  ballots: { phase1: number; phase2: number };
  iScored: boolean;
  stageLabel: string;
  stageTone: "neutral" | "success" | "warning" | "danger";
};

/** Một chấm cho một lần gửi điểm — sáng là đã gửi, mờ là chưa. Tên đầy đủ nằm ở thuộc tính title. */
function PublishDot({ on, label, strong }: { on: boolean; label: string; strong?: boolean }) {
  return (
    <span
      title={`${label}: ${on ? "đã gửi" : "chưa gửi"}`}
      className={`size-2.5 rounded-full ${
        on ? (strong ? "bg-teal-strong" : "bg-teal") : "bg-stroke"
      }`}
    />
  );
}

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
  const [board, setBoard] = useState("all");
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [target, setTarget] = useState<"1" | "2" | "final">("1");
  const [undo, setUndo] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [report, setReport] = useState<{
    published: number;
    failed: number;
    lines: string[];
    label?: string;
  } | null>(null);

  async function publishSelected() {
    setReport(null);
    setPublishing(true);
    try {
      const res = await fetch("/api/admin/submissions/publish-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selected.map(Number),
          target: target === "final" ? "final" : Number(target),
          undo,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReport({
          published: 0,
          failed: selected.length,
          lines: [data.error ?? "Không gửi được"],
        });
        return;
      }
      // Liệt kê TỪNG bài không công bố được kèm lý do. Một lô mấy chục bài mà chỉ báo "xong" thì
      // người bấm không bao giờ biết bài nào chưa ra.
      const byId = new Map(rows.map((r) => [r.id, r.productName]));
      const lines = (data.results as Array<{ id: number; ok: boolean; error?: string }>)
        .filter((r) => !r.ok)
        .map((r) => `${byId.get(r.id) ?? `Bài #${r.id}`}: ${r.error}`);
      setReport({ published: data.published, failed: data.failed, lines, label: data.label });
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
    return rows.filter((r) => {
      if (board !== "all" && r.board !== board) return false;
      if (!needle) return true;
      return (
        r.productName.toLowerCase().includes(needle) ||
        r.userName.toLowerCase().includes(needle) ||
        r.department.toLowerCase().includes(needle)
      );
    });
  }, [rows, q, board]);

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
          {r.board ? ` · ${r.board === "ky_thuat" ? "Kỹ thuật" : "Văn phòng"}` : ""}
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
      /**
       * Ba chấm cho ba lần gửi điểm. Gộp thành một cột "đã công bố chưa" thì không trả lời được
       * câu hỏi thật của ban tổ chức vào chiều thứ Bảy: bài này đã gửi điểm ý tưởng chưa, còn sản
       * phẩm thì sao.
       */
      key: "published",
      header: "Đã gửi điểm",
      align: "center",
      render: (r) => (
        <span className="flex items-center justify-center gap-1">
          <PublishDot on={r.phase1Published} label="Ý tưởng" />
          <PublishDot on={r.phase2Published} label="Sản phẩm" />
          <PublishDot on={r.published} label="Kết quả cuối" strong />
        </span>
      ),
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
      {/* Lọc theo bảng thi: giải thưởng trao riêng từng bảng, nên giám khảo thường chấm gọn một
          bảng một lượt thay vì nhảy qua lại. */}
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          options={[
            { value: "all", label: "Cả hai bảng" },
            { value: "ky_thuat", label: "Kỹ thuật" },
            { value: "van_phong", label: "Văn phòng" },
          ]}
          value={board}
          onChange={setBoard}
          size="sm"
        />
      </div>
      {/* Lọc theo bảng thi: giải thưởng trao riêng từng bảng, nên giám khảo thường chấm gọn một
          bảng một lượt thay vì nhảy qua lại giữa hai nhóm. */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Tìm theo tên sản phẩm, thí sinh hoặc phòng ban"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          leftIcon={<MagnifyingGlassIcon size={16} />}
          className="max-w-sm"
        />
        <SegmentedControl
          options={[
            { value: "all", label: "Cả hai bảng" },
            { value: "ky_thuat", label: "Kỹ thuật" },
            { value: "van_phong", label: "Văn phòng" },
          ]}
          value={board}
          onChange={setBoard}
          size="sm"
        />
      </div>
      {report && (
        <Alert
          tone={report.failed > 0 ? "warning" : "success"}
          title={`${undo ? "Gỡ" : "Gửi"} ${report.label ?? "điểm"} cho ${report.published} bài${report.failed > 0 ? `, ${report.failed} bài không thực hiện được` : ""}`}
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
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-caption text-ink-2">Đã chọn {selected.length} bài</span>
            {/* Chọn gửi phần nào TRƯỚC khi bấm. Ban tổ chức gửi điểm theo đợt vào cuối tuần, và
                phần lớn lần bấm là "gửi điểm Ý tưởng cho tất cả ai vừa xong" — nên để nó mặc định. */}
            <SegmentedControl
              options={[
                { value: "1", label: "Ý tưởng" },
                { value: "2", label: "Sản phẩm" },
                { value: "final", label: "Kết quả cuối" },
              ]}
              value={target}
              onChange={(v) => setTarget(v as "1" | "2" | "final")}
              size="sm"
            />
            <Checkbox checked={undo} onChange={setUndo} label="Gỡ điểm đã gửi" />
          </div>
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
              {undo ? "Gỡ" : "Gửi"} {selected.length} bài
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
