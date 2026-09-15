"use client";

import { useState } from "react";
import { Modal } from "@/components/dsvh/ui/overlay/Modal";
import { formatDateVN } from "@/lib/datetime";

/**
 * LỊCH THÁNG của MỘT đợt thi, hiện trong hộp thoại.
 *
 * Hai bản trước đều cố nhét cả năm đợt vào một hình: bản đầu xếp thành khối nội dung, bản sau vẽ
 * dải thời gian. Bản nào cũng làm trang chủ dài thêm một màn hình, mà người đọc thì chỉ quan tâm
 * MỘT đợt — đợt họ định thi. Nên lịch nay nằm sau một nút bấm, và vẽ đúng thứ ai cũng đọc được
 * không cần chú giải phức tạp: một tờ lịch tháng, tô màu vào những ngày có việc.
 *
 * Hộp thoại dùng nền sáng của DSVH kể cả khi mở từ trang giới thiệu nền tối — hộp thoại là một
 * mặt phẳng riêng nổi lên trên, không phải một mảng của trang bên dưới.
 */

export type CalendarWave = {
  name: string;
  registrationOpensAt: string;
  registrationClosesAt: string;
  phase2OpensAt: string | null;
  phase2ClosesAt: string | null;
  judgingDates: string[];
  postingOpensAt: string | null;
  postingClosesAt: string | null;
  completedAt: string | null;
};

const DAY_MS = 86_400_000;
/** Giờ Việt Nam là UTC+7 quanh năm — cộng 7 tiếng rồi chia ngày là ra số ngày theo lịch Việt Nam. */
const VN_OFFSET_MS = 7 * 3_600_000;

function vnDay(value: string): number {
  return Math.floor((Date.parse(value) + VN_OFFSET_MS) / DAY_MS);
}
function dayToDate(n: number): Date {
  return new Date(n * DAY_MS);
}
/** Số ngày VN của ngày 1 tháng `m` năm `y`. */
function firstOfMonth(y: number, m: number): number {
  return Math.floor(Date.UTC(y, m, 1) / DAY_MS);
}

type Band = "dang-ky" | "lam-bai" | "dang-bai";
type Mark = "cham" | "han-nop" | "khep-lai";

const BAND_CLASS: Record<Band, string> = {
  "dang-ky": "bg-orange/20 text-ink",
  "lam-bai": "bg-stroke-soft text-ink",
  "dang-bai": "bg-teal/20 text-ink",
};

const MARK_CLASS: Record<Mark, string> = {
  cham: "bg-ink-2",
  "han-nop": "bg-amber",
  "khep-lai": "bg-ink-3",
};

const MARK_LABEL: Record<Mark, string> = {
  cham: "ban giám khảo trả kết quả",
  "han-nop": "hạn nộp sản phẩm",
  "khep-lai": "đợt khép lại",
};

function buildDayMap(w: CalendarWave) {
  const bands = new Map<number, Band>();
  const marks = new Map<number, Mark[]>();

  const fill = (from: string, to: string, band: Band) => {
    for (let d = vnDay(from); d <= vnDay(to); d++) bands.set(d, band);
  };
  const mark = (at: string, m: Mark) => {
    const d = vnDay(at);
    marks.set(d, [...(marks.get(d) ?? []), m]);
  };

  // Tô theo thứ tự thời gian: chặng sau đè chặng trước ở ngày giao nhau, vì ngày đó thuộc về việc
  // đang tới chứ không phải việc vừa xong.
  fill(w.registrationOpensAt, w.registrationClosesAt, "dang-ky");
  if (w.phase2OpensAt && w.phase2ClosesAt) fill(w.phase2OpensAt, w.phase2ClosesAt, "lam-bai");
  if (w.postingOpensAt && w.postingClosesAt) fill(w.postingOpensAt, w.postingClosesAt, "dang-bai");

  for (const d of w.judgingDates) mark(d, "cham");
  if (w.phase2ClosesAt) mark(w.phase2ClosesAt, "han-nop");
  if (w.completedAt) mark(w.completedAt, "khep-lai");

  return { bands, marks };
}

export function WaveCalendar({ wave }: { wave: CalendarWave }) {
  const { bands, marks } = buildDayMap(wave);

  const all = [...bands.keys(), ...marks.keys()];
  const first = Math.min(...all);
  const last = Math.max(...all);

  // Các tháng mà đợt này chạm tới — vẽ trọn tháng để tờ lịch trông đúng là tờ lịch.
  const months: { y: number; m: number }[] = [];
  const d0 = dayToDate(first);
  const d1 = dayToDate(last);
  for (
    let y = d0.getUTCFullYear(), m = d0.getUTCMonth();
    y < d1.getUTCFullYear() || (y === d1.getUTCFullYear() && m <= d1.getUTCMonth());
    m === 11 ? ((y += 1), (m = 0)) : (m += 1)
  ) {
    months.push({ y, m });
  }

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2">
        {months.map(({ y, m }) => (
          <MonthGrid key={`${y}-${m}`} year={y} month={m} bands={bands} marks={marks} />
        ))}
      </div>
      <Legend wave={wave} />
    </div>
  );
}

