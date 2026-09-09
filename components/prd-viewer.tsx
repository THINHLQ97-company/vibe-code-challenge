"use client";

import { useState } from "react";
import { Note } from "@/components/dsvh/ui/data/Note";
import { FileTextIcon, ChevronDownIcon, ChevronRightIcon } from "@/components/dsvh/icons";

/**
 * Xem tài liệu PRD thí sinh nộp — đầu vào chấm Phase 1.
 *
 * Cố ý KHÔNG kéo thư viện render markdown: nội dung do người dùng nộp, render thành HTML là mở
 * đường XSS ngay trong màn BTC đọc hằng ngày. Hiển thị nguyên văn chữ, chỉ làm đậm dòng tiêu đề
 * (`#`) và dấu gạch đầu dòng để đọc được — giám khảo cần ĐỌC tài liệu, không cần nó đẹp.
 */
export function PrdViewer({
  content,
  fileName,
  defaultOpen = false,
}: {
  content: string | null;
  fileName: string | null;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (!content) {
    return (
      <Note tone="warning">
        Thí sinh chưa nộp tài liệu PRD — chưa đủ căn cứ chấm điểm ý tưởng Phase 1.
      </Note>
    );
  }

  const lines = content.split("\n");
  const words = content.trim().split(/\s+/).length;

  return (
    <div className="rounded-lg border border-stroke bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        {open ? (
          <ChevronDownIcon size={14} className="shrink-0 text-ink-3" />
        ) : (
          <ChevronRightIcon size={14} className="shrink-0 text-ink-3" />
        )}
        <FileTextIcon size={16} className="shrink-0 text-ink-2" />
        <span className="min-w-0 flex-1 truncate text-caption font-medium text-ink">
          {fileName || "Tài liệu PRD"}
        </span>
        <span className="shrink-0 text-meta tabular-nums text-ink-3">{words} từ</span>
      </button>

      {open && (
        <div className="border-t border-stroke px-3 py-3">
          <div className="max-h-[28rem] overflow-y-auto pr-1">
            {lines.map((line, i) => {
              const heading = /^#{1,6}\s/.test(line);
              const bullet = /^\s*([-*+]|\d+\.)\s/.test(line);
              if (!line.trim()) return <div key={i} className="h-2" />;
              return (
                <p
                  key={i}
                  className={
                    heading
                      ? "mt-3 text-body font-semibold text-ink first:mt-0"
                      : bullet
                        ? "pl-3 text-caption text-ink-2"
                        : "text-caption text-ink-2"
                  }
                >
                  {heading ? line.replace(/^#{1,6}\s/, "") : line}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** Bản chỉ đọc, luôn mở — dùng ở trang chi tiết nơi PRD là nội dung chính. */
export function PrdPanel({ content, fileName }: { content: string | null; fileName: string | null }) {
  return <PrdViewer content={content} fileName={fileName} defaultOpen />;
}

