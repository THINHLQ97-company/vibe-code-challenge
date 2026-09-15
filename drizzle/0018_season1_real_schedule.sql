-- LỊCH THẬT CỦA MÙA 1 — ban tổ chức chốt ngày 15/09/2026.
--
-- Trước đây các đợt được tạo bằng mốc thời gian TƯƠNG ĐỐI ("hôm nay trừ 21 ngày") để demo chạy
-- được bất cứ lúc nào. Nay chương trình đã có lịch công bố, nên phải nạp đúng ngày đã hứa —
-- trang chủ, hạn nộp và khung giờ đăng bài đều đọc từ đây.
--
-- Giờ lưu theo UTC, hiển thị quy đổi sang giờ Việt Nam (+7):
--   01:30 UTC = 08:30 VN   ·   05:00 UTC = 12:00 VN   ·   15:00 UTC = 22:00 VN
--   16:59 UTC = 23:59 VN   ·   17:00 UTC hôm trước = 00:00 VN hôm sau

-- Mùa đang chạy = mùa có ngày bắt đầu mới nhất, đúng quy tắc của getActiveSeason().
WITH season AS (
  SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1
), plan(order_index, name, reg_open, reg_close, p2_open, p2_close, judging, post_open, post_close, done, bonus) AS (
  VALUES
    (1, 'Đợt 1',
     TIMESTAMP '2026-09-19 01:30', TIMESTAMP '2026-09-22 16:59',
     TIMESTAMP '2026-09-22 17:00', TIMESTAMP '2026-10-07 05:00',
     '["2026-09-26","2026-10-03","2026-10-07"]'::jsonb,
     TIMESTAMP '2026-10-08 01:30', TIMESTAMP '2026-10-10 15:00',
     TIMESTAMP '2026-10-17 16:59', 5),
    (2, 'Đợt 2',
     TIMESTAMP '2026-09-26 01:30', TIMESTAMP '2026-09-29 16:59',
     TIMESTAMP '2026-09-29 17:00', TIMESTAMP '2026-10-14 05:00',
     '["2026-10-03","2026-10-10","2026-10-14"]'::jsonb,
     TIMESTAMP '2026-10-15 01:30', TIMESTAMP '2026-10-17 15:00',
     TIMESTAMP '2026-10-24 16:59', 4),
    (3, 'Đợt 3',
     TIMESTAMP '2026-10-03 01:30', TIMESTAMP '2026-10-06 16:59',
     TIMESTAMP '2026-10-06 17:00', TIMESTAMP '2026-10-21 05:00',
     '["2026-10-10","2026-10-17","2026-10-21"]'::jsonb,
     TIMESTAMP '2026-10-22 01:30', TIMESTAMP '2026-10-24 15:00',
     TIMESTAMP '2026-10-31 16:59', 3),
    (4, 'Đợt 4',
     TIMESTAMP '2026-10-10 01:30', TIMESTAMP '2026-10-13 16:59',
     TIMESTAMP '2026-10-13 17:00', TIMESTAMP '2026-10-28 05:00',
     '["2026-10-17","2026-10-24","2026-10-28"]'::jsonb,
     TIMESTAMP '2026-10-29 01:30', TIMESTAMP '2026-10-31 15:00',
     TIMESTAMP '2026-11-07 16:59', 2),
    (5, 'Đợt 5',
     TIMESTAMP '2026-10-17 01:30', TIMESTAMP '2026-10-20 16:59',
     TIMESTAMP '2026-10-20 17:00', TIMESTAMP '2026-11-04 05:00',
     '["2026-10-24","2026-10-31","2026-11-04"]'::jsonb,
     TIMESTAMP '2026-11-05 01:30', TIMESTAMP '2026-11-07 15:00',
     TIMESTAMP '2026-11-14 16:59', 1)
)
-- Cập nhật các đợt đã có theo đúng thứ tự công bố.
-- CHỈ điền các cột lịch MỚI, và chỉ khi chúng còn trống.
--
-- Ban tổ chức đã tự nhập ngày mở/đóng đăng ký, trần số lượng và điểm thưởng trong giao diện quản
-- lý đợt thi. Ghi đè những cột đó ở đây sẽ nuốt mất phần họ vừa nhập tay, và không ai biết vì sao
-- con số mình điền lại đổi sau một lần deploy. Cột nào họ đã điền thì migration này không chạm.
UPDATE waves w
SET phase2_opens_at  = COALESCE(w.phase2_opens_at,  p.p2_open),
    phase2_closes_at = COALESCE(w.phase2_closes_at, p.p2_close),
    judging_dates    = CASE WHEN w.judging_dates = '[]'::jsonb THEN p.judging ELSE w.judging_dates END,
    posting_opens_at  = COALESCE(w.posting_opens_at,  p.post_open),
    posting_closes_at = COALESCE(w.posting_closes_at, p.post_close),
    completed_at      = COALESCE(w.completed_at,      p.done),
    updated_at        = now()
