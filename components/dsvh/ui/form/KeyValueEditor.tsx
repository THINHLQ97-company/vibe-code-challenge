"use client";

import { SecretInput } from "@/components/dsvh/ui/form/SecretInput";
import { PlusIcon, TrashIcon } from "@/components/dsvh/icons";

export interface KVPair {
  key: string;
  value: string;
}

export interface KeyValueEditorProps {
  /** Danh sách cặp key–value (controlled). */
  value: KVPair[];
  onChange: (rows: KVPair[]) => void;
  label?: string;
  hint?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  addLabel?: string;
  /** Ẩn giá trị mặc định (SecretInput). Tắt để hiện value dạng thường. */
  secret?: boolean;
}

/**
 * Trình sửa cặp KEY–VALUE (biến môi trường): mỗi dòng = input KEY (mono) +
 * SecretInput cho VALUE (che ••• / hiện / sao chép, sẵn có CopyButton) + nút xoá.
 * Thêm/bớt dòng. Chỉ semantic token → tự đổi theo theme sáng/tối.
 */
export function KeyValueEditor({
  value,
  onChange,
  label,
  hint,
  keyPlaceholder = "KEY",
  valuePlaceholder = "value",
  addLabel = "Thêm biến",
  secret = true,
}: KeyValueEditorProps) {
  const setRow = (i: number, patch: Partial<KVPair>) =>
    onChange(value.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const removeRow = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  const addRow = () => onChange([...value, { key: "", value: "" }]);

  return (
    <div className="flex w-full flex-col gap-2">
      {label && <span className="text-caption font-medium text-ink-2">{label}</span>}

      {value.length > 0 && (
        <div className="flex items-center gap-2 px-1 text-meta font-semibold text-ink-3">
          <span className="w-[38%]">Key</span>
          <span className="flex-1">Value</span>
          <span className="w-9 shrink-0" aria-hidden />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {value.map((row, i) => (
          <div key={i} className="flex items-start gap-2">
            <input
              value={row.key}
              onChange={(e) => setRow(i, { key: e.target.value })}
              placeholder={keyPlaceholder}
              aria-label={`Tên biến ${i + 1}`}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="h-9 w-[38%] shrink-0 rounded-lg border border-stroke bg-surface px-3 tabular-nums text-caption tracking-tight text-ink outline-none transition-colors placeholder:font-sans placeholder:text-ink-3 hover:border-stroke-hover focus:border-orange focus-visible:ring-2 focus-visible:ring-orange/30"
            />
            <div className="min-w-0 flex-1">
              {secret ? (
                <SecretInput
                  value={row.value}
                  onChange={(e) => setRow(i, { value: e.target.value })}
                  placeholder={valuePlaceholder}
                  aria-label={`Giá trị biến ${i + 1}`}
                />
              ) : (
                <input
                  value={row.value}
                  onChange={(e) => setRow(i, { value: e.target.value })}
                  placeholder={valuePlaceholder}
                  aria-label={`Giá trị biến ${i + 1}`}
                  spellCheck={false}
                  className="h-9 w-full rounded-lg border border-stroke bg-surface px-3 tabular-nums text-caption tracking-tight text-ink outline-none transition-colors placeholder:font-sans placeholder:text-ink-3 hover:border-stroke-hover focus:border-orange focus-visible:ring-2 focus-visible:ring-orange/30"
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => removeRow(i)}
              aria-label={`Xoá biến ${i + 1}`}
              className="grid size-9 shrink-0 place-items-center rounded-lg border border-stroke text-ink-3 transition-colors hover:border-stroke-hover hover:bg-stroke-soft hover:text-red"
            >
              <TrashIcon size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stroke bg-surface px-3 py-1.5 text-caption font-medium text-ink-2 transition-colors hover:border-stroke-hover hover:bg-stroke-soft hover:text-ink active:scale-[0.97]"
        >
          <PlusIcon size={15} /> {addLabel}
        </button>
        {hint && <span className="text-caption text-ink-3">{hint}</span>}
      </div>
    </div>
  );
}
