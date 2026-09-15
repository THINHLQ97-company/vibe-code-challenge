-- SỬA LỖI CỦA 0018 — gán lịch theo NGÀY MỞ ĐĂNG KÝ thay vì theo số thứ tự đợt.
--
-- 0018 đối chiếu bằng `order_index`, tưởng rằng đợt thứ n trong database là đợt n của chương
-- trình. Thực tế database còn vài đợt cũ nằm xen giữa, nên số thứ tự bị đẩy lệch: đợt có ngày
-- đăng ký 03/10 lại nhận lịch làm bài của đợt 10/10. Ngày mở đăng ký là thứ ban tổ chức tự nhập
-- và đúng theo lịch đã công bố, nên nó mới là khoá đối chiếu đáng tin.
--
-- Ghi đè KHÔNG điều kiện ở đây là có chủ ý: các cột này do 0018 ghi ra, không phải ban tổ chức
-- nhập tay (giao diện quản lý lúc đó chưa có ô nào cho chúng), nên không có dữ liệu người dùng
-- nào để mất. Các cột ban tổ chức tự nhập — tên, ngày đăng ký, trần số lượng, điểm thưởng,
-- trạng thái — vẫn không bị chạm tới.
WITH plan(reg_day, p2_open, p2_close, judging, post_open, post_close, done) AS (
  VALUES
    (DATE '2026-09-19', TIMESTAMP '2026-09-22 17:00', TIMESTAMP '2026-10-07 05:00',
     '["2026-09-26","2026-10-03","2026-10-07"]'::jsonb,
     TIMESTAMP '2026-10-08 01:30', TIMESTAMP '2026-10-10 15:00', TIMESTAMP '2026-10-17 16:59'),
    (DATE '2026-09-26', TIMESTAMP '2026-09-29 17:00', TIMESTAMP '2026-10-14 05:00',
     '["2026-10-03","2026-10-10","2026-10-14"]'::jsonb,
     TIMESTAMP '2026-10-15 01:30', TIMESTAMP '2026-10-17 15:00', TIMESTAMP '2026-10-24 16:59'),
    (DATE '2026-10-03', TIMESTAMP '2026-10-06 17:00', TIMESTAMP '2026-10-21 05:00',
     '["2026-10-10","2026-10-17","2026-10-21"]'::jsonb,
     TIMESTAMP '2026-10-22 01:30', TIMESTAMP '2026-10-24 15:00', TIMESTAMP '2026-10-31 16:59'),
    (DATE '2026-10-10', TIMESTAMP '2026-10-13 17:00', TIMESTAMP '2026-10-28 05:00',
     '["2026-10-17","2026-10-24","2026-10-28"]'::jsonb,
     TIMESTAMP '2026-10-29 01:30', TIMESTAMP '2026-10-31 15:00', TIMESTAMP '2026-11-07 16:59'),
    (DATE '2026-10-17', TIMESTAMP '2026-10-20 17:00', TIMESTAMP '2026-11-04 05:00',
     '["2026-10-24","2026-10-31","2026-11-04"]'::jsonb,
     TIMESTAMP '2026-11-05 01:30', TIMESTAMP '2026-11-07 15:00', TIMESTAMP '2026-11-14 16:59')
)
UPDATE waves w
SET phase2_opens_at   = p.p2_open,
    phase2_closes_at  = p.p2_close,
    judging_dates     = p.judging,
    posting_opens_at  = p.post_open,
    posting_closes_at = p.post_close,
    completed_at      = p.done,
    updated_at        = now()
FROM plan p
WHERE w.registration_opens_at::date = p.reg_day;
--> statement-breakpoint

-- Đợt nào KHÔNG nằm trong lịch công bố thì xoá sạch mốc mà 0018 đã gán nhầm cho nó.
-- Để nguyên thì một đợt cũ nào đó hiện trên trang chủ kèm hạn nộp và ngày đăng bài của đợt khác.
UPDATE waves
SET phase2_opens_at   = NULL,
    phase2_closes_at  = NULL,
    judging_dates     = '[]'::jsonb,
    posting_opens_at  = NULL,
    posting_closes_at = NULL,
    completed_at      = NULL,
    updated_at        = now()
WHERE registration_opens_at::date NOT IN
      (DATE '2026-09-19', DATE '2026-09-26', DATE '2026-10-03', DATE '2026-10-10', DATE '2026-10-17');
--> statement-breakpoint

