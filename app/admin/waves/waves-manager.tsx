"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Button } from "@/components/dsvh/ui/Button";
import { Input } from "@/components/dsvh/ui/Input";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Note } from "@/components/dsvh/ui/data/Note";
import { Progress } from "@/components/dsvh/ui/Progress";
import { PlusIcon } from "@/components/dsvh/icons";
import { MAX_WAVE_BONUS } from "@/lib/wave-bonus";
import { WaveMembers, type Member } from "./wave-members";

export type WaveRow = {
  id: number;
  name: string;
  orderIndex: number;
  registrationOpensAt: string;
  registrationClosesAt: string;
  capacity: number;
  bonusPoints: number;
  status: "draft" | "open" | "closed";
  registered: number;
  members: Member[];
};

const STATUS: Record<WaveRow["status"], { tone: "neutral" | "success" | "warning"; label: string }> = {
  draft: { tone: "neutral", label: "Nháp — chưa công bố" },
  open: { tone: "success", label: "Đang mở đăng ký" },
  closed: { tone: "warning", label: "Đã đóng" },
};

/** `datetime-local` cần đúng dạng `YYYY-MM-DDTHH:mm` theo GIỜ MÁY, không phải chuỗi ISO UTC. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function WavesManager({ initial }: { initial: WaveRow[] }) {
  const waveOptions = initial.map((w) => ({ value: String(w.id), label: w.name }));
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | "new" | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", opens: "", closes: "", capacity: "35" });

  async function call(url: string, body: unknown, key: number | "new") {
    setError(null);
    setBusy(key);
    try {
      const res = await fetch(url, {
        method: key === "new" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Không lưu được thay đổi");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function create() {
    if (!form.name || !form.opens || !form.closes) {
      setError("Điền đủ tên đợt, giờ mở và giờ đóng đăng ký");
      return;
    }
    const ok = await call(
      "/api/admin/waves",
      {
        name: form.name,
        // `datetime-local` trả giờ máy không kèm múi — `toISOString` gắn đúng múi của người tạo.
        registrationOpensAt: new Date(form.opens).toISOString(),
        registrationClosesAt: new Date(form.closes).toISOString(),
        capacity: Number(form.capacity),
      },
      "new"
    );
    if (ok) {
      setCreating(false);
      setForm({ name: "", opens: "", closes: "", capacity: "35" });
    }
  }

  return (
    <div className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}

      <Card>
        <CardHeader
          title="Các đợt thi"
          subtitle={`Điểm thưởng đăng ký sớm mặc định giảm dần ${MAX_WAVE_BONUS} → 0 theo thứ tự đợt`}
          action={
            <Button
              variant={creating ? "ghost" : "solid"}
              size="sm"
              leftIcon={creating ? undefined : <PlusIcon size={15} />}
              onClick={() => setCreating((v) => !v)}
            >
              {creating ? "Huỷ" : "Tạo đợt mới"}
            </Button>
          }
        />

        {creating && (
          <div className="mb-4 space-y-3 rounded-lg border border-stroke bg-surface-2 p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Tên đợt"
                placeholder="VD: Đợt 1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="Trần số thí sinh"
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
              <Input
                label="Mở đăng ký lúc"
                type="datetime-local"
                value={form.opens}
                onChange={(e) => setForm({ ...form, opens: e.target.value })}
              />
              <Input
                label="Đóng đăng ký lúc"
                type="datetime-local"
                value={form.closes}
                onChange={(e) => setForm({ ...form, closes: e.target.value })}
              />
            </div>
            <Note>
              Đợt mới tạo ở trạng thái <b>nháp</b> — chưa hiện trên trang chủ và chưa nhận đăng ký.
              Bấm &quot;Mở đăng ký&quot; khi muốn công bố. Điểm thưởng tính theo thứ tự đợt, sửa
              được sau khi tạo.
            </Note>
            <Button variant="solid" size="sm" loading={busy === "new"} onClick={() => void create()}>
              Tạo đợt
            </Button>
          </div>
        )}

        {initial.length === 0 ? (
          <Note tone="warning">
            Chưa có đợt thi nào. Khi chưa có đợt nào, hệ thống chạy theo cơ chế cũ — đăng ký tự do
            và giới hạn theo trần tuần.
          </Note>
        ) : (
          <div className="space-y-3">
            {initial.map((w) => (
              <WaveCard
                key={w.id}
                wave={w}
                waveOptions={waveOptions}
                busy={busy === w.id}
                onPatch={(body) => void call(`/api/admin/waves/${w.id}`, body, w.id)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function WaveCard({
  wave,
  waveOptions,
  busy,
  onPatch,
}: {
  wave: WaveRow;
  waveOptions: Array<{ value: string; label: string }>;
  busy: boolean;
  onPatch: (body: Record<string, unknown>) => void;
}) {
  const [opens, setOpens] = useState(toLocalInput(wave.registrationOpensAt));
  const [closes, setCloses] = useState(toLocalInput(wave.registrationClosesAt));
  const [capacity, setCapacity] = useState(String(wave.capacity));
  const [bonus, setBonus] = useState(String(wave.bonusPoints));
  const st = STATUS[wave.status];
  const full = wave.registered >= wave.capacity;

  return (
    <div className="rounded-lg border border-stroke bg-surface-2 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-body font-semibold text-ink">
            {wave.name}{" "}
            <span className="text-caption font-normal text-ink-3">· đợt {wave.orderIndex}</span>
          </div>
          <div className="mt-0.5 text-caption text-ink-2">
            {wave.registered}/{wave.capacity} thí sinh · thưởng +{wave.bonusPoints} điểm
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {full && <Badge tone="danger">Đã đầy</Badge>}
          <Badge tone={st.tone}>{st.label}</Badge>
        </div>
      </div>

      <div className="mt-2">
        <Progress value={Math.min(100, (wave.registered / wave.capacity) * 100)} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Mở đăng ký" type="datetime-local" value={opens} onChange={(e) => setOpens(e.target.value)} />
        <Input label="Đóng đăng ký" type="datetime-local" value={closes} onChange={(e) => setCloses(e.target.value)} />
        <Input label="Trần thí sinh" type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        <Input label="Điểm thưởng" type="number" min={0} value={bonus} onChange={(e) => setBonus(e.target.value)} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          loading={busy}
          onClick={() =>
            onPatch({
              registrationOpensAt: new Date(opens).toISOString(),
              registrationClosesAt: new Date(closes).toISOString(),
              capacity: Number(capacity),
              bonusPoints: Number(bonus),
            })
          }
        >
          Lưu thay đổi
        </Button>
        {wave.status !== "open" && (
          <Button variant="solid" size="sm" loading={busy} onClick={() => onPatch({ status: "open" })}>
            Mở đăng ký
          </Button>
        )}
        {wave.status === "open" && (
          <Button variant="ghost" size="sm" loading={busy} onClick={() => onPatch({ status: "closed" })}>
            Đóng đăng ký
          </Button>
        )}
      </div>

      <WaveMembers members={wave.members} waveOptions={waveOptions} currentWaveId={wave.id} />
    </div>
  );
}