function MonthGrid({
  year,
  month,
  bands,
  marks,
}: {
  year: number;
  month: number;
  bands: Map<number, Band>;
  marks: Map<number, Mark[]>;
}) {
  const start = firstOfMonth(year, month);
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  // Cột đầu tiên là thứ Hai: getUTCDay() trả 0 cho Chủ nhật, nên đẩy Chủ nhật về cuối tuần.
  const lead = (dayToDate(start).getUTCDay() + 6) % 7;

  return (
    <div>
      <p className="mb-2 text-body font-semibold text-ink">
        Tháng {month + 1}/{year}
      </p>
      <div className="grid grid-cols-7 gap-1">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
          <div key={d} className="pb-0.5 text-center text-meta font-medium text-ink-3">
            {d}
          </div>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const dayNum = start + i;
          const band = bands.get(dayNum);
          const dayMarks = marks.get(dayNum) ?? [];
          const weekend = [5, 6].includes((dayToDate(dayNum).getUTCDay() + 6) % 7);

          const title = [
            band === "dang-ky" ? "mở đăng ký" : band === "lam-bai" ? "kỳ làm bài" : band === "dang-bai" ? "đăng bài lan tỏa" : null,
            ...dayMarks.map((m) => MARK_LABEL[m]),
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <div
              key={dayNum}
              title={title ? `${formatDateVN(dayToDate(dayNum))} — ${title}` : undefined}
              className={`flex aspect-square flex-col items-center justify-center rounded-md text-caption tabular-nums ${
                band
                  ? BAND_CLASS[band]
                  : weekend
                    ? "text-ink-3"
                    : "text-ink-2"
              }`}
            >
              <span className={dayMarks.length > 0 ? "font-bold" : ""}>{i + 1}</span>
              {dayMarks.length > 0 && (
                <span className="mt-0.5 flex gap-0.5">
                  {dayMarks.map((m) => (
                    <span key={m} className={`size-1.5 rounded-full ${MARK_CLASS[m]}`} />
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Legend({ wave }: { wave: CalendarWave }) {
  const items = [
    { swatch: "bg-orange/35", label: "Mở đăng ký", when: `${formatDateVN(wave.registrationOpensAt)} – ${formatDateVN(wave.registrationClosesAt)}` },
    wave.phase2OpensAt && wave.phase2ClosesAt
      ? { swatch: "bg-stroke-soft", label: "Kỳ làm bài", when: `${formatDateVN(wave.phase2OpensAt)} – ${formatDateVN(wave.phase2ClosesAt)}` }
      : null,
    wave.postingOpensAt && wave.postingClosesAt
      ? { swatch: "bg-teal/35", label: "Đăng bài lan tỏa", when: `${formatDateVN(wave.postingOpensAt)} – ${formatDateVN(wave.postingClosesAt)}` }
      : null,
  ].filter((x): x is { swatch: string; label: string; when: string } => x !== null);

  const dots = [
    wave.judgingDates.length > 0
      ? { cls: MARK_CLASS.cham, label: "Ban giám khảo trả kết quả", when: wave.judgingDates.map((d) => formatDateVN(d)).join(" · ") }
      : null,
    wave.phase2ClosesAt
      ? { cls: MARK_CLASS["han-nop"], label: "Hạn nộp sản phẩm", when: formatDateVN(wave.phase2ClosesAt) }
      : null,
    wave.completedAt
      ? { cls: MARK_CLASS["khep-lai"], label: "Đợt khép lại", when: formatDateVN(wave.completedAt) }
      : null,
  ].filter((x): x is { cls: string; label: string; when: string } => x !== null);

  return (
    <div className="mt-5 space-y-1.5 border-t border-stroke-soft pt-3">
      {items.map((it) => (
        <div key={it.label} className="flex flex-wrap items-center gap-2 text-caption">
          <span className={`size-3.5 shrink-0 rounded ${it.swatch}`} />
          <span className="text-ink">{it.label}</span>
          <span className="tabular-nums text-ink-3">{it.when}</span>
        </div>
      ))}
      {dots.map((it) => (
        <div key={it.label} className="flex flex-wrap items-center gap-2 text-caption">
          <span className="flex size-3.5 shrink-0 items-center justify-center">
            <span className={`size-2 rounded-full ${it.cls}`} />
          </span>
          <span className="text-ink">{it.label}</span>
          <span className="tabular-nums text-ink-3">{it.when}</span>
        </div>
      ))}
    </div>
  );
}

/** Nút mở lịch — dùng được cả trên nền tối của trang giới thiệu lẫn nền sáng trong khu thí sinh. */
export function WaveCalendarButton({
  wave,
  label = "Xem lịch đợt này",
  tone = "dark",
}: {
  wave: CalendarWave;
  label?: string;
  tone?: "dark" | "light";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          tone === "dark"
            ? "rounded-lg border border-cream/20 px-2.5 py-1 text-meta font-medium text-cream/85 transition-colors hover:bg-cream/10 hover:text-cream"
            : "rounded-lg border border-stroke px-2.5 py-1 text-caption font-medium text-ink-2 transition-colors hover:border-stroke-strong hover:text-ink"
        }
      >
        {label}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Lịch ${wave.name}`}
        description="Ngày tô màu là ngày có việc; chấm tròn là mốc phải nhớ."
        size="lg"
      >
        <WaveCalendar wave={wave} />
      </Modal>
    </>
  );
}
