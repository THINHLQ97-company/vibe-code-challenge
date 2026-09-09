import { CopyButton } from "@/components/dsvh/ui/CopyButton";

export type DNSRecordType = "A" | "AAAA" | "CNAME" | "TXT" | "MX" | "NS";
export type DNSStatus = "verified" | "pending" | "error";

export interface DNSRecord {
  type: DNSRecordType;
  /** Host/Name (vd `@`, `www`, `_acme-challenge`). */
  name: string;
  value: string;
  ttl?: number | "Auto";
  status?: DNSStatus;
}

export interface DNSRecordTableProps {
  records: DNSRecord[];
  /** Ẩn cột TTL. */
  hideTtl?: boolean;
}

/** Màu badge theo loại record — token DSVH. */
const TYPE_TONE: Record<DNSRecordType, string> = {
  A: "bg-teal/12 text-teal",
  AAAA: "bg-teal/12 text-teal",
  CNAME: "bg-orange/12 text-orange-strong dark:text-orange",
  TXT: "bg-magenta/12 text-magenta",
  MX: "bg-amber/14 text-amber-strong",
  NS: "bg-ink/[0.07] text-ink-2",
};

const STATUS_META: Record<DNSStatus, { dot: string; text: string; label: string; pulse: boolean }> = {
  verified: { dot: "bg-teal", text: "text-teal", label: "Verified", pulse: false },
  pending: { dot: "bg-amber", text: "text-amber-strong", label: "Pending", pulse: true },
  error: { dot: "bg-red", text: "text-red", label: "Error", pulse: false },
};

/**
 * Bảng bản ghi DNS (thêm domain/verify): loại (badge màu), host, giá trị (mono +
 * copy), TTL, trạng thái verify. Cuộn ngang trên mobile, chỉ semantic token.
 */
export function DNSRecordTable({ records, hideTtl = false }: DNSRecordTableProps) {
  return (
    <div className="overflow-x-auto rounded-card border border-stroke">
      <table className="w-full min-w-[560px] border-collapse text-left text-body">
        <thead>
          {/* Không ép hoa — cùng luật với `Table` của DSVH, chốt 19/08/2026. */}
          <tr className="border-b border-stroke bg-surface-2 text-caption font-medium text-ink-3">
            <th className="px-4 py-2.5 font-medium">Type</th>
            <th className="px-4 py-2.5 font-medium">Name</th>
            <th className="px-4 py-2.5 font-medium">Value</th>
            {!hideTtl && <th className="px-4 py-2.5 font-medium">TTL</th>}
            <th className="px-4 py-2.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => {
            const st = STATUS_META[r.status ?? "pending"];
            return (
              <tr
                key={`${r.type}-${r.name}-${i}`}
                className="border-b border-stroke-soft last:border-0"
              >
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 tabular-nums text-caption font-semibold ${TYPE_TONE[r.type]}`}
                  >
                    {r.type}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums text-ink">{r.name}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="max-w-[280px] truncate tabular-nums text-ink-2">
                      {r.value}
                    </span>
                    <CopyButton value={r.value} size="sm" />
                  </div>
                </td>
                {!hideTtl && (
                  <td className="px-4 py-3 tabular-nums text-ink-3">
                    {r.ttl ?? "Auto"}
                  </td>
                )}
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-caption font-medium ${st.text}`}>
                    <span className={`size-2 rounded-full ${st.dot} ${st.pulse ? "animate-pulse" : ""}`} />
                    {st.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
