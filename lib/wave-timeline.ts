import { formatDateVN, formatDateTimeVN } from "@/lib/datetime";

export type Milestone = {
  key: string;
  /** Mốc thời gian dùng để sắp xếp và để so với hiện tại. */
  at: Date;
  title: string;
  detail: string;
  /** Ai phải làm việc ở mốc này — thí sinh tự nhìn ra việc của mình mà không phải đọc hết. */
  actor: "ban-to-chuc" | "thi-sinh";
  state: "done" | "current" | "upcoming";
};

export type TimelineWave = {
  name: string;
  registrationOpensAt: Date;
  registrationClosesAt: Date;
  phase2OpensAt: Date | null;
  phase2ClosesAt: Date | null;
  judgingDates: string[];
  postingOpensAt: Date | null;
  postingClosesAt: Date | null;
  completedAt: Date | null;
};

/**
 * Lịch của MỘT đợt, trải thành một chuỗi mốc theo thứ tự thời gian.
 *
 * Dựng từ dữ liệu của đợt chứ không gõ sẵn: ban tổ chức dời một ngày trong giao diện quản lý là
 * mọi màn hình đọc lịch đổi theo, không có bản chép tay nào ở lại phía sau nói ngày cũ.
 *
 * Mốc nào đợt chưa điền thì BỎ QUA, không hiện dòng trống — một dòng "chưa có ngày" giữa hai dòng
 * có ngày làm người đọc tưởng lịch bị đứt đoạn.
 */
export function buildWaveTimeline(wave: TimelineWave, now: Date = new Date()): Milestone[] {
  const raw: Omit<Milestone, "state">[] = [];

  raw.push({
    key: "reg-open",
    at: wave.registrationOpensAt,
    title: "Mở đăng ký đề tài",
    detail: `Từ ${formatDateTimeVN(wave.registrationOpensAt)}`,
    actor: "thi-sinh",
  });
  raw.push({
    key: "reg-close",
    at: wave.registrationClosesAt,
    title: "Đóng đăng ký",
    detail: `Hết hạn ${formatDateTimeVN(wave.registrationClosesAt)}`,
    actor: "thi-sinh",
  });

  if (wave.phase2OpensAt) {
    raw.push({
      key: "phase2-open",
      at: wave.phase2OpensAt,
      title: "Bắt đầu làm bài",
      detail: wave.phase2ClosesAt
        ? `Kỳ làm bài kéo dài tới ${formatDateVN(wave.phase2ClosesAt)}`
        : "Ban tổ chức duyệt đề tài xong là bắt tay vào làm",
      actor: "thi-sinh",
    });
  }

  wave.judgingDates.forEach((d, i) => {
    const at = new Date(`${d}T05:00:00Z`); // 12h trưa giờ Việt Nam
    raw.push({
      key: `judge-${i}`,
      at,
      title: `Ban giám khảo trả kết quả — lượt ${i + 1}`,
      detail:
        i === wave.judgingDates.length - 1
          ? `${formatDateVN(at)} — lượt cuối, chốt điểm cho cả đợt`
          : `${formatDateVN(at)} — bài đã nộp trước mốc này sẽ có kết quả`,
      actor: "ban-to-chuc",
    });
  });

  if (wave.phase2ClosesAt) {
    raw.push({
      key: "deadline",
      at: wave.phase2ClosesAt,
      title: "Hạn nộp sản phẩm",
      detail: `Trước ${formatDateTimeVN(wave.phase2ClosesAt)} — nộp sau mốc này không còn lượt chấm nào`,
      actor: "thi-sinh",
    });
  }

  if (wave.postingOpensAt) {
    raw.push({
      key: "posting",
      at: wave.postingOpensAt,
      title: "Cửa sổ đăng bài lan tỏa",
      detail: wave.postingClosesAt
        ? `${formatDateVN(wave.postingOpensAt)} – ${formatDateVN(wave.postingClosesAt)}, chia theo khung giờ đã đặt`
        : `Từ ${formatDateVN(wave.postingOpensAt)}`,
      actor: "thi-sinh",
    });
  }

  if (wave.completedAt) {
    raw.push({
      key: "done",
      at: wave.completedAt,
      title: "Đợt khép lại",
      detail: `${formatDateVN(wave.completedAt)} — đủ bảy ngày đếm tương tác cho bài đăng cuối cùng`,
      actor: "ban-to-chuc",
    });
  }

  raw.sort((a, b) => a.at.getTime() - b.at.getTime());

  /**
   * "Đang tới" là mốc SẮP TỚI GẦN NHẤT, không phải mốc vừa qua.
   *
   * Người đọc lịch hỏi "việc kế tiếp của tôi là gì", nên chỗ đánh dấu phải rơi vào việc chưa làm.
   * Đánh dấu mốc vừa qua thì dòng nổi bật nhất trên màn hình lại là thứ không còn phải làm gì.
   */
  const nextIndex = raw.findIndex((m) => m.at.getTime() > now.getTime());
  return raw.map((m, i) => ({
    ...m,
    state: m.at.getTime() <= now.getTime() ? "done" : i === nextIndex ? "current" : "upcoming",
  }));
}
