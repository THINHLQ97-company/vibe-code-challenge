"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/dsvh/ui/Button";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Select } from "@/components/dsvh/ui/form/Select";
import { SegmentedControl } from "@/components/dsvh/ui/SegmentedControl";
import { Table, type ColumnDef } from "@/components/dsvh/ui/Table";

export type JudgeOption = { id: number; name: string; load: number };

export type AssignRow = {
  submissionId: number;
  productName: string;
  candidate: string;
  department: string;
  board: "ky_thuat" | "van_phong" | null;
  judges: { id: number; name: string; assignedAt: string }[];
};

type Draft = { submissionId: number; judgeIds: number[] };
type Preview = {
  draft: Draft[];
  loadAfter: { judgeId: number; name: string; total: number }[];
  alreadyAssigned: number;
  error?: string;
};

export function AssignmentManager({
  waves,
  selectedWaveId,
  rows,
  judges,
  perSubmission,
}: {
  waves: { id: number; name: string }[];
  selectedWaveId: number;
  rows: AssignRow[];
  judges: JudgeOption[];
  perSubmission: number;
}) {
  const router = useRouter();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const nameOf = (id: number) => judges.find((j) => j.id === id)?.name ?? `#${id}`;

  async function runPreview() {
    setError(null);
    setNote(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waveId: selectedWaveId }),
      });
      const data: Preview & { error?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không tính được phân công");
        return;
      }
      if (data.error) {
        setError(data.error);
        return;
      }
      if (data.draft.length === 0) {
        setNote("Mọi bài trong đợt này đã có đủ giám khảo — không có gì để chia thêm.");
        return;
      }
      setPreview(data);
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!preview) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waveId: selectedWaveId, draft: preview.draft }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không lưu được phân công");
        return;
      }
      setPreview(null);
      setNote(`Đã ghi ${data.saved} lượt phân công.`);
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setBusy(false);
    }
  }

  async function reassign(submissionId: number, fromJudgeId: number, value: string) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/assignments/reassign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, fromJudgeId, toJudgeId: Number(value) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không giao lại được");
        return;
      }
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setBusy(false);
    }
  }

  const columns: ColumnDef<AssignRow>[] = [
    {
      key: "product",
      header: "Bài dự thi",
      maxWidth: 260,
      render: (r) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-ink">{r.productName}</div>
          <div className="truncate text-meta text-ink-3">
            {r.candidate} · {r.department}
            {r.board ? ` · ${r.board === "ky_thuat" ? "Kỹ thuật" : "Văn phòng"}` : ""}
          </div>
        </div>
      ),
    },
    {
      key: "judges",
      header: `Giám khảo (${perSubmission})`,
      render: (r) =>
        r.judges.length === 0 ? (
          <Badge tone="warning">Chưa phân công</Badge>
        ) : (
          <div className="flex flex-col gap-1.5">
            {r.judges.map((j) => (
              <div key={j.id} className="flex flex-wrap items-center gap-2">
                <span className="text-caption text-ink">{j.name}</span>
                <span className="w-44">
                  <Select
                    value={String(j.id)}
                    onChange={(v) => void reassign(r.submissionId, j.id, v)}
                    options={judges.map((o) => ({
                      value: String(o.id),
                      label: `${o.name} (${o.load})`,
                    }))}
                    disabled={busy}
                  />
                </span>
              </div>
            ))}
            {r.judges.length < perSubmission && (
              <Badge tone="warning">Còn thiếu {perSubmission - r.judges.length}</Badge>
            )}
          </div>
        ),
    },
  ];

  return (
    <div className="space-y-3">
      {waves.length > 1 && (
        <SegmentedControl
          options={waves.map((w) => ({ value: String(w.id), label: w.name }))}
          value={String(selectedWaveId)}
          onChange={(v) => router.push(`/admin/assignments?wave=${v}`)}
          size="sm"
        />
      )}

      {error && <Alert tone="error">{error}</Alert>}
      {note && <Alert tone="success">{note}</Alert>}

      {/* Tải hiện tại của từng giám khảo, luôn hiện chứ không giấu trong bản nháp: đây là con số
          ban tổ chức cần khi quyết định giao lại bài cho ai. */}
      <div className="flex flex-wrap gap-2">
        {judges.map((j) => (
          <span
            key={j.id}
            className="rounded-lg border border-stroke bg-surface-2 px-2.5 py-1 text-caption text-ink-2"
          >
            {j.name} <b className="tabular-nums text-ink">{j.load}</b>
          </span>
        ))}
        {judges.length === 0 && (
          <span className="text-caption text-ink-3">
            Chưa có tài khoản giám khảo nào — thêm ở mục Người dùng.
          </span>
        )}
      </div>

      {!preview && (
        <Button variant="solid" loading={busy} onClick={() => void runPreview()}>
          Phân công phần còn thiếu
        </Button>
      )}

      {preview && (
        <div className="rounded-lg border border-orange/40 bg-orange/10 p-3">
          <p className="text-body font-semibold text-ink">
            Bản nháp — chưa ghi gì cả
          </p>
          <p className="mt-0.5 text-caption text-ink-2">
            {preview.draft.length} bài sẽ được chia thêm
            {preview.alreadyAssigned > 0
              ? `; ${preview.alreadyAssigned} bài đã có phân công từ trước, giữ nguyên`
              : ""}
            .
          </p>

          <div className="mt-2.5 flex flex-wrap gap-2">
            {preview.loadAfter.map((l) => (
              <span
                key={l.judgeId}
                className="rounded-lg border border-stroke bg-surface px-2.5 py-1 text-caption text-ink-2"
              >
                {l.name} <b className="tabular-nums text-ink">{l.total}</b>
              </span>
            ))}
          </div>

          <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
            {preview.draft.map((d) => {
              const row = rows.find((r) => r.submissionId === d.submissionId);
              return (
                <li key={d.submissionId} className="text-caption text-ink-2">
                  <span className="text-ink">{row?.productName ?? `#${d.submissionId}`}</span>{" "}
                  → {d.judgeIds.map(nameOf).join(" + ")}
                </li>
              );
            })}
          </ul>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="solid" loading={busy} onClick={() => void confirm()}>
              Chốt phân công
            </Button>
            <Button variant="ghost" onClick={() => setPreview(null)}>
              Bỏ bản nháp
            </Button>
            <Button variant="ghost" loading={busy} onClick={() => void runPreview()}>
              Xáo lại
            </Button>
          </div>
        </div>
      )}

      <Table data={rows} columns={columns} getRowId={(r) => r.submissionId} />
    </div>
  );
}
