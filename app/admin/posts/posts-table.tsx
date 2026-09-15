"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, type ColumnDef } from "@/components/dsvh/ui/Table";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Textarea } from "@/components/dsvh/ui/form/Textarea";
import { Button } from "@/components/dsvh/ui/Button";
import { Input } from "@/components/dsvh/ui/Input";
import { Select } from "@/components/dsvh/ui/form/Select";
import { Modal } from "@/components/dsvh/ui/overlay/Modal";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Note } from "@/components/dsvh/ui/data/Note";
import {
  ArrowSquareOutIcon,
  MagnifyingGlassIcon,
} from "@/components/dsvh/icons";

export type PostRowData = {
  id: number;
  productName: string;
  userName: string;
  department: string;
  facebookPostUrl: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectNote: string | null;
  engagementCount: number | null;
  engagementTier: number | null;
  published: boolean;
  finalScore: number | null;
  missing: string[];
  /** Khung giờ hệ thống xếp để ban tổ chức cho bài lên nhóm; `null` khi bài chưa được xếp. */
  slotPeriod: string | null;
  slotDate: string | null;
  slotOrder: number;
};

export function PostsTable({ rows }: { rows: PostRowData[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState<PostRowData | null>(null);
  const [count, setCount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const [dateFilter, setDateFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");

  /**
   * Lọc theo NGÀY và theo KHUNG là hai việc khác nhau.
   *
   * Ngày trả lời "hôm nay tôi trực những bài nào"; khung trả lời "buổi sáng có những ai". Gộp một
   * danh sách chín dòng ghép sẵn ngày-với-khung thì muốn xem cả ngày phải chọn ba lần.
   *
   * Ngày giữ nguyên thứ tự máy chủ đã sắp (theo giờ bắt đầu khung), không sắp lại theo chuỗi —
   * chuỗi "01/11" sắp trước "08/10" nếu so theo chữ.
   */
  const dateOptions = useMemo(() => {
    const seen: string[] = [];
    for (const r of rows) if (r.slotDate && !seen.includes(r.slotDate)) seen.push(r.slotDate);
    return [
      { value: "all", label: "Tất cả ngày đăng" },
      ...seen.map((d) => ({ value: d, label: d })),
      { value: "none", label: "Chưa xếp khung" },
    ];
  }, [rows]);

  const periodOptions = useMemo(() => {
    const seen: string[] = [];
    for (const r of rows) if (r.slotPeriod && !seen.includes(r.slotPeriod)) seen.push(r.slotPeriod);
    return [
      { value: "all", label: "Tất cả khung giờ" },
      ...seen.map((p) => ({ value: p, label: p })),
    ];
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (dateFilter === "none" && r.slotDate) return false;
      if (dateFilter !== "all" && dateFilter !== "none" && r.slotDate !== dateFilter) return false;
      if (periodFilter !== "all" && r.slotPeriod !== periodFilter) return false;
      if (!needle) return true;
      return (
        r.productName.toLowerCase().includes(needle) || r.userName.toLowerCase().includes(needle)
      );
    });
  }, [rows, q, dateFilter, periodFilter]);

  function open(row: PostRowData) {
    setActive(row);
    setCount(row.engagementCount?.toString() ?? "");
    setError(null);
  }

  async function call(id: number, path: string, body?: unknown) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions/${id}/${path}`, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Thao tác thất bại");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
      return false;
    } finally {
      setLoading(false);
    }
  }

  const columns: ColumnDef<PostRowData>[] = [
    {
      key: "product",
      header: "Sản phẩm",
      maxWidth: 280,
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
      key: "post",
      header: "Bài đăng",
      align: "center",
      render: (r) => (
        <a
          href={r.facebookPostUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-link hover:text-link-hover"
        >
          Mở <ArrowSquareOutIcon size={13} />
        </a>
      ),
    },
    {
      key: "slotDate",
      header: "Ngày đăng",
      align: "center",
      render: (r) =>
        r.slotDate ? (
          <span className="whitespace-nowrap text-caption tabular-nums text-ink-2">
            {r.slotDate}
          </span>
        ) : (
          <span className="text-caption text-ink-3">chưa xếp</span>
        ),
    },
    {
      key: "slotPeriod",
      header: "Khung giờ",
      align: "center",
      render: (r) =>
        r.slotPeriod ? (
          <span className="whitespace-nowrap text-caption text-ink-2">{r.slotPeriod}</span>
        ) : (
          <span className="text-caption text-ink-3">—</span>
        ),
    },
    {
      key: "cp5",
      header: "Duyệt bài (CP5)",
      align: "center",
      render: (r) =>
        r.approvedAt ? (
          <span className="text-caption tabular-nums text-teal-strong">{r.approvedAt}</span>
        ) : (
          <Badge tone="warning">Chưa duyệt</Badge>
        ),
    },
    {
      key: "engagement",
      header: "Tương tác",
      align: "right",
      hideBelow: "md",
      render: (r) => (
        <span className="tabular-nums text-ink-2">
          {r.engagementCount != null ? r.engagementCount : "—"}
        </span>
      ),
    },
    {
      key: "tier",
      header: "Bậc lan tỏa",
      align: "center",
      render: (r) =>
        r.engagementTier != null ? (
          <Badge tone="accent">Bậc {r.engagementTier}/4</Badge>
        ) : (
          <span className="text-caption text-ink-3">chưa chốt</span>
        ),
    },
    {
      key: "result",
      header: "Kết quả",
      align: "center",
      render: (r) =>
        r.published ? (
          <Badge tone="success">Đã công bố · {r.finalScore}/100</Badge>
        ) : (
          <Badge tone="neutral">Chưa công bố</Badge>
        ),
    },
    {
      key: "action",
      header: "",
      align: "right",
      render: (r) => (
        <Button variant="ghost" size="sm" onClick={() => open(r)}>
          Xử lý
        </Button>
      ),
    },
  ];

  const blockers = active
    ? [...active.missing, ...(active.engagementTier == null ? ["chưa chốt điểm lan tỏa"] : [])]
    : [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <div className="w-full sm:w-52">
          <Select
            value={dateFilter}
            onChange={setDateFilter}
            options={dateOptions}
            placeholder="Lọc theo ngày đăng"
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            value={periodFilter}
            onChange={setPeriodFilter}
            options={periodOptions}
            placeholder="Lọc theo khung giờ"
          />
        </div>
      </div>
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
        emptyText="Chưa có bài đăng nào"
        emptySubtext="Thí sinh qua được Phase 2 mới dán được link bài — danh sách sẽ hiện ở đây."
      />

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.productName}
        description={`Bài đăng & lan tỏa · ${active?.userName ?? ""}`}
        size="lg"
        footer={
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setActive(null)}>
              Đóng
            </Button>
          </div>
        }
      >
        {active && (
          <div className="space-y-4">
            <a
              href={active.facebookPostUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-caption text-link hover:text-link-hover"
            >
              Mở bài đăng trên nhóm <ArrowSquareOutIcon size={14} />
            </a>

            <div className="rounded-lg border border-stroke bg-surface-2 p-3">
              <div className="text-caption font-semibold text-ink">Bước 1 · Duyệt bài đăng (CP5)</div>
              <div className="mt-2">
                {active.approvedAt ? (
                  <Badge tone="success">Đã duyệt · {active.approvedAt}</Badge>
                ) : active.rejectedAt ? (
                  <div className="space-y-1.5">
                    <Badge tone="danger">Đã từ chối · {active.rejectedAt}</Badge>
                    <p className="text-caption text-ink-2">{active.rejectNote}</p>
                    <p className="text-meta text-ink-3">
                      Thí sinh mất toàn bộ điểm lan tỏa và không đăng lại được.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="solid"
                      size="sm"
                      loading={loading}
                      onClick={async () => {
                        if (await call(active.id, "approve-post")) setActive(null);
                      }}
                    >
                      Duyệt bài đăng
                    </Button>

                    {/* Từ chối lấy mất 20 điểm của thí sinh và KHÔNG cho đăng lại, nên bắt buộc
                        nêu lý do và hỏi lại trước khi ghi. Câu lý do hiện thẳng cho thí sinh. */}
                    <Textarea
                      label="Lý do từ chối"
                      hint="Bắt buộc nếu từ chối — thí sinh đọc đúng câu này và không có cơ hội sửa"
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={loading}
                      disabled={rejectNote.trim().length < 10}
                      onClick={async () => {
                        if (!window.confirm("Từ chối bài đăng? Thí sinh mất toàn bộ điểm lan tỏa và không được đăng lại.")) return;
                        if (await call(active.id, "reject-post", { note: rejectNote })) {
                          setRejectNote("");
                          setActive(null);
                        }
                      }}
                    >
                      Từ chối bài đăng
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-stroke bg-surface-2 p-3">
              <div className="text-caption font-semibold text-ink">
                Bước 2 · Nhập tương tác sau đúng 7 ngày
              </div>
              {!active.approvedAt ? (
                <Note className="mt-2">Duyệt bài đăng trước rồi mới đếm tương tác được.</Note>
              ) : (
                <div className="mt-2 flex flex-wrap items-end gap-2">
                  <Input
                    label="Số tương tác"
                    type="number"
                    min={0}
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="w-48"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={loading}
                    disabled={!count}
                    onClick={async () => {
                      if (await call(active.id, "engagement", { count: Number(count) }))
                        setActive(null);
                    }}
                  >
                    Lưu & tính bậc
                  </Button>
                  {active.engagementTier != null && (
                    <Badge tone="accent">Bậc {active.engagementTier}/4</Badge>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-stroke bg-surface-2 p-3">
              <div className="text-caption font-semibold text-ink">Bước 3 · Công bố kết quả</div>
              <div className="mt-2">
                {active.published ? (
                  <Badge tone="success">Đã công bố · {active.finalScore}/100</Badge>
                ) : blockers.length > 0 ? (
                  <Note tone="warning">Chưa công bố được: {blockers.join(" · ")}.</Note>
                ) : (
                  <Button
                    variant="solid"
                    size="sm"
                    loading={loading}
                    onClick={async () => {
                      if (await call(active.id, "publish")) setActive(null);
                    }}
                  >
                    Xác nhận & công bố kết quả
                  </Button>
                )}
              </div>
            </div>

            {error && <Alert tone="error">{error}</Alert>}
          </div>
        )}
      </Modal>
    </div>
  );
}
