"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StatusDot } from "@/components/dsvh/ui/data/StatusDot";
import { CopyButton } from "@/components/dsvh/ui/CopyButton";
import { TerminalIcon, SearchIcon, ExportIcon, ChevronDownIcon } from "@/components/dsvh/icons";

export type LogLevel = "info" | "debug" | "success" | "warn" | "error";

export interface LogLine {
  ts?: string;
  level?: LogLevel;
  text: string;
}

export interface LogViewerProps {
  /** Dòng log — object có level/ts, hoặc chuỗi thô. */
  lines: (LogLine | string)[];
  title?: string;
  /**
   * Đang nhận log realtime → chấm trạng thái pulse + tự cuộn theo đuôi.
   *
   * BA TRẠNG THÁI, không phải hai (sửa 26/08/2026). `undefined` = khối này KHÔNG PHẢI một luồng
   * (vd danh sách sự kiện phân trang ở /admin/nodes) ⇒ không vẽ chấm nào. `false` = là luồng nhưng
   * đang dừng. `true` = đang chảy.
   * Bản trước mặc định `false` nên mọi khối log không-phải-luồng đều hiện "Đã dừng" — một câu SAI:
   * không có gì từng chạy để mà dừng, và người trực đọc ra "log đã ngừng cập nhật".
   */
  streaming?: boolean;
  /**
   * Ô lọc trong đầu khối. Tắt khi màn đã có ô tìm kiếm riêng — ở /admin/nodes tab Nhật ký, ô ngoài
   * hỏi MÁY CHỦ (tìm trong toàn bộ sự kiện) còn ô này chỉ lọc 20 dòng đang tải: hai ô cạnh nhau
   * trông như nhau mà làm hai việc khác nhau.
   */
  filterable?: boolean;
  /** Chiều cao thân log (class Tailwind). Mặc định h-80. */
  heightClass?: string;
  showLineNumbers?: boolean;
  filename?: string;
}

/** Màu theo level — trên nền surface-hover (#e4eaea sáng, theme-aware). */
const LEVEL_TEXT: Record<LogLevel, string> = {
  info: "text-ink-2",
  debug: "text-ink-3",
  success: "text-teal",
  warn: "text-amber-strong",
  error: "text-red",
};

function normalize(lines: (LogLine | string)[]): LogLine[] {
  return lines.map((l) => (typeof l === "string" ? { text: l } : l));
}

/**
 * LogViewer / Terminal — khung mono nền surface-hover (#e4eaea sáng, theme-aware),
 * tô màu theo level, số dòng, search/filter, auto-scroll follow-tail + nút "về mới nhất",
 * copy toàn bộ (CopyButton) + tải log, chỉ báo đang-stream (StatusDot pulse).
 * Dùng cho log build/deploy, runtime container, database. Chỉ semantic token.
 */
export function LogViewer({
  lines,
  title = "Logs",
  streaming,
  filterable = true,
  heightClass = "h-80",
  showLineNumbers = true,
  filename = "log.txt",
}: LogViewerProps) {
  const { t } = useTranslation();
  const all = useMemo(() => normalize(lines), [lines]);
  const [query, setQuery] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);

  const q = query.trim().toLowerCase();
  const shown = useMemo(
    () => (q ? all.filter((l) => l.text.toLowerCase().includes(q)) : all),
    [all, q]
  );

  const fullText = useMemo(
    () => all.map((l) => (l.ts ? `${l.ts} ` : "") + l.text).join("\n"),
    [all]
  );

  // Follow-tail: khi có dòng mới và đang ở đáy → cuộn xuống.
  useEffect(() => {
    if (atBottom && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [shown, atBottom]);

  const onScroll = () => {
    const el = bodyRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 40);
  };

  const jumpToLatest = () => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    setAtBottom(true);
  };

  const download = () => {
    if (typeof document === "undefined") return;
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-card border border-stroke bg-surface">
      {/* Header — theme-aware */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stroke px-3 py-2">
        <TerminalIcon size={16} className="shrink-0 text-ink-3" />
        <span className="truncate text-caption font-semibold text-ink">{title}</span>
        {streaming === undefined ? null : streaming ? (
          <StatusDot status="live" label={t("ds.log_streaming")} />
        ) : (
          <StatusDot status="stopped" label={t("ds.log_stopped")} />
        )}

        <div className="ml-auto flex items-center gap-1.5">
          {filterable && (
          <div className="flex h-8 items-center gap-1.5 rounded-lg border border-stroke bg-surface px-2.5">
            <SearchIcon size={14} className="shrink-0 text-ink-3" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("ds.log_filter")}
              aria-label={t("ds.log_filter")}
              className="w-24 bg-transparent text-caption text-ink outline-none placeholder:text-ink-3 sm:w-36"
            />
            {q && (
              <span className="shrink-0 text-meta tabular-nums text-ink-3">
                {shown.length}/{all.length}
              </span>
            )}
          </div>
          )}
          <CopyButton value={fullText} size="sm" title={t("ds.log_copy_all")} />
          <button
            type="button"
            onClick={download}
            aria-label={t("ds.log_download")}
            title={t("ds.log_download")}
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-stroke text-ink-2 transition-colors hover:border-stroke-hover hover:bg-stroke-soft hover:text-ink"
          >
            <ExportIcon size={15} />
          </button>
        </div>
      </div>

      {/* Thân terminal — nền surface-hover (#e4eaea sáng, theme-aware) */}
      <div className="relative">
        <div
          ref={bodyRef}
          onScroll={onScroll}
          className={`overflow-auto bg-surface-hover py-2 tabular-nums text-caption leading-relaxed ${heightClass}`}
          role="log"
          aria-live={streaming ? "polite" : "off"}
        >
          {shown.length === 0 ? (
            /* `text-ink-2` chứ không `text-ink-3`: thân khối log nền TỐI, mà `ink-3` là bậc chữ
               nhạt nhất — câu báo rỗng gần như vô hình, nên hộp trông như lỗi chứ không như "chưa
               có gì". Đo ở màn nhật ký triển khai 12/08. */
            <div className="px-3 py-6 text-center text-caption text-ink-2">
              {q ? "Không có dòng khớp bộ lọc." : "Chưa có log."}
            </div>
          ) : (
            shown.map((l, i) => (
              <div
                key={i}
                className="flex gap-3 px-3 transition-colors hover:bg-ink/5"
              >
                {showLineNumbers && (
                  <span className="w-8 shrink-0 select-none text-right tabular-nums text-ink-3/70">
                    {i + 1}
                  </span>
                )}
                {l.ts && (
                  <span className="shrink-0 select-none tabular-nums text-ink-3">
                    {l.ts}
                  </span>
                )}
                <span
                  className={`min-w-0 whitespace-pre-wrap break-all ${
                    LEVEL_TEXT[l.level ?? "info"]
                  }`}
                >
                  {l.text}
                </span>
              </div>
            ))
          )}
        </div>

        {!atBottom && (
          <button
            type="button"
            onClick={jumpToLatest}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-orange px-3 py-1.5 text-caption font-semibold text-white shadow-lg transition hover:bg-orange-bright active:scale-[0.97]"
          >
            <ChevronDownIcon size={14} /> {t("ds.log_to_latest")}
          </button>
        )}
      </div>
    </div>
  );
}
