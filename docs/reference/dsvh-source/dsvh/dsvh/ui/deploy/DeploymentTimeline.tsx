"use client";

import { StatusDot, type OpStatus } from "@/components/dsvh/ui/data/StatusDot";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Button } from "@/components/dsvh/ui/Button";
import { RollbackIcon, GitCommitIcon } from "@/components/dsvh/icons";

/**
 * DeploymentTimeline — lịch sử các lần deploy (version), mỗi dòng có trạng thái
 * (StatusDot), commit, thời gian; bản đang chạy đánh dấu "hiện tại", các bản cũ
 * (đã từng live) có nút Rollback.
 */
export interface DeploymentItem {
  id: string;
  status: OpStatus;
  title: string;
  commit?: string;
  time: string;
  current?: boolean;
  canRollback?: boolean;
}

export interface DeploymentTimelineProps {
  items: DeploymentItem[];
  onRollback?: (id: string) => void;
  className?: string;
}

export function DeploymentTimeline({ items, onRollback, className = "" }: DeploymentTimelineProps) {
  return (
    <ol className={`flex flex-col ${className}`}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <li key={it.id} className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <StatusDot status={it.status} showLabel={false} />
              {!last && <span className="mt-1 w-px flex-1 bg-stroke" />}
            </div>
            <div className={`flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 ${last ? "pb-0" : "pb-5"}`}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-body font-semibold text-ink">{it.title}</span>
                  {it.current && <Badge tone="success" size="sm">Hiện tại</Badge>}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-caption text-ink-3">
                  {it.commit && (
                    <span className="inline-flex items-center gap-1">
                      <GitCommitIcon size={13} /> {it.commit}
                    </span>
                  )}
                  <span>· {it.time}</span>
                </div>
              </div>
              {!it.current && it.canRollback && onRollback && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  leftIcon={<RollbackIcon size={14} />}
                  onClick={() => onRollback(it.id)}
                >
                  Rollback
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
