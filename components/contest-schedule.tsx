import { GlassCard } from "@/components/landing-ui";
import { formatDateVN } from "@/lib/datetime";
import type { PublicWave } from "@/components/wave-schedule";

/**
 * LỊCH ĐẦY ĐỦ CỦA CẢ MÙA trên trang giới thiệu.
 *
 * Khác với khung đếm ngược ở đầu trang — khung đó trả lời "còn bao lâu nữa", còn mục này trả lời
 * "đợt nào hợp với lịch của tôi". Người chưa đăng ký cần nhìn cả năm đợt cùng lúc mới chọn được,
 * vì mỗi đợt ràng buộc họ hai tuần làm bài cộng ba ngày đăng bài.
 *
 * KHÔNG kẻ bảng năm dòng sáu cột. Một bảng như vậy ở màn điện thoại phải cuộn ngang, và cuộn ngang
 * thì mất luôn cột đầu — người đọc không còn biết dòng mình đang xem là đợt mấy. Mỗi đợt ở đây là
 * một thẻ riêng, bên trong xếp các chặng thành hàng ngang trên màn rộng và xuống dòng ở màn hẹp.
 */
export function ContestSchedule({ waves }: { waves: PublicWave[] }) {
  if (waves.length === 0) return null;

  return (
    <section id="lich-thi" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12 sm:px-6">
      <div className="text-center">
        <h2 className="text-section font-bold tracking-tight text-cream">Lịch các đợt thi</h2>
        <p className="mx-auto mt-3 max-w-2xl text-body leading-relaxed text-cream/65">
          Mỗi đợt là một vòng khép kín: bốn ngày mở đăng ký, hai tuần làm bài với ba lượt ban giám
          khảo trả kết quả, rồi ba ngày đăng bài lan tỏa. Chọn đợt nào tiện cho lịch công việc của
          bạn — đợt càng sớm thì điểm thưởng đăng ký càng cao.
        </p>
      </div>

      <div className="mt-7 space-y-3">
        {waves.map((w) => (
          <WaveRow key={w.id} wave={w} />
        ))}
      </div>

      <p className="mt-5 text-center text-caption text-cream/50">
        Ban tổ chức có thể điều chỉnh lịch khi cần; trang này luôn hiện lịch mới nhất.
      </p>
    </section>
  );
}

function WaveRow({ wave: w }: { wave: PublicWave }) {
  const stateLabel =
    w.state === "open" ? "Đang mở đăng ký" : w.state === "upcoming" ? "Sắp mở" : "Đã đóng";

  const stages = [
    {
      label: "Đăng ký",
      value: `${formatDateVN(w.registrationOpensAt)} – ${formatDateVN(w.registrationClosesAt)}`,
      note: w.bonusPoints > 0 ? `+${w.bonusPoints} điểm thưởng` : "không có điểm thưởng",
    },
    w.phase2OpensAt && w.phase2ClosesAt
      ? {
          label: "Làm bài",
          value: `${formatDateVN(w.phase2OpensAt)} – ${formatDateVN(w.phase2ClosesAt)}`,
          note: `hạn nộp ${formatDateVN(w.phase2ClosesAt)}`,
        }
      : null,
    w.judgingDates.length > 0
      ? {
          label: "Ban giám khảo trả kết quả",
          value: w.judgingDates.map((d) => formatDateVN(d)).join(" · "),
          note: `${w.judgingDates.length} lượt, lượt cuối chốt điểm`,
        }
      : null,
    w.postingOpensAt && w.postingClosesAt
      ? {
          label: "Đăng bài lan tỏa",
          value: `${formatDateVN(w.postingOpensAt)} – ${formatDateVN(w.postingClosesAt)}`,
          note: "theo khung giờ đã đặt trước",
        }
      : null,
    w.completedAt
      ? { label: "Khép lại", value: formatDateVN(w.completedAt), note: "đủ 7 ngày đếm tương tác" }
      : null,
  ].filter((x): x is { label: string; value: string; note: string } => x !== null);

  return (
    <GlassCard className={`p-4 ${w.state === "closed" ? "opacity-55" : ""}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-title font-semibold text-cream">{w.name}</h3>
        <span
          className={`text-meta font-medium ${
            w.state === "open" ? "text-orange-bright" : "text-cream/50"
          }`}
        >
          {stateLabel} · {w.capacity} suất (Kỹ thuật {w.capacityKyThuat} · Văn phòng{" "}
          {w.capacityVanPhong})
        </span>
      </div>

      <div className="mt-3 grid gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-5">
        {stages.map((st, i) => (
          <div
            key={st.label}
            // Vạch ngăn dọc chỉ vẽ ở màn đủ rộng để các chặng nằm cùng hàng; khi đã xuống dòng thì
            // vạch dọc sẽ cắt ngang giữa nội dung chứ không ngăn được gì.
            className={`lg:pl-4 ${i > 0 ? "lg:border-l lg:border-cream/12" : ""}`}
          >
            <p className="text-meta uppercase tracking-wide text-cream/45">{st.label}</p>
            <p className="mt-1 text-caption font-medium tabular-nums text-cream/90">{st.value}</p>
            <p className="mt-0.5 text-meta text-cream/50">{st.note}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
