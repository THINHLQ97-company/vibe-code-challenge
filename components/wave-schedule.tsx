import { GlassCard, Pill } from "@/components/landing-ui";
import { WaveCountdown } from "@/components/wave-countdown";
import { formatDateTimeVN } from "@/lib/datetime";

export type PublicWave = {
  id: number;
  name: string;
  orderIndex: number;
  registrationOpensAt: string;
  registrationClosesAt: string;
  capacity: number;
  bonusPoints: number;
  registered: number;
  state: "open" | "upcoming" | "closed";
};

/**
 * Lịch các đợt thi trên trang giới thiệu.
 *
 * Trả về `null` khi mùa thi chưa chia đợt — không hiện một khung rỗng nói "chưa có đợt nào", vì
 * lúc đó chương trình vẫn nhận đăng ký tự do và một dòng như vậy chỉ làm người đọc tưởng mình
 * phải chờ.
 */
export function WaveSchedule({ waves }: { waves: PublicWave[] }) {
  if (waves.length === 0) return null;

  const open = waves.find((w) => w.state === "open");
  const next = waves.find((w) => w.state === "upcoming");
  const upcoming = waves.filter((w) => w.state === "upcoming");

  return (
    <section id="dot-thi" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-7 sm:px-6">
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-60">
            {open ? (
              <>
                <Pill tone="accent">{open.name} đang mở đăng ký</Pill>
                <p className="mt-2 text-caption text-cream/60">Còn lại trước khi đóng đăng ký</p>
                <div className="mt-2">
                  <WaveCountdown to={open.registrationClosesAt} />
                </div>
              </>
            ) : next ? (
              <>
                <Pill tone="neutral">Đang giữa hai đợt</Pill>
                <p className="mt-2 text-caption text-cream/60">{next.name} mở đăng ký sau</p>
                <div className="mt-2">
                  <WaveCountdown to={next.registrationOpensAt} tone="muted" />
                </div>
              </>
            ) : (
              <>
                <Pill tone="neutral">Đã đóng toàn bộ đợt đăng ký</Pill>
                <p className="mt-2 text-caption text-cream/60">
                  Chương trình không còn nhận đăng ký mới trong mùa này.
                </p>
              </>
            )}
          </div>

          {open && (
            <div className="text-right">
              <div className="text-kpi font-bold tabular-nums text-cream">
                {open.registered}
                <span className="text-title text-cream/40">/{open.capacity}</span>
              </div>
              <p className="text-caption text-cream/55">thí sinh đã đăng ký đợt này</p>
              {open.bonusPoints > 0 && (
                <p className="mt-1 text-meta text-orange-bright">
                  Đăng ký đợt này được cộng {open.bonusPoints} điểm thưởng
                </p>
              )}
            </div>
          )}
        </div>

        {upcoming.length > 0 && (
          <div className="mt-5 border-t border-cream/10 pt-4">
            <p className="text-caption font-medium text-cream/80">Các đợt tiếp theo</p>
            <ul className="mt-2 space-y-1.5">
              {upcoming.map((w) => (
                <li
                  key={w.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 text-caption text-cream/60"
                >
                  <span className="text-cream/80">{w.name}</span>
                  <span className="tabular-nums">
                    mở {formatDateTimeVN(w.registrationOpensAt)} · {w.capacity} suất
                    {w.bonusPoints > 0 ? ` · +${w.bonusPoints} điểm` : " · không có điểm thưởng"}
                  </span>
                </li>
              ))}
            </ul>
            {/* Nói thẳng cơ chế: đăng ký sớm được cộng điểm, muộn thì không bị trừ. Giấu đi rồi
                để người ta tự phát hiện sau khi đã lỡ đợt là cách nhanh nhất tạo cảm giác bị gài. */}
            <p className="mt-3 text-meta text-cream/45">
              Đợt càng sớm điểm thưởng càng cao, giảm dần về 0 — đăng ký muộn thì không được cộng,
              không bị trừ.
            </p>
          </div>
        )}
      </GlassCard>
    </section>
  );
}
