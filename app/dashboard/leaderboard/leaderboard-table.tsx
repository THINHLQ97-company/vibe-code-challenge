"use client";

import { Table, type ColumnDef } from "@/components/dsvh/ui/Table";
import { Badge } from "@/components/dsvh/ui/Badge";

export type LeaderboardRow = {
  id: number;
  productName: string;
  userName: string;
  department: string;
  finalScore: number | null;
  published: boolean;
  isMe: boolean;
};

/**
 * Cố ý KHÔNG có cột hạng 1/2/3 và không có huy hiệu quán quân.
 *
 * Đây là bảng ĐIỂM của một đợt đang thi, không phải bảng vinh danh: đợt chưa chấm xong nên gắn số
 * hạng lên là công bố một thứ tự chưa chốt, và người đứng "hạng 1" hôm nay có thể tụt khi những
 * bài còn lại được chấm. Giải và thứ hạng do BTC chốt khi đợt thi kết thúc, không phải do màn này suy ra.
 * Ở đây chỉ sắp điểm từ cao xuống thấp.
 */
export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  const columns: ColumnDef<LeaderboardRow>[] = [
    {
      key: "user",
      header: "Thí sinh",
      maxWidth: 260,
      render: (r) => (
        <div className="flex min-w-0 items-center gap-2">
          <div className="min-w-0">
            <div className="truncate font-medium text-ink">{r.userName}</div>
            <div className="truncate text-meta text-ink-3">{r.department}</div>
          </div>
          {r.isMe && <Badge tone="accent">Bạn</Badge>}
        </div>
      ),
    },
    {
      key: "product",
      header: "Sản phẩm",
      maxWidth: 340,
      render: (r) => <span className="block truncate text-ink-2">{r.productName}</span>,
    },
    {
      key: "status",
      header: "Trạng thái",
      align: "center",
      render: (r) =>
        r.published ? (
          <Badge tone="success">Đã công bố điểm</Badge>
        ) : (
          <Badge tone="warning">Đang thi</Badge>
        ),
    },
    {
      key: "score",
      header: "Điểm",
      align: "right",
      render: (r) =>
        r.finalScore != null ? (
          <span className="font-semibold tabular-nums text-ink">{r.finalScore}</span>
        ) : (
          <span className="text-caption text-ink-3">chưa có</span>
        ),
    },
  ];

  return (
    <Table
      data={rows}
      columns={columns}
      getRowId={(r) => r.id}
      variant="zebra"
      density="comfortable"
      stickyHeader={false}
      rowClassName={(r) => (r.isMe ? "bg-orange/5" : undefined)}
      emptyText="Chưa có ai trong đợt này"
      emptySubtext="Khi có người khác cùng đợt được duyệt đề tài, họ sẽ hiện ở đây."
    />
  );
}
