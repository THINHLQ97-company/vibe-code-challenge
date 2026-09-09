"use client";

import { useState, useId } from "react";
import { ChevronDownIcon } from "@/components/dsvh/icons";

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  type?: "single" | "multiple";
  defaultOpen?: string | string[];
  className?: string;
}

export function Accordion({
  items,
  type = "single",
  defaultOpen,
  className = "",
}: AccordionProps) {
  const baseId = useId();

  const [openIds, setOpenIds] = useState<string[]>(() => {
    if (!defaultOpen) return [];
    return Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen];
  });

  const toggleItem = (id: string, disabled?: boolean) => {
    if (disabled) return;

    setOpenIds((prev) => {
      const isOpen = prev.includes(id);
      if (type === "single") {
        return isOpen ? [] : [id];
      } else {
        return isOpen ? prev.filter((item) => item !== id) : [...prev, id];
      }
    });
  };

  return (
    <div
      className={`w-full divide-y divide-stroke-soft rounded-xl border border-stroke bg-surface ${className}`}
    >
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        const headerId = `${baseId}-header-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;

        return (
          <div
            key={item.id}
            className="overflow-hidden first:rounded-t-xl last:rounded-b-xl"
          >
            <h3>
              <button
                id={headerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-disabled={item.disabled}
                disabled={item.disabled}
                onClick={() => toggleItem(item.id, item.disabled)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-body font-medium transition-colors select-none ${
                  item.disabled
                    ? "cursor-not-allowed bg-surface-2 text-ink-3 opacity-50"
                    : "cursor-pointer text-ink hover:bg-stroke-soft focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30"
                }`}
              >
                <span className="truncate">{item.title}</span>
                <ChevronDownIcon
                  size={18}
                  className={`shrink-0 text-ink-3 transition-transform duration-200 ease-in-out ${
                    isOpen ? "rotate-180 text-orange" : ""
                  }`}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-stroke-soft bg-surface-2 px-4 py-3 text-body text-ink-2">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
