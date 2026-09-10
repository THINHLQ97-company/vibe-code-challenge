import type { Checkpoint, CheckpointState } from "@/lib/checkpoints";
import { CheckCircleIcon, WarningIcon, CircleIcon, HourglassIcon } from "@/components/dsvh/icons";

/**
 * Dải sáu mốc CP1–CP6 — dùng CHUNG cho khu thí sinh và khu BTC.
 *
 * Bản trước chỉ có hai trạng thái xong/chưa xong, vẽ bằng một dấu tick hoặc một vòng tròn rỗng.
 * Hệ quả: năm ô chưa xong trông giống hệt nhau, thí sinh không biết phải làm cái nào trước, và
 * một mốc BỊ TỪ CHỐI (đề tài trả về, bị gắn cờ an toàn) nhìn y như một mốc chỉ đơn giản là chưa
 * tới lượt — trong khi hai thứ đó đòi hai hành động hoàn toàn khác nhau.
 *
 * Bốn trạng thái, bốn màu, lấy từ token DSVH:
 *   done (teal) · rejected (đỏ) · current (cam) · pending (xám)
 */
const TONE: Record<
  CheckpointState,
  { wrap: string; dot: string; label: string; icon: React.ReactNode; note: string }
> = {
  done: {
    wrap: "border-teal/35 bg-teal/[0.08]",
    dot: "border-teal/50 bg-teal/15 text-teal",
    label: "text-ink",
    icon: <CheckCircleIcon size={15} />,
    note: "text-teal-strong",
  },
  rejected: {
    wrap: "border-red/45 bg-red/[0.08]",
    dot: "border-red/55 bg-red/15 text-red",
    label: "text-ink",
    icon: <WarningIcon size={15} />,
    note: "text-red-strong",
  },
  current: {
    wrap: "border-orange/45 bg-orange/[0.08]",
    dot: "border-orange/55 bg-orange/15 text-orange-strong",
    label: "text-ink",
    icon: <HourglassIcon size={15} />,
    note: "text-orange-strong",
  },
  pending: {
    wrap: "border-stroke bg-surface-2",
    dot: "border-stroke bg-surface text-ink-3",
    label: "text-ink-3",
    icon: <CircleIcon size={15} />,
    note: "text-ink-3",
  },
};

const STATE_WORD: Record<CheckpointState, string> = {
  done: "Đã qua",
  rejected: "Cần xử lý",
  current: "Đang tới lượt",
  pending: "Chưa tới",
};

export function CheckpointTrail({
  checkpoints,
  /** `true` ở màn BTC — thu gọn, bỏ phần lý do dài. */
  compact = false,
}: {
  checkpoints: Checkpoint[];
  compact?: boolean;
}) {
  const done = checkpoints.filter((c) => c.state === "done").length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-caption text-ink-2">Tiến độ mốc bắt buộc</span>
        <span className="text-caption tabular-nums text-ink">
          <span className="font-semibold">{done}</span>
          <span className="text-ink-3">/{checkpoints.length}</span>
        </span>
      </div>

      {/* Thanh tiến độ ghép từ sáu đoạn, mỗi đoạn một mốc — đọc được tiến độ ngay cả khi thu gọn. */}
      <div className="mb-4 flex gap-1" aria-hidden>
        {checkpoints.map((c) => (
          <span
            key={c.code}
            className={`h-1.5 flex-1 rounded-full ${
              c.state === "done"
                ? "bg-teal"
                : c.state === "rejected"
                  ? "bg-red"
                  : c.state === "current"
                    ? "bg-orange"
                    : "bg-stroke"
            }`}
          />
        ))}
      </div>

      <ol className={`grid gap-2 ${compact ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {checkpoints.map((c, i) => {
          const t = TONE[c.state];
          return (
            <li key={c.code} className={`rounded-lg border p-3 ${t.wrap}`}>
              <div className="flex items-start gap-2.5">
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full border ${t.dot}`}
                >
                  {t.icon}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-meta font-semibold tabular-nums text-ink-3">
                      Mốc {i + 1}
                    </span>
                    <span className={`text-meta font-semibold ${t.note}`}>
                      {STATE_WORD[c.state]}
                    </span>
                  </div>
                  <p className={`mt-0.5 text-caption font-medium ${t.label}`}>
                    {c.label.replace(/^CP\d · /, "")}
                  </p>
                  {!compact && c.state === "rejected" && c.reason && (
                    <p className="mt-1.5 text-meta text-ink-2">{c.reason}</p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
