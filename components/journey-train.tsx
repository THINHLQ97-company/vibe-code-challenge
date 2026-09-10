"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { JOURNEY_STEPS } from "@/lib/journey-steps";
import { GlassCard, DarkNote } from "@/components/landing-ui";
import { MarkCheck, MarkArrowRight, MarkShieldAlert } from "@/components/landing-art";

/**
 * SÁU MỐC dựng thành một đoàn tàu, mỗi lần chỉ mở chi tiết MỘT toa.
 *
 * Vì sao không để cả sáu thẻ cạnh nhau như bản trước: nội dung mỗi mốc nay dài gấp ba (bạn làm gì ·
 * điều kiện đi tiếp · nếu chưa đạt), sáu thẻ đầy chữ xếp cạnh nhau thì không ai đọc. Một toa một
 * lúc buộc người đọc đi theo đúng trình tự họ sẽ trải qua.
 *
 * ── ẢNH TOA TÀU ────────────────────────────────────────────────────────────────────────────
 * Bốn mảnh đều cao 306px nên ghép ngang liền mạch: đầu tàu mở màn (bước 1), bốn toa giữa
 * (bước 2–5), đuôi tàu khép lại (bước 6), giữa mỗi toa là một mối nối. Bề rộng mỗi mảnh khác
 * nhau nên phải khai riêng — không co tất cả về một cỡ, làm thế là bóp méo hình.
 *
 * ── CHUYỂN ĐỘNG ────────────────────────────────────────────────────────────────────────────
 * Cả dải tàu là MỘT khối được dịch ngang bằng `translateX`, không phải cuộn từng toa: dịch một
 * khối thì trình duyệt chạy trên GPU, mượt kể cả trên máy yếu. Toa đang mở được đưa về giữa khung
 * nhìn. Tôn trọng `prefers-reduced-motion` — ai tắt hiệu ứng thì nhảy thẳng, không trượt.
 */

/** Bề rộng thật của từng mảnh ở chiều cao 306px. */
const PIECE = {
  head: { src: "/train-head.webp", w: 746 },
  middle: { src: "/train-middle.webp", w: 503 },
  last: { src: "/train-last.webp", w: 558 },
  connector: { src: "/train-connector.webp", w: 42 },
} as const;

const NATURAL_H = 306;

