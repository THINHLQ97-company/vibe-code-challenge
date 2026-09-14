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
  const closedBefore = waves.some((w) => w.state === "closed");

  /**
   * Đợt kế tiếp chỉ bị loại khỏi danh sách khi NÓ ĐANG ĐƯỢC ĐẾM NGƯỢC ở phía trên.
   *
   * Đồng hồ đếm cho đợt đang mở nếu có; chỉ khi không đợt nào mở thì nó mới đếm tới đợt kế. Bản
   * trước loại `next` vô điều kiện, nên lúc có đợt đang mở thì đợt ngay sau đó vừa không được đếm
   * vừa bị loại khỏi danh sách — biến mất hoàn toàn khỏi trang chủ.
   */
  const nextIsCounted = !open && next != null;
  const upcoming = waves.filter(
    (w) => w.state === "upcoming" && !(nextIsCounted && w.id === next?.id)
  );

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
                {/* "Đang giữa hai đợt" chỉ đúng khi ĐÃ có đợt đóng trước đó. Ở đợt đầu tiên thì
                    chưa có đợt nào phía trước để mà nằm giữa — câu đó vừa sai vừa làm người đọc
                    tưởng mình đã lỡ mất một đợt. */}
                <Pill tone="neutral">{closedBefore ? "Đang giữa hai đợt" : "Sắp mở đăng ký"}</Pill>
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
            <div className="min-w-60 flex-1 sm:max-w-xs">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-caption text-cream/55">thí sinh đã đăng ký đợt này</p>
                <div className="text-kpi font-bold tabular-nums leading-none text-cream">
                  {open.registered}
                  <span className="text-title text-cream/40">/{open.capacity}</span>
                </div>
              </div>

              {/* Thanh tiến độ: con số "18/40" phải đọc rồi mới so được, còn thanh thì liếc là
                  thấy đợt sắp đầy tới đâu — thứ quyết định người ta đăng ký ngay hay để mai. */}
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream/10">
                <div
                  className={`h-full rounded-full transition-[width] ${
                    open.registered >= open.capacity ? "bg-orange-bright" : "bg-orange/80"
                  }`}
                  style={{
                    width: `${Math.min(100, (open.registered / open.capacity) * 100)}%`,
                  }}
                />
              </div>

              <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-meta text-cream/50">
                  {open.registered >= open.capacity
                    ? "Đợt này đã đầy — chờ đợt kế tiếp"
                    : `Còn ${open.capacity - open.registered} suất`}
                </p>
                {open.bonusPoints > 0 && (
                  <p className="text-meta text-orange-bright">
                    +{open.bonusPoints} điểm thưởng khi đăng ký đợt này
                  </p>
                )}
              </div>
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
          </div>
        )}
      </GlassCard>
    </section>
  );
}
