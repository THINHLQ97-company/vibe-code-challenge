"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/dsvh/ui/form/Select";
import { Button } from "@/components/dsvh/ui/Button";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Note } from "@/components/dsvh/ui/data/Note";

export type Member = {
  submissionId: number;
  productName: string;
  userName: string;
  department: string;
  board: "ky_thuat" | "van_phong" | null;
  registrationStatus: string;
};

const REG_TONE: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  pending: "warning",
  approved: "success",
  returned: "danger",
};
const REG_LABEL: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  returned: "Bị trả về",
};

/**
 * Danh sách thí sinh trong một đợt, kèm ô chuyển sang đợt khác.
 *
 * Trước đây BTC chỉ thấy con số "12/35" mà không biết 12 người đó là ai — không kiểm được ai đã
 * vào đợt nào, và cũng không có đường nào để sắp xếp lại dù API chuyển đợt đã có sẵn.
 */
export function WaveMembers({
  members,
  waveOptions,
  currentWaveId,
}: {
  members: Member[];
  waveOptions: Array<{ value: string; label: string }>;
  currentWaveId: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [moving, setMoving] = useState<number | null>(null);
  const [target, setTarget] = useState<Record<number, string | null>>({});
  const [error, setError] = useState<string | null>(null);
  const [warn, setWarn] = useState<string | null>(null);

  async function move(submissionId: number) {
    const to = target[submissionId];
    if (!to) return;
    setError(null);
    setWarn(null);
    setMoving(submissionId);
    try {
      const res = await fetch(`/api/admin/submissions/${submissionId}/wave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waveId: Number(to) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Không chuyển được đợt");
        return;
      }
      // Chuyển sang đợt đã đầy KHÔNG bị chặn — đây là thao tác cứu tình huống. Nhưng phải nói ra,
      // nếu không BTC vô tình đẩy đợt vượt trần mà không biết.
      if (data.waveFull) {
        setWarn(`Đợt đích nay có ${data.registered}/${data.capacity} người — đã vượt trần.`);
      }
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setMoving(null);
    }
  }

  if (members.length === 0) {
    return <Note className="mt-3">Chưa có thí sinh nào đăng ký đợt này.</Note>;
  }

  const others = waveOptions.filter((o) => Number(o.value) !== currentWaveId);

  /**
   * Tách danh sách theo BẢNG THI.
   *
   * Trần số lượng và giải thưởng đều tính riêng từng bảng, nên một danh sách trộn chung buộc BTC
   * phải tự đếm bằng mắt để biết bảng nào đang thiếu người — đúng việc mà màn này sinh ra để khỏi
   * phải làm.
   */
  const groups: Array<{ key: string; label: string; list: Member[] }> = [
    { key: "ky_thuat", label: "Bảng Kỹ thuật", list: members.filter((m) => m.board === "ky_thuat") },
    { key: "van_phong", label: "Bảng Văn phòng", list: members.filter((m) => m.board === "van_phong") },
    { key: "none", label: "Chưa xác định bảng", list: members.filter((m) => !m.board) },
  ].filter((g) => g.list.length > 0);

  return (
    <div className="mt-3 border-t border-stroke pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-caption font-medium text-link hover:text-link-hover"
      >
        {open ? "Ẩn danh sách" : `Xem ${members.length} thí sinh trong đợt`}
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          {warn && <Alert tone="warning">{warn}</Alert>}

          {groups.map((g) => (
            <div key={g.key} className="space-y-2">
              <p className="text-caption font-medium text-ink-2">
                {g.label} · {g.list.length} thí sinh
              </p>
              {g.list.map((m) => (
            <div
              key={m.submissionId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stroke bg-surface px-3 py-2"
            >
              <div className="min-w-0">
                <div className="truncate text-caption font-medium text-ink">{m.productName}</div>
                <div className="text-meta text-ink-3">
                  {m.userName} · {m.department}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={REG_TONE[m.registrationStatus] ?? "neutral"}>
                  {REG_LABEL[m.registrationStatus] ?? m.registrationStatus}
                </Badge>
                {others.length > 0 && (
                  <>
                    <div className="w-44">
                      <Select
                        placeholder="— Chuyển sang —"
                        options={others}
                        value={target[m.submissionId] ?? null}
                        onChange={(v) => setTarget({ ...target, [m.submissionId]: v })}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={moving === m.submissionId}
                      disabled={!target[m.submissionId]}
                      onClick={() => void move(m.submissionId)}
                    >
                      Chuyển
                    </Button>
                  </>
                )}
              </div>
            </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