-- Khung giờ đã dựng theo cửa sổ đăng bài CŨ phải dời theo cửa sổ mới.
-- Dời tại chỗ chứ không xoá rồi dựng lại: xoá là mất luôn chỗ thí sinh đã đặt.
UPDATE posting_slots s
SET starts_at = (w.posting_opens_at::date + (s.day_index - 1))::timestamp
                + CASE s.period
                    WHEN 'sang'  THEN INTERVAL '1 hour 30 minutes'
                    WHEN 'chieu' THEN INTERVAL '6 hours'
                    ELSE              INTERVAL '11 hours'
                  END
FROM waves w
WHERE s.wave_id = w.id AND w.posting_opens_at IS NOT NULL;
--> statement-breakpoint

-- Đợt bị gỡ lịch thì khung giờ của nó không còn nghĩa gì; chỉ xoá khung CHƯA ai đặt.
DELETE FROM posting_slots s
USING waves w
WHERE s.wave_id = w.id
  AND w.posting_opens_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM submissions sub WHERE sub.posting_slot_id = s.id);
--> statement-breakpoint

-- Hạn nộp của bài đã duyệt bám theo hạn chung mới của đợt.
UPDATE submissions sub
SET submission_deadline = w.phase2_closes_at
FROM waves w
WHERE sub.wave_id = w.id
  AND w.phase2_closes_at IS NOT NULL
  AND sub.approved_at IS NOT NULL;
--> statement-breakpoint

-- Đợt vừa được gán cửa sổ đăng bài mà chưa có khung nào thì dựng đủ 9 khung ngay tại đây.
-- Có đường dựng lười lúc đọc, nhưng để nó chạy lần đầu vào đúng lúc một thí sinh mở trang thì
-- người đó phải chờ chín lệnh ghi trước khi thấy được bảng khung giờ.
INSERT INTO posting_slots (wave_id, day_index, starts_at, period, capacity)
SELECT w.id,
       g.day_index,
       (w.posting_opens_at::date + (g.day_index - 1))::timestamp + g.start_offset,
       g.period::posting_period,
       g.capacity
FROM waves w
CROSS JOIN (VALUES
  (1, 'sang',  INTERVAL '1 hour 30 minutes', 5),
  (1, 'chieu', INTERVAL '6 hours',           5),
  (1, 'toi',   INTERVAL '11 hours',          5),
  (2, 'sang',  INTERVAL '1 hour 30 minutes', 5),
  (2, 'chieu', INTERVAL '6 hours',           5),
  (2, 'toi',   INTERVAL '11 hours',          5),
  (3, 'sang',  INTERVAL '1 hour 30 minutes', 4),
  (3, 'chieu', INTERVAL '6 hours',           3),
  (3, 'toi',   INTERVAL '11 hours',          3)
) AS g(day_index, period, start_offset, capacity)
WHERE w.posting_opens_at IS NOT NULL
ON CONFLICT (wave_id, day_index, period) DO NOTHING;
--> statement-breakpoint

-- Ẩn các đợt KHÔNG thuộc lịch đã công bố khỏi trang chủ.
--
-- Đưa về trạng thái nháp chứ không xoá: đợt demo có thể đang có bài dự thi cũ trỏ vào, và xoá
-- hàng đó là làm hỏng những bài ấy. Nháp chỉ có nghĩa "chưa công bố" — ban tổ chức mở lại bằng
-- một nút bấm nếu cần.
UPDATE waves
SET status = 'draft', updated_at = now()
WHERE status <> 'draft'
  AND registration_closes_at < TIMESTAMP '2026-09-19 00:00';
--> statement-breakpoint

-- Đợt TRÙNG: hai đợt cùng ngày mở đăng ký là một đợt bị tạo hai lần.
-- Giữ bản được tạo sau (order_index lớn hơn) vì đó là bản ban tổ chức nhập hoàn chỉnh; bản còn
-- lại chỉ ẩn đi, và chỉ khi chưa có ai đăng ký vào nó.
UPDATE waves w
SET status = 'draft', updated_at = now()
WHERE w.status <> 'draft'
  AND EXISTS (
    SELECT 1 FROM waves other
    WHERE other.season_id = w.season_id
      AND other.id <> w.id
      AND other.registration_opens_at::date = w.registration_opens_at::date
      AND other.order_index > w.order_index
  )
  AND NOT EXISTS (SELECT 1 FROM submissions s WHERE s.wave_id = w.id);
