"use client";

import { useMemo, useState } from "react";
import { Table } from "@/components/dsvh/ui/Table";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Input } from "@/components/dsvh/ui/Input";
import { Avatar } from "@/components/dsvh/ui/data/Avatar";
import { UsersThreeIcon, MagnifyingGlassIcon } from "@/components/dsvh/icons";
import { SegmentedControl } from "@/components/dsvh/ui/SegmentedControl";

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
  waveId: number | null;
  waveName: string | null;
};

export function CandidatesTable({ rows }: { rows: CandidateRow[] }) {
  const [search, setSearch] = useState("");
  const [wave, setWave] = useState("all");
  const [board, setBoard] = useState("all");

  /**
   * Các đợt suy TỪ DỮ LIỆU của bảng, không truyền riêng từ ngoài: bộ lọc chỉ nên liệt kê những đợt
   * thật sự có người, nếu không BTC bấm vào một đợt rồi thấy bảng trống và không rõ do lọc sai hay
   * do đợt đó chưa ai đăng ký.
   */
  const waveTabs = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of rows) {
      if (r.waveId != null && r.waveName) seen.set(String(r.waveId), r.waveName);
    }
    const tabs = [{ value: "all", label: "Tất cả" }];
    for (const [value, label] of seen) tabs.push({ value, label });
    if (rows.some((r) => r.waveId == null)) tabs.push({ value: "none", label: "Chưa có đợt" });
    return tabs;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      // Bảng thi lưu dạng nhãn tiếng Việt ("Bảng Kỹ thuật"), nên so theo chuỗi con thay vì bằng
      // nhau — nhãn đổi cách viết hoa hay thêm chữ là bộ lọc gãy im lặng.
      if (board !== "all" && !r.board.toLowerCase().includes(board)) return false;
      if (wave === "none" && r.waveId != null) return false;
      if (wave !== "all" && wave !== "none" && String(r.waveId) !== wave) return false;
      if (!q) return true;
      return (
        r.userName.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    });
  }, [rows, search, wave, board]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Tìm theo tên, phòng ban hoặc sản phẩm"
          leftIcon={<MagnifyingGlassIcon size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        {/* Chỉ hiện bộ lọc khi thật sự có đợt để lọc — một dải nút chỉ có mỗi "Tất cả" là nhiễu. */}
        <SegmentedControl
          options={[
            { value: "all", label: "Cả hai bảng" },
            { value: "kỹ thuật", label: "Kỹ thuật" },
            { value: "văn phòng", label: "Văn phòng" },
          ]}
          value={board}
          onChange={setBoard}
          size="sm"
        />
        {waveTabs.length > 1 && (
          <SegmentedControl options={waveTabs} value={wave} onChange={setWave} size="sm" />
        )}
      </div>
      <Table<CandidateRow>
        data={filtered}
        getRowId={(r) => r.id}
        emptyText={search || wave !== "all" || board !== "all" ? "Không có thí sinh nào khớp" : "Chưa có thí sinh nào đăng ký"}
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
