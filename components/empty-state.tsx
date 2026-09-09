import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { FileQuestion } from "lucide-react";

export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  desc,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="ds-empty">
      <div className="ds-empty-icon flex items-center justify-center">
        <Icon size={36} strokeWidth={1.5} />
      </div>
      <div className="ds-empty-title">{title}</div>
      {desc && <div className="ds-empty-desc">{desc}</div>}
      {action}
    </div>
  );
}
