"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Button } from "@/components/dsvh/ui/Button";
import { Input } from "@/components/dsvh/ui/Input";
import { Textarea } from "@/components/dsvh/ui/form/Textarea";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Note } from "@/components/dsvh/ui/data/Note";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { RobotIcon, PencilSimpleIcon, CheckCircleIcon } from "@/components/dsvh/icons";

type ModuleDef = { key: string; label: string; max: number };
type Agg = { value: number; basis: "judges" | "external_ai" | "none"; judgeCount: number };

/**
 * Một phase chấm điểm.
 *
 * Luồng đúng theo thể lệ: MÁY chấm trước và ra điểm sơ bộ, người chỉ XÁC NHẬN hoặc ĐIỀU CHỈNH.
 * Nên mặc định màn này không mở ô nhập — nó hiện điểm máy kèm nút "Xác nhận điểm máy" (một cú bấm
 * là xong, phiếu của bạn = điểm máy) và nút "Điều chỉnh" cho trường hợp không đồng ý. Bản trước
 * làm ngược: ô nhập trống là thứ đầu tiên đập vào mắt, còn điểm máy thì không thấy đâu.
 */
export function PhaseScoring({
  submissionId,
  phase,
  title,
  subtitle,
  modules,
  aggregate,
  myScore,
  judges,
}: {
  submissionId: number;
  phase: 1 | 2;
  title: string;
  subtitle: string;
  modules: ModuleDef[];
  aggregate: Record<string, Agg>;
  myScore: Record<string, number> | null;
  judges: { name: string; scores: Record<string, number>; summary: string | null }[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      modules.map((m) => [m.key, myScore?.[m.key] != null ? String(myScore[m.key]) : ""])
    )
  );
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const anyScore = modules.some((m) => aggregate[m.key]?.basis !== "none");
  const basis = aggregate[modules[0].key]?.basis ?? "none";

  async function submit(moduleScores: Record<string, number>, note?: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submissionId}/manual-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase, moduleScores, summary: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không lưu được phiếu chấm");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setLoading(false);
    }
  }

  /** Xác nhận = lấy nguyên điểm máy làm phiếu của mình. Không phải "đồng ý suông" mà không có phiếu. */
  function confirmMachineScore() {
    void submit(
      Object.fromEntries(modules.map((m) => [m.key, aggregate[m.key]?.value ?? 0])),
      "Xác nhận nguyên điểm máy chấm"
    );
  }

  function saveAdjusted() {
    const parsed: Record<string, number> = {};
    for (const m of modules) {
      const n = Number(values[m.key]);
      if (!Number.isFinite(n) || n < 0 || n > m.max) {
        setError(`${m.label} phải là số từ 0 đến ${m.max}.`);
        return;
      }
      parsed[m.key] = n;
    }
    void submit(parsed, summary);
  }

  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={subtitle}
        action={
          myScore ? (
            <Badge tone="success">Bạn đã chấm</Badge>
          ) : (
            <Badge tone="warning">Bạn chưa chấm</Badge>
          )
        }
      />

      {!anyScore ? (
        <Empty
          variant="inline"
          icon={<RobotIcon size={36} />}
          title="Chưa có điểm sơ bộ"
          description="Hệ chấm điểm chưa đẩy điểm về cho bài này. Bạn vẫn có thể chấm tay để không chặn tiến độ."
          action={
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              Chấm tay
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {modules.map((m) => {
              const a = aggregate[m.key];
              const mine = myScore?.[m.key];
              return (
                <div key={m.key} className="rounded-lg border border-stroke bg-surface-2 p-3">
                  <div className="text-caption text-ink-2">{m.label}</div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-kpi font-bold tabular-nums text-ink">{a?.value ?? 0}</span>
                    <span className="text-caption text-ink-3">/{m.max}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-meta text-ink-3">
                    {a?.basis === "external_ai" ? (
                      <>
                        <RobotIcon size={12} /> điểm máy chấm, chờ hội đồng xác nhận
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon size={12} /> trung bình {a?.judgeCount} giám khảo
                      </>
                    )}
                  </div>
                  {mine != null && (
                    <div className="mt-1.5 border-t border-stroke pt-1.5 text-meta text-ink-2">
                      Phiếu của bạn: <span className="font-semibold tabular-nums">{mine}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {basis === "external_ai" && (
            <Note tone="warning" className="mt-3">
              Điểm đang hiển thị là điểm MÁY chấm sơ bộ. Thể lệ yêu cầu hội đồng xác nhận trước khi
              công bố — bấm xác nhận hoặc điều chỉnh để tạo phiếu của bạn.
            </Note>
          )}

          {!editing && (
            <div className="mt-3 flex flex-wrap gap-2">
              {!myScore && (
                <Button
                  variant="solid"
                  size="sm"
                  loading={loading}
                  leftIcon={<CheckCircleIcon size={15} />}
                  onClick={confirmMachineScore}
                >
                  Xác nhận điểm máy
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<PencilSimpleIcon size={15} />}
                onClick={() => setEditing(true)}
              >
                {myScore ? "Sửa phiếu của tôi" : "Điều chỉnh"}
              </Button>
            </div>
          )}
        </>
      )}

      {editing && (
        <div className="mt-3 space-y-3 rounded-lg border border-stroke bg-surface-2 p-3">
          <div className="text-caption font-semibold text-ink">Phiếu chấm của bạn</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {modules.map((m) => (
              <Input
                key={m.key}
                label={`${m.label} (/${m.max})`}
                type="number"
                min={0}
                max={m.max}
                value={values[m.key]}
                onChange={(e) => setValues((v) => ({ ...v, [m.key]: e.target.value }))}
              />
            ))}
          </div>
          <Textarea
            label="Nhận xét (tuỳ chọn)"
            hint="Ghi lý do khi bạn chấm lệch điểm máy — đây là căn cứ khi thí sinh phản biện"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="solid"
              size="sm"
              loading={loading}
              disabled={modules.some((m) => !values[m.key])}
              onClick={saveAdjusted}
            >
              Lưu phiếu
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Huỷ
            </Button>
          </div>
        </div>
      )}

      {judges.length > 0 && (
        <div className="mt-4 border-t border-stroke pt-3">
          <div className="text-caption font-semibold text-ink">Phiếu của hội đồng</div>
          <ul className="mt-2 space-y-2">
            {judges.map((j, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-caption">
                <span className="font-medium text-ink">{j.name}</span>
                <span className="tabular-nums text-ink-2">
                  {modules.map((m) => `${m.label} ${j.scores[m.key] ?? 0}`).join(" · ")}
                </span>
                {j.summary && <span className="w-full text-meta text-ink-3">{j.summary}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="mt-3">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
    </Card>
  );
}
