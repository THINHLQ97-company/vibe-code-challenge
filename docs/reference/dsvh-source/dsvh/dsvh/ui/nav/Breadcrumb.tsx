import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@/components/dsvh/icons";

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5 text-body">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="inline-flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRightIcon
                  size={14}
                  className="text-ink-3 shrink-0"
                  aria-hidden={true}
                />
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-ink truncate select-none"
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="text-ink-2 hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30 rounded-md px-0.5"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-ink-2 select-none">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
