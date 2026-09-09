import type { ReactNode } from "react";

export function EmptyState({
  icon = "🗒️",
  title,
  desc,
  action,
}: {
  icon?: string;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="ds-empty">
      <div className="ds-empty-icon">{icon}</div>
      <div className="ds-empty-title">{title}</div>
      {desc && <div className="ds-empty-desc">{desc}</div>}
      {action}
    </div>
  );
}
