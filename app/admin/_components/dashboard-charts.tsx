"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { Note } from "@/components/dsvh/ui/data/Note";
import { FolderIcon, UsersThreeIcon } from "@/components/dsvh/icons";
import {
  C,
  axisTick,
  chartFrame,
  cursorBar,
  pieTooltip,
  TooltipCard,
} from "@/components/dsvh/charts/kit";

/**
 * `initialDimension` cho `ResponsiveContainer`: không có nó thì Recharts đợi đo bề ngang thật rồi
 * mới vẽ, nên HTML từ server KHÔNG có biểu đồ nào và người dùng thấy một ô trống cho tới khi JS
 * tải xong. Bản `ui/chart.tsx` của DSVH cũng đặt sẵn hằng này vì đúng lý do đó.
 */
const INITIAL_DIMENSION = { width: 320, height: 200 } as const;

export type Slice = { label: string; value: number };
export type StageSlice = Slice & { tone: "done" | "waiting" | "blocked" | "idle" };

/**
 * Dãy màu cho biểu đồ tròn, lấy từ palette của `charts/kit` (bản sao token, được gate CHARTKIT canh).
 * Recharts vẽ SVG nên `fill` cần màu literal, không nhận class Tailwind — đó là lý do kit tồn tại.
 */
const PIE_COLORS = [
  C.orange,
  C.teal,
  C.magenta,
  C.orangeBright,
  C.mint,
  C.peach,
  C.unit,
  C.ink3,
  C.strokeStrong,
];

/** Màu theo NGHĨA trạng thái, không theo thứ tự — trùng bảng tone của `lib/stage-status.ts`. */
const STAGE_COLORS: Record<StageSlice["tone"], string> = {
  done: C.teal,
  waiting: C.amber,
  blocked: C.red,
  idle: C.ink3,
};

function Legend({ items }: { items: { label: string; value: number; color: string }[] }) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  return (
    <ul className="mt-3 space-y-1.5">
      {items.map((i) => (
        <li key={i.label} className="flex items-center justify-between gap-3 text-caption">
          <span className="flex min-w-0 items-center gap-2 text-ink-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: i.color }}
            />
            <span className="truncate">{i.label}</span>
          </span>
          <span className="shrink-0 tabular-nums text-ink">
            <span className="font-semibold">{i.value}</span>
            <span className="ml-1.5 text-ink-3">{Math.round((i.value / total) * 100)}%</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Donut({
  data,
  colorOf,
  centerLabel,
}: {
  data: Slice[];
  colorOf: (row: Slice, index: number) => string;
  centerLabel: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className={`relative h-[200px] ${chartFrame}`}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={INITIAL_DIMENSION}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={58}
            outerRadius={88}
            paddingAngle={2}
            stroke={C.surface}
            strokeWidth={2}
          >
            {data.map((row, i) => (
              <Cell key={row.label} fill={colorOf(row, i)} />
            ))}
          </Pie>
          <Tooltip
            content={pieTooltip<Slice>({
              label: (r) => r.label,
              value: (r) => `${r.value} bài · ${Math.round((r.value / (total || 1)) * 100)}%`,
              color: (r) => colorOf(r, data.indexOf(r)),
            })}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Số tổng đặt giữa lỗ donut — `pointer-events-none` để không chắn chuột rê lên các lát. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-kpi font-bold tabular-nums text-ink">{total}</span>
        <span className="text-meta text-ink-3">{centerLabel}</span>
      </div>
    </div>
  );
}

export function TopicDonut({ data }: { data: Slice[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader
          title="Phân bổ theo nhóm chủ đề"
          subtitle="Dùng để cân bằng ngân hàng đề tài và định hướng gợi ý cho đợt đăng ký sau"
        />
        <Empty
          icon={<FolderIcon size={40} />}
          title="Chưa có đăng ký nào"
          description="Khi thí sinh đăng ký đề tài, phân bổ theo nhóm chủ đề sẽ hiện ở đây."
        />
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader
        title="Phân bổ theo nhóm chủ đề"
        subtitle="Dùng để cân bằng ngân hàng đề tài và định hướng gợi ý cho đợt đăng ký sau"
      />
      <Donut data={data} colorOf={(_, i) => PIE_COLORS[i % PIE_COLORS.length]} centerLabel="đề tài" />
      <Legend
        items={data.map((d, i) => ({ ...d, color: PIE_COLORS[i % PIE_COLORS.length] }))}
      />
      <Note className="mt-3">
        Trần 30–40 bài/tuần là để hội đồng và hệ chấm kham nổi — không phải để loại người.
      </Note>
    </Card>
  );
}

export function StageDonut({ data }: { data: StageSlice[] }) {
  if (data.length === 0) return null;
  return (
    <Card>
      <CardHeader
        title="Bài dự thi đang ở đâu"
        subtitle="Đỏ là đang bị chặn, vàng là đang chờ một bên xử lý — nhìn để biết chỗ nào tắc"
      />
      <Donut
        data={data}
        colorOf={(row) => STAGE_COLORS[(row as StageSlice).tone]}
        centerLabel="bài dự thi"
      />
      <Legend items={data.map((d) => ({ ...d, color: STAGE_COLORS[d.tone] }))} />
    </Card>
  );
}

export function DepartmentBars({ data }: { data: Slice[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader title="Tham dự theo phòng ban" subtitle="Đếm từ đăng ký thật của mùa thi" />
        <Empty
          icon={<UsersThreeIcon size={40} />}
          title="Chưa có ai đăng ký"
          description="Số liệu lấy trực tiếp từ đề tài đã nộp — chưa có đăng ký thì chưa có gì để vẽ."
        />
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader
        title="Tham dự theo phòng ban"
        subtitle="Đếm từ đăng ký thật của mùa thi — dùng để biết phòng nào cần thúc thêm"
      />
      <div className={`h-[220px] ${chartFrame}`}>
        <ResponsiveContainer width="100%" height="100%" initialDimension={INITIAL_DIMENSION}>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} />
            <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              cursor={cursorBar}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0]?.payload as Slice;
                return (
                  <TooltipCard
                    rows={[{ color: C.orange, label: row.label, value: `${row.value} người` }]}
                  />
                );
              }}
            />
            <Bar dataKey="value" fill={C.orange} radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Note className="mt-3">
        Bảng Kỹ thuật gồm TS và DE; các phòng còn lại thuộc bảng Văn phòng. Hai bảng xếp hạng riêng.
      </Note>
    </Card>
  );
}
