# CẦN SỬA TRÊN WEB — CÁC CÂU HỨA "KHÔNG LOẠI AI"

| Hạng mục  | Thông tin                                                 |
|-----------|-----------------------------------------------------------|
| Người lập | Hoàng Minh Khôi — khoihm@matbao.com                       |
| Ngày      | 15/09/2026                                                |
| Hạn       | Trước 19/09 — trước khi mở form đăng ký đợt 1             |
| Cho       | Người cập nhật nội dung web, repo `matbao-vibe-challenge` |

Luật mới có ba trường hợp loại. Web hiện đang hứa ngược lại ở sáu chỗ. Hứa "không loại
ai" lúc người ta đăng ký rồi loại thật là chỗ khiếu nại sẽ đúng, nên phải sửa trước khi
mở form.

---

## Ba trường hợp loại theo luật mới

*(Dòng → là: Khi nào)*

- **A** · Hậu quả: Loại khỏi đợt, thi lại đợt sau
  → Hết Phase 1 mà chưa hoàn thiện theo feedback
- **B** · Hậu quả: Không được thi Phase 3
  → Hết Phase 2 mà chưa sửa xong, hoặc nộp trễ không kịp chấm lại
- **C** · Hậu quả: Loại khỏi Phase 3
  → Bài đăng chờ duyệt không đạt yêu cầu

Trường hợp B còn một nhánh: người trượt Phase 2 sửa xong thì hệ thống lọc lại **một
vòng duy nhất**; vẫn còn vấn đề quan trọng thì không cho thi Phase 3.

Mất Phase 3 nghĩa là mất 20 điểm lan tỏa, không đủ sáu mốc, tức không được công nhận
đậu — kéo theo mất hoàn phí 130.000đ và mất quyền tranh giải.

---

## Sáu chỗ phải sửa

### 1. `app/page.tsx` dòng 238–239 — câu hỏi đáp nặng nhất

Hiện tại:

> **Bài bị trả về ở vòng kiểm tra thì có bị loại không?**
> Không bị loại. Cả hai cổng kiểm tra — ngưỡng sàn kỹ thuật và rà soát an toàn — đều cho
> phép chỉnh sửa và nộp lại trong thời hạn của bạn.

Vấn đề: nói thẳng là không bị loại, trong khi cả ba trường hợp A, B, C đều loại.

Thay bằng:

> **Bài bị trả về ở vòng kiểm tra thì có bị loại không?**
> Không bị loại ngay. Ban giám khảo chỉ rõ chỗ chưa đạt và bạn được sửa rồi nộp lại
> trong thời hạn của mình. Nhưng thời hạn là có thật: hết Phase 1 mà chưa hoàn thiện
> theo feedback thì bạn phải đăng ký lại ở đợt sau; hết Phase 2 mà chưa sửa xong thì
> không được thi Phase 3, tức không đủ sáu mốc để được công nhận đậu. Nộp sớm là cách
> duy nhất để chắc chắn còn đủ thời gian sửa. Lưu ý thêm: điểm đã chấm được ghi nhận
> ngay tại thời điểm bạn nộp bài, sửa để qua cổng thì đi tiếp được nhưng điểm không
> chấm lại.

### 2. `app/page.tsx` dòng 548 — dưới tiêu đề "Ngưỡng sàn — 6 tiêu chí"

Hiện tại:

> Nhị phân: đạt hoặc không. Chưa đạt thì được sửa và nộp lại, không loại ai.

Vấn đề: ba chữ "không loại ai" giờ sai.

Thay bằng:

> Nhị phân: đạt hoặc không. Chưa đạt thì được sửa và nộp lại trong thời hạn của bạn —
> nhưng hết hạn mà chưa đạt thì không đi tiếp được.

### 3. `lib/journey-steps.tsx` dòng 59 — ghi chú mốc CP2

Hiện tại:

> Bị trả về thì vẫn nộp lại được, nhưng điểm đã chấm được ghi nhận ngay tại thời điểm
> bạn nộp bài. Ban giám khảo chỉ ra chỗ chưa đạt để bạn sửa và bước vào vòng kế tiếp.

