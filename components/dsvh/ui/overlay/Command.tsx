"use client";

import { useState, useEffect, useRef, useId } from "react";
import { SearchIcon } from "@/components/dsvh/icons";

export interface CommandItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  onSelect: () => void;
  disabled?: boolean;
}

export interface CommandGroup {
  heading: string;
  items: CommandItem[];
}

export interface CommandProps {
  groups: CommandGroup[];
  placeholder?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Command({
  groups,
  placeholder = "Nhập lệnh hoặc tìm kiếm...",
  open,
  onOpenChange,
}: CommandProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dialogId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredGroups = groups
    .map((group) => {
      const filteredItems = group.items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase().trim())
      );
      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter((group) => group.items.length > 0);

  const flatItems = filteredGroups.flatMap((group) => group.items);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      setQuery("");
      setSelectedIndex(0);
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setSelectedIndex(0));
    return () => cancelAnimationFrame(raf);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (flatItems.length === 0) return 0;
          let next = prev + 1;
          while (next < flatItems.length && flatItems[next]?.disabled) {
            next++;
          }
          return next < flatItems.length ? next : prev;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (flatItems.length === 0) return 0;
          let next = prev - 1;
          while (next >= 0 && flatItems[next]?.disabled) {
            next--;
          }
          return next >= 0 ? next : prev;
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < flatItems.length) {
          const selected = flatItems[selectedIndex];
          if (selected && !selected.disabled) {
            selected.onSelect();
            onOpenChange(false);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, flatItems, selectedIndex, onOpenChange]);

  if (!open) return null;

  let currentIndexCounter = 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={dialogId}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
    >
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-stroke bg-surface shadow-2xl transition-all">
        <div className="flex items-center border-b border-stroke-soft px-4 py-3">
          <SearchIcon size={18} className="shrink-0 text-ink-3" />
          <input
            ref={inputRef}
            id={dialogId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="ml-3 w-full bg-transparent text-body text-ink placeholder:text-ink-3 outline-none"
          />
          <kbd className="hidden sm:inline-block rounded-md border border-stroke bg-surface-2 px-1.5 py-0.5 text-meta font-medium text-ink-3">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {flatItems.length === 0 ? (
            <div className="px-4 py-6 text-center text-body text-ink-3">
              Không tìm thấy kết quả phù hợp.
            </div>
          ) : (
            filteredGroups.map((group, groupIdx) => (
              <div key={group.heading || groupIdx} className="mb-2 last:mb-0">
                {group.heading && (
                  <div className="px-3 py-1.5 text-meta font-semibold uppercase tracking-wider text-ink-3">
                    {group.heading}
                  </div>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const itemIndex = currentIndexCounter++;
                    const isSelected = itemIndex === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={item.disabled}
                        onClick={() => {
                          if (item.disabled) return;
                          item.onSelect();
                          onOpenChange(false);
                        }}
                        onMouseEnter={() =>
                          !item.disabled && setSelectedIndex(itemIndex)
                        }
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-body transition-colors select-none ${
                          item.disabled
                            ? "cursor-not-allowed opacity-50 text-ink-3"
                            : isSelected
                            ? "bg-stroke-soft font-medium text-ink"
                            : "text-ink-2 hover:bg-stroke-soft"
                        }`}
                      >
                        {Icon && (
                          <Icon
                            size={16}
                            className={`shrink-0 ${
                              isSelected ? "text-orange" : "text-ink-3"
                            }`}
                          />
                        )}
                        <span className="flex-1 truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
