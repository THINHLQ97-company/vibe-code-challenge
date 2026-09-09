"use client";

import { Table } from "@/components/dsvh/ui/Table";
import { Badge } from "@/components/dsvh/ui/Badge";
import { TrophyIcon } from "@/components/dsvh/icons";

export type LeaderboardRow = {
  id: number;
  rank: number;
  productName: string;
  finalScore: number | null;
  userName: string | null;
  isMe: boolean;
};

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <Table<LeaderboardRow>
      data={rows}
      getRowId={(r) => r.id}
      rowClassName={(r) => (r.isMe ? "bg-cream-100" : undefined)}
      emptyText="Chưa có bài nào được công bố"
      emptySubtext="Khi BTC chốt điểm và bấm công bố, thứ hạng của bảng bạn sẽ hiện ở đây."
      emptyIcon={<TrophyIcon size={36} />}
      columns={[
        {
          key: "rank",
          header: "Hạng",
          width: 72,
          render: (r) =>
            r.rank <= 3 ? (
              <span className="flex items-center gap-1.5 font-semibold text-ink">
                <TrophyIcon size={15} className={r.rank === 1 ? "text-amber" : "text-ink-3"} />
                {r.rank}
              </span>
            ) : (
              <span className="tabular-nums text-ink-2">{r.rank}</span>
            ),
        },
        {
          key: "user",
          header: "Thí sinh",
          render: (r) => (r.isMe ? <Badge tone="accent">Bạn</Badge> : <span>{r.userName}</span>),
        },
        { key: "product", header: "Sản phẩm", accessorKey: "productName" },
        {
          key: "score",
          header: "Điểm",
          align: "right",
          width: 96,
          render: (r) => <span className="font-semibold tabular-nums text-ink">{r.finalScore}</span>,
        },
      ]}
    />
  );
}