Vấn đề: không nói gì tới hạn chót Phase 1 và hậu quả khi hết hạn.

Thay bằng:

> Bị trả về thì vẫn nộp lại được, không giới hạn số lần, miễn còn trong Phase 1. Feedback
> là bắt buộc hoàn thiện: hết Phase 1 mà chưa sửa xong thì bạn phải đăng ký lại ở đợt
> sau. Điểm đã chấm được ghi nhận ngay tại thời điểm nộp.

### 4. `lib/journey-steps.tsx` dòng 75 — ghi chú mốc CP3

Hiện tại: y hệt dòng 59.

Thay bằng:

> Bị trả về thì vẫn sửa và nộp lại được trong thời hạn Phase 2. Nộp trễ mà không còn
> lần chấm nào trước khi Phase 2 đóng thì không được thi Phase 3. Nếu đã trượt một lần,
> bài sửa lại chỉ được hệ thống lọc thêm một vòng duy nhất.

### 5. `app/huong-dan/page.tsx` dòng 319 — Bước 3

Hiện tại:

> Bị trả về thì vẫn nộp lại được, nhưng điểm đã chấm được ghi nhận ngay tại thời điểm
> bạn nộp bài. Ban giám khảo chỉ ra chỗ chưa đạt để bạn sửa và bước vào vòng kế tiếp.
> Thời gian làm bài chỉ bắt đầu tính từ thời điểm đề tài được duyệt.

Thay bằng: giữ nguyên câu cuối về mốc bắt đầu tính giờ, hai câu đầu thay bằng nội dung
ở mục 3 trên.

### 6. `app/page.tsx` dòng 242–243 — hỏi đáp về đăng bài

Hiện tại:

> **Không đăng bài chia sẻ thì có bị trượt không?**
> Không trượt, và bài của bạn vẫn được ghi nhận vào KPI 5.2… Bạn chỉ mất 20 điểm của
> phần lan tỏa…

Vấn đề: câu này không sai về KPI, nhưng **bỏ sót hai hậu quả nặng hơn** — không đủ sáu
mốc thì không được công nhận đậu, mà đậu mới có hoàn phí 130.000đ và quyền tranh giải.
Đọc câu hiện tại, thí sinh tưởng chỉ mất 20 điểm.

Bổ sung vào cuối câu trả lời:

> Nhưng đăng bài là một trong sáu mốc bắt buộc, và chỉ người đủ cả sáu mốc mới được
> công nhận đậu — tức mới được hoàn 130.000đ phí công cụ AI và mới vào diện xét giải.
> Bỏ bước này bạn vẫn giữ điểm đã chấm, nhưng mất cả hai quyền lợi đó.

---

## Một chỗ cần thêm mới, không phải sửa

Cả trang chủ lẫn trang hướng dẫn hiện **không có chỗ nào** nói tới trường hợp C — bài
đăng bị từ chối duyệt thì loại khỏi Phase 3. Đây là hình phạt nặng nhất mà lại chưa được
công bố ở đâu cả.

Nên thêm vào phần mô tả mốc CP5 trong `lib/journey-steps.tsx`, dạng ghi chú cảnh báo:

> Trước khi đăng, bạn phải tick xác nhận đã đọc checklist các điều cấm và ràng buộc nội
> dung bài đăng. Vì đã có checklist rõ ràng, bài đăng bị từ chối duyệt sẽ bị loại khỏi
> Phase 3, không có vòng sửa.

---

## Cần chốt trước khi viết câu chữ cuối

Người rơi vào trường hợp B hoặc C có được **đăng ký lại ở đợt sau** không?

- Nếu có: câu chữ nên viết là "mất đợt này, đăng ký lại đợt sau" — nhẹ hơn nhiều.
- Nếu không: phải nói thẳng là mất luôn mùa thi, và phải thống nhất với HR cách xử lý,
  vì tham gia là bắt buộc với toàn bộ 190 nhân sự.

Trường hợp A đã rõ là được đăng ký lại. B và C thì chưa ai nói.
