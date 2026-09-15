import { GlassCard } from "@/components/landing-ui";
import { WaveCountdown } from "@/components/wave-countdown";
import { formatDateTimeVN } from "@/lib/datetime";

export type PublicWave = {
  id: number;
  name: string;
  orderIndex: number;
  registrationOpensAt: string;
  registrationClosesAt: string;
  /** Các mốc lịch phía sau có thể chưa được ban tổ chức điền — mọi nơi đọc phải chịu được `null`. */
  phase2OpensAt: string | null;
  phase2ClosesAt: string | null;
  judgingDates: string[];
  postingOpensAt: string | null;
  postingClosesAt: string | null;
  completedAt: string | null;
  capacity: number;
  capacityKyThuat: number;
  capacityVanPhong: number;
  bonusPoints: number;
  registered: number;
  registeredKyThuat: number;
  registeredVanPhong: number;
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

  /**
   * Đợt đang được nói tới — đang mở, hoặc đợt kế tiếp nếu chưa đợt nào mở.
   *
   * Khung bên phải bám theo đợt này chứ không chỉ bám đợt ĐANG MỞ. Trước đây trong lúc đếm ngược
   * tới đợt đầu tiên thì nửa phải trống trơn, đúng lúc người đọc đang muốn biết đợt sắp mở có bao
   * nhiêu suất và cộng mấy điểm — hai con số quyết định họ có canh giờ đăng ký hay không.
   */
  const focus = open ?? next ?? null;

  return (
    <section id="dot-thi" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-7 sm:px-6">
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-60">
            {open ? (
              <>
                <p className="text-body font-semibold text-cream">{open.name} đang mở đăng ký</p>
                <p className="mt-1 text-caption text-cream/60">Còn lại trước khi đóng đăng ký</p>
                <div className="mt-2">
                  <WaveCountdown to={open.registrationClosesAt} />
                </div>
              </>
            ) : next ? (
              <>
                <p className="text-body font-semibold text-cream">{next.name} sắp mở đăng ký</p>
                <p className="mt-1 text-caption text-cream/60">Mở sau</p>
                <div className="mt-2">
                  <WaveCountdown to={next.registrationOpensAt} tone="muted" />
                </div>
                <p className="mt-2 text-meta text-cream/50">
                  Mở lúc {formatDateTimeVN(next.registrationOpensAt)}
                </p>
              </>
            ) : (
              <>
                <p className="text-body font-semibold text-cream">Đã đóng toàn bộ đợt đăng ký</p>
                <p className="mt-1 text-caption text-cream/60">
                  Chương trình không còn nhận đăng ký mới trong mùa này.
                </p>
              </>
            )}
          </div>

          {focus && (
            <div className="min-w-60 flex-1 sm:max-w-xs">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-caption text-cream/55">
                  {open ? "thí sinh đã đăng ký đợt này" : `số suất của ${focus.name}`}
                </p>
                <div className="text-kpi font-bold tabular-nums leading-none text-cream">
                  {open ? (
                    <>
                      {focus.registered}
                      <span className="text-title text-cream/40">/{focus.capacity}</span>
                    </>
                  ) : (
                    focus.capacity
                  )}
                </div>
              </div>

              {/* Thanh tiến độ chỉ có nghĩa khi đợt ĐANG NHẬN người: một thanh 0% trong lúc chưa
                  mở đăng ký trông như đợt ế, trong khi thật ra chưa ai được phép đăng ký. */}
              {open && (
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream/10">
                  <div
                    className={`h-full rounded-full transition-[width] ${
                      focus.registered >= focus.capacity ? "bg-orange-bright" : "bg-orange/80"
                    }`}
                    style={{
                      width: `${Math.min(100, (focus.registered / focus.capacity) * 100)}%`,
                    }}
                  />
                </div>
              )}

              {/* Tách theo bảng: giải thưởng tuần trao theo từng bảng, nên con số thật sự quan
                  trọng với người đang cân nhắc đăng ký là bảng CỦA HỌ còn bao nhiêu suất. */}
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {[
                  { t: "Kỹ thuật", n: focus.registeredKyThuat, c: focus.capacityKyThuat },
                  { t: "Văn phòng", n: focus.registeredVanPhong, c: focus.capacityVanPhong },
                ].map((b) => (
                  <div key={b.t} className="rounded-lg border border-cream/12 bg-cream/5 px-2.5 py-2">
                    <p className="text-meta text-cream/50">Bảng {b.t}</p>
                    <p className="text-caption font-semibold tabular-nums text-cream/90">
                      {open ? (
                        <>
                          {b.n}
                          <span className="font-normal text-cream/45">/{b.c}</span>
                        </>
                      ) : (
                        <>
                          {b.c} <span className="font-normal text-cream/45">suất</span>
                        </>
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-meta text-cream/50">
                  {open
                    ? focus.registered >= focus.capacity
                      ? "Đợt này đã đầy — chờ đợt kế tiếp"
                      : `Còn ${focus.capacity - focus.registered} suất`
                    : "Chưa mở, chưa ai đăng ký"}
                </p>
                {focus.bonusPoints > 0 && (
                  <p className="text-meta text-orange-bright">
                    +{focus.bonusPoints} điểm thưởng khi đăng ký đợt này
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
