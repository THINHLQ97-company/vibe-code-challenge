/**
 * ĐIỂM THƯỞNG ĐĂNG KÝ SỚM theo đợt thi.
 *
 * Vì sao tối đa 5 và giảm dần 1 mỗi wave:
 *
 *   · Khoảng cách giữa các bài dẫn đầu thường chỉ 2–5 điểm trên thang 100, nên 5 điểm đủ để việc
 *     đăng ký sớm thật sự có giá trị chứ không phải phần thưởng tượng trưng.
 *   · Nhưng thang rộng hơn thì phản tác dụng: với 8 wave mà mỗi wave cách nhau 1 điểm từ 8 xuống
 *     1, người ở wave cuối biết trước mình không thể thắng và sẽ không làm nghiêm túc. Mất mấy
 *     chục bài dự thi tử tế để đổi lấy một cơ chế khuyến khích là lỗ.
 *   · Giảm về 0 chứ không đi âm: đăng ký muộn thì KHÔNG ĐƯỢC CỘNG, không bị phạt. Phạt người vào
 *     sau là phạt đúng nhóm cần khuyến khích tham gia nhất.
 *
 * Với 250–300 nhân sự và trần ~35 người mỗi wave, dự kiến 5–8 wave — tức wave 6 trở đi không còn
 * điểm thưởng. Đó là chủ ý: điểm thưởng để thúc người do dự ở giai đoạn đầu, không phải để chia
 * hạng suốt cả mùa.
 */
export const MAX_WAVE_BONUS = 5;

/** Điểm thưởng mặc định khi tạo wave thứ `orderIndex` (1 là wave đầu tiên). */
export function defaultBonusForWave(orderIndex: number): number {
  return Math.max(0, MAX_WAVE_BONUS - (orderIndex - 1));
}

/** Bảng điểm thưởng để hiển thị cho thí sinh. */
export function bonusSchedule(waveCount: number) {
  return Array.from({ length: Math.max(waveCount, MAX_WAVE_BONUS + 1) }, (_, i) => ({
    orderIndex: i + 1,
    bonus: defaultBonusForWave(i + 1),
  }));
}
