"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/dsvh/ui/overlay/Modal";
import { Button } from "@/components/dsvh/ui/Button";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Progress } from "@/components/dsvh/ui/Progress";
import { CheckCircleIcon } from "@/components/dsvh/icons";
import { CHECKLIST, CHECKLIST_ITEM_COUNT, CHECKLIST_VERSION } from "@/lib/phase3-checklist";

/**
 * CỔNG CHECKLIST của Phase 3 — phải tick TỪNG DÒNG mới qua.
 *
 * Không dùng một ô "tôi đã đọc và đồng ý". Ô gộp đó ai cũng tick trong một giây, trong khi hình
 * phạt phía sau nó rất nặng: bài đăng bị từ chối là mất toàn bộ điểm lan tỏa và không có vòng
 * sửa. Bắt tick từng dòng là cách duy nhất khiến người ta thật sự đi qua từng điều — và là bằng
 * chứng ban tổ chức cần khi phải loại một bài.
 *
 * Hộp thoại ĐÓNG ĐƯỢC giữa chừng: nhốt người ta trong một hộp hai mươi tư dòng không làm họ đọc
 * kỹ hơn, chỉ làm họ tìm cách thoát. Tick tới đâu giữ tới đó, đóng rồi mở lại vẫn còn.
 */
export function ChecklistGate({
  submissionId,
  ackedAt,
}: {
  submissionId: number;
  ackedAt: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const done = ticked.size;
  const complete = done >= CHECKLIST_ITEM_COUNT;

  function toggle(id: string) {
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function confirm() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/phase3/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [...ticked] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gửi xác nhận thất bại");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setSaving(false);
    }
  }

  if (ackedAt) {
    return (
      <p className="flex flex-wrap items-center gap-2 text-caption text-ink-2">
        <CheckCircleIcon size={15} className="text-teal" />
        Bạn đã xác nhận đủ {CHECKLIST_ITEM_COUNT} điều, lúc {ackedAt}.
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-link underline-offset-2 hover:underline"
        >
          Đọc lại checklist
        </button>
        <ReadOnlyModal open={open} onClose={() => setOpen(false)} />
      </p>
    );
  }

  return (
    <div>
      <p className="text-caption text-ink-2">
        Trước khi đăng, bạn cần đọc và tick đủ {CHECKLIST_ITEM_COUNT} điều về bảo mật, nội quy
        nhóm và cách đăng. Bài đăng vi phạm sẽ bị từ chối duyệt, và bị từ chối là mất toàn bộ điểm
        lan tỏa — không có vòng sửa.
      </p>
      <div className="mt-3">
        <Button variant="solid" onClick={() => setOpen(true)}>
          Đọc checklist và xác nhận
        </Button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Checklist trước khi đăng bài"
        description={`Tick đủ ${CHECKLIST_ITEM_COUNT} dòng mới gửi được link bài đăng. Bản ${CHECKLIST_VERSION}.`}
        size="lg"
        fixedHeight
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <span className="text-caption tabular-nums text-ink-2">
              Đã tick {done}/{CHECKLIST_ITEM_COUNT}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Để sau
              </Button>
              <Button variant="solid" disabled={!complete} loading={saving} onClick={confirm}>
                {complete ? "Xác nhận" : `Còn ${CHECKLIST_ITEM_COUNT - done} dòng`}
              </Button>
            </div>
          </div>
        }
      >
        <div className="mb-4">
          <Progress value={(done / CHECKLIST_ITEM_COUNT) * 100} tone="teal" />
        </div>

        {error && (
          <div className="mb-3">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        <div className="space-y-5">
          {CHECKLIST.map((g) => (
            <section key={g.key}>
              <h3 className="text-body font-semibold text-ink">
                Nhóm {g.key} — {g.title}
              </h3>
              {g.note && <p className="mt-1 text-caption text-ink-3">{g.note}</p>}
              {/* Mỗi dòng là một `<label>` bọc cả ô tick lẫn câu chữ: bấm vào bất cứ đâu trong
                  dòng cũng tick được, không phải nhắm đúng ô vuông mười sáu điểm ảnh. */}
              <ul className="mt-2 flex flex-col gap-1.5">
                {g.items.map((it) => {
                  const on = ticked.has(it.id);
                  return (
                    <li key={it.id}>
                      <label
                        className={`flex cursor-pointer gap-2.5 rounded-lg border p-2.5 transition-colors ${
                          on ? "border-teal/45 bg-teal/10" : "border-stroke bg-surface-2 hover:border-stroke-strong"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggle(it.id)}
                          className="mt-0.5 size-4 shrink-0 accent-teal"
                        />
                        <span className="text-caption leading-relaxed text-ink">
                          <Emphasised text={it.text} />
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </Modal>
    </div>
  );
}

/** Bản chỉ đọc, cho người đã xác nhận muốn xem lại mình đã đồng ý những gì. */
function ReadOnlyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Checklist trước khi đăng bài"
      description={`Bản ${CHECKLIST_VERSION} — bạn đã xác nhận đủ các điều dưới đây.`}
      size="lg"
      fixedHeight
    >
      <div className="space-y-5">
        {CHECKLIST.map((g) => (
          <section key={g.key}>
            <h3 className="text-body font-semibold text-ink">
              Nhóm {g.key} — {g.title}
            </h3>
            {g.note && <p className="mt-1 text-caption text-ink-3">{g.note}</p>}
            <ul className="mt-2 space-y-1.5">
              {g.items.map((it) => (
                <li key={it.id} className="flex gap-2 text-caption leading-relaxed text-ink-2">
                  <CheckCircleIcon size={15} className="mt-0.5 shrink-0 text-teal" />
                  <span>
                    <Emphasised text={it.text} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Modal>
  );
}

/** Chữ giữa hai dấu sao in đậm — giữ đúng phần ban tổ chức muốn nhấn trong bản gốc. */
function Emphasised({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 === 1 ? (
          <b key={i} className="font-semibold text-ink">
            {part}
          </b>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