export function JourneyTrain() {
  const [active, setActive] = useState(0);
  const [scale, setScale] = useState(0.42);
  const viewportRef = useRef<HTMLDivElement>(null);

  /** Cao toa theo bề ngang màn: hẹp thì nhỏ lại để vẫn thấy được toa kế bên. */
  useEffect(() => {
    const fit = () => {
      const w = window.innerWidth;
      const h = w < 640 ? 84 : w < 1024 ? 110 : 140;
      setScale(h / NATURAL_H);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const go = useCallback((next: number) => {
    setActive((cur) => {
      const n = Math.max(0, Math.min(JOURNEY_STEPS.length - 1, next));
      return n === cur ? cur : n;
    });
  }, []);

  /** Mũi tên trái/phải trên bàn phím — dải tàu là một danh sách, điều hướng như danh sách. */
  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
  }

  // Toạ độ tâm từng toa trong dải, tính theo bề rộng thật rồi nhân tỉ lệ.
  const px = (n: number) => n * scale;
  const centers: number[] = [];
  let x = 0;
  JOURNEY_STEPS.forEach((s, i) => {
    if (i > 0) x += px(PIECE.connector.w);
    const w = px(PIECE[s.carriage].w);
    centers.push(x + w / 2);
    x += w;
  });
  const totalW = x;

  const [viewportW, setViewportW] = useState(0);
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewportW(el.clientWidth));
    ro.observe(el);
    setViewportW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Đưa toa đang mở về giữa, nhưng không kéo dải ra khỏi hai mép.
  const offset = viewportW
    ? Math.max(Math.min(viewportW / 2 - centers[active], 0), Math.min(viewportW - totalW, 0))
    : 0;

  const step = JOURNEY_STEPS[active];

  return (
    <div>
      {/* ── Dải tàu ─────────────────────────────────────────────────────────────────────── */}
      <div
        ref={viewportRef}
        role="tablist"
        aria-label="Sáu mốc bắt buộc"
        onKeyDown={onKey}
        className="relative overflow-hidden py-2"
      >
        <div
          className="flex w-max items-end motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out"
          style={{ transform: `translateX(${offset}px)` }}
        >
          {JOURNEY_STEPS.map((s, i) => {
            const piece = PIECE[s.carriage];
            const on = i === active;
            return (
              <div key={s.code} className="flex items-end">
                {i > 0 && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={PIECE.connector.src}
                    alt=""
                    aria-hidden
                    style={{ width: px(PIECE.connector.w), height: px(NATURAL_H) }}
                    className="shrink-0 select-none opacity-70"
                  />
                )}
                <button
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-label={`Bước ${i + 1}: ${s.title}`}
                  onClick={() => go(i)}
                  className="group relative shrink-0 outline-none"
                  style={{ width: px(piece.w) }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={piece.src}
                    alt=""
                    aria-hidden
                    style={{ width: px(piece.w), height: px(NATURAL_H) }}
                    className={`select-none transition-[opacity,filter] duration-300 ${
                      on
                        ? "opacity-100"
                        : "opacity-40 saturate-50 group-hover:opacity-70 group-hover:saturate-100"
                    }`}
                  />
                  {/* Số bước nổi trên toa */}
                  <span
                    className={`absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-caption font-bold transition-colors ${
                      on
                        ? "border-orange bg-orange text-white"
                        : "border-cream/30 bg-canvas/80 text-cream/70"
                    }`}
                    style={{ width: px(84), height: px(84), minWidth: 26, minHeight: 26 }}
                  >
                    {i + 1}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Thanh điều hướng ────────────────────────────────────────────────────────────── */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <NavButton
          dir="prev"
          disabled={active === 0}
          label={active > 0 ? JOURNEY_STEPS[active - 1].title : ""}
          onClick={() => go(active - 1)}
        />

        <div className="flex items-center gap-1.5" aria-hidden>
          {JOURNEY_STEPS.map((s, i) => (
            <button
              key={s.code}
              type="button"
              tabIndex={-1}
              onClick={() => go(i)}
              aria-label={`Bước ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-7 bg-orange" : "w-2.5 bg-cream/25 hover:bg-cream/40"
              }`}
            />
          ))}
        </div>

        <NavButton
          dir="next"
          disabled={active === JOURNEY_STEPS.length - 1}
          label={
            active < JOURNEY_STEPS.length - 1 ? JOURNEY_STEPS[active + 1].title : ""
          }
          onClick={() => go(active + 1)}
        />
      </div>

      {/* ── Chi tiết một bước ───────────────────────────────────────────────────────────── */}
      <div aria-live="polite" className="mt-5">
        {/* `key` đổi theo bước để React dựng lại khối — nhờ vậy hiệu ứng hiện vào chạy mỗi lần
            chuyển, thay vì chỉ chạy một lần lúc tải trang. */}
        <GlassCard key={step.code} className="p-5 motion-safe:animate-[fadeUp_.35s_ease-out] sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange/12 text-orange-bright">
              {step.icon}
            </span>
            <div>
              <p className="text-meta font-bold uppercase tracking-wider text-orange-bright">
                Bước {active + 1} / {JOURNEY_STEPS.length}
              </p>
              <h3 className="text-title font-semibold text-cream">{step.title}</h3>
            </div>
          </div>

          <p className="mt-3.5 max-w-3xl text-body text-cream/70">{step.lead}</p>

          {/* Một cột: bỏ cột "Ban tổ chức làm gì" (10/09/2026) — thí sinh mở trang này để biết
              phần việc CỦA MÌNH, quy trình nội bộ của ban tổ chức không giúp họ làm bài. */}
          <div className="mt-5">
            <Column title="Bạn làm gì" items={step.you} tone="orange" />
          </div>

          <div className="mt-5 flex flex-wrap items-start gap-2.5 rounded-lg border border-teal/30 bg-teal/[0.08] p-3.5">
            <MarkCheck size={17} className="mt-0.5 shrink-0 text-teal" />
            <p className="text-caption text-cream/80">
              <span className="font-semibold text-cream">Được đi tiếp khi: </span>
              {step.gate}
            </p>
          </div>

          {step.fallback && (
            <div className="mt-2.5 flex flex-wrap items-start gap-2.5 rounded-lg border border-amber/30 bg-amber/[0.08] p-3.5">
              <MarkShieldAlert size={17} className="mt-0.5 shrink-0 text-amber" />
              <p className="text-caption text-cream/80">{step.fallback}</p>
            </div>
          )}
        </GlassCard>
      </div>

      {active === JOURNEY_STEPS.length - 1 && (
        <div className="mt-3">
          <DarkNote>
            Hết sáu mốc. Sau khi đăng nhập, khu vực thí sinh hiển thị đúng sáu mốc này kèm trạng
            thái hiện tại của bạn.
          </DarkNote>
        </div>
      )}
    </div>
  );
}

function Column({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "orange" | "cream";
}) {
  return (
    <div>
      <p
        className={`text-meta font-bold uppercase tracking-wider ${
          tone === "orange" ? "text-orange-bright" : "text-cream/45"
        }`}
      >
        {title}
      </p>
      <ul className="mt-2.5 space-y-2">
        {items.map((t) => (
          <li key={t} className="flex gap-2.5 text-caption text-cream/70">
            <span
              className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                tone === "orange" ? "bg-orange" : "bg-cream/30"
              }`}
            />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavButton({
  dir,
  label,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Bước trước" : "Bước tiếp theo"}
      className={`group flex min-w-0 items-center gap-2.5 rounded-full border px-3 py-2 transition-colors ${
        disabled
          ? "cursor-not-allowed border-cream/10 text-cream/25"
          : "border-cream/20 text-cream/75 hover:border-orange/50 hover:bg-orange/12 hover:text-orange-bright"
      } ${dir === "next" ? "flex-row-reverse" : ""}`}
    >
      <MarkArrowRight
        size={17}
        className={`shrink-0 transition-transform ${dir === "prev" ? "rotate-180" : ""} ${
          disabled
            ? ""
            : dir === "next"
              ? "motion-safe:group-hover:translate-x-0.5"
              : "motion-safe:group-hover:-translate-x-0.5"
        }`}
      />
      <span className="hidden max-w-[13rem] truncate text-caption font-medium sm:block">
        {label || (dir === "prev" ? "Bước trước" : "Bước tiếp")}
      </span>
    </button>
  );
}