FROM plan p, season s
WHERE w.season_id = s.id AND w.order_index = p.order_index;
--> statement-breakpoint

-- Thêm những đợt còn thiếu (mùa cũ mới có 3 đợt demo).
WITH season AS (
  SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1
), plan(order_index, name, reg_open, reg_close, p2_open, p2_close, judging, post_open, post_close, done, bonus) AS (
  VALUES
    (1, 'Đợt 1',
     TIMESTAMP '2026-09-19 01:30', TIMESTAMP '2026-09-22 16:59',
     TIMESTAMP '2026-09-22 17:00', TIMESTAMP '2026-10-07 05:00',
     '["2026-09-26","2026-10-03","2026-10-07"]'::jsonb,
     TIMESTAMP '2026-10-08 01:30', TIMESTAMP '2026-10-10 15:00',
     TIMESTAMP '2026-10-17 16:59', 5),
    (2, 'Đợt 2',
     TIMESTAMP '2026-09-26 01:30', TIMESTAMP '2026-09-29 16:59',
     TIMESTAMP '2026-09-29 17:00', TIMESTAMP '2026-10-14 05:00',
     '["2026-10-03","2026-10-10","2026-10-14"]'::jsonb,
     TIMESTAMP '2026-10-15 01:30', TIMESTAMP '2026-10-17 15:00',
     TIMESTAMP '2026-10-24 16:59', 4),
    (3, 'Đợt 3',
     TIMESTAMP '2026-10-03 01:30', TIMESTAMP '2026-10-06 16:59',
     TIMESTAMP '2026-10-06 17:00', TIMESTAMP '2026-10-21 05:00',
     '["2026-10-10","2026-10-17","2026-10-21"]'::jsonb,
     TIMESTAMP '2026-10-22 01:30', TIMESTAMP '2026-10-24 15:00',
     TIMESTAMP '2026-10-31 16:59', 3),
    (4, 'Đợt 4',
     TIMESTAMP '2026-10-10 01:30', TIMESTAMP '2026-10-13 16:59',
     TIMESTAMP '2026-10-13 17:00', TIMESTAMP '2026-10-28 05:00',
     '["2026-10-17","2026-10-24","2026-10-28"]'::jsonb,
     TIMESTAMP '2026-10-29 01:30', TIMESTAMP '2026-10-31 15:00',
     TIMESTAMP '2026-11-07 16:59', 2),
    (5, 'Đợt 5',
     TIMESTAMP '2026-10-17 01:30', TIMESTAMP '2026-10-20 16:59',
     TIMESTAMP '2026-10-20 17:00', TIMESTAMP '2026-11-04 05:00',
     '["2026-10-24","2026-10-31","2026-11-04"]'::jsonb,
     TIMESTAMP '2026-11-05 01:30', TIMESTAMP '2026-11-07 15:00',
     TIMESTAMP '2026-11-14 16:59', 1)
)
INSERT INTO waves (
  season_id, name, order_index, registration_opens_at, registration_closes_at,
  phase2_opens_at, phase2_closes_at, judging_dates, posting_opens_at, posting_closes_at,
  completed_at, capacity, capacity_ky_thuat, capacity_van_phong, bonus_points, status
)
SELECT s.id, p.name, p.order_index, p.reg_open, p.reg_close,
       p.p2_open, p.p2_close, p.judging, p.post_open, p.post_close,
       p.done, 40, 15, 25, p.bonus, 'open'
FROM plan p, season s
WHERE NOT EXISTS (
  SELECT 1 FROM waves w WHERE w.season_id = s.id AND w.order_index = p.order_index
);
--> statement-breakpoint

-- Hạn nộp của bài đã duyệt bám theo hạn chung của đợt, thay cho hạn riêng lẻ "ngày duyệt + 15".
UPDATE submissions sub
SET submission_deadline = w.phase2_closes_at
FROM waves w
WHERE sub.wave_id = w.id
  AND w.phase2_closes_at IS NOT NULL
  AND sub.approved_at IS NOT NULL;
--> statement-breakpoint

-- Dựng khung giờ đăng bài cho mọi đợt đã có cửa sổ đăng bài.
-- Hạn mức: ngày 1–2 mỗi khung 5 suất, ngày 3 rút còn 4/3/3 — tổng 40, đúng trần một đợt.
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
