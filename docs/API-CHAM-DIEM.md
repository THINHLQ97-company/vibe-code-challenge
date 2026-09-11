# Hợp đồng API — Công cụ chấm điểm ngoài

Tài liệu dành cho đội xây dựng công cụ chấm điểm. App quản lý cuộc thi **không tự chấm**: nó lưu
bài dự thi, mở cổng cho công cụ ngoài đọc dữ liệu và nhận điểm trả về, rồi hiển thị.

- Địa chỉ gốc: `https://vibecodechallenge.matbao.ai`
- Xác thực: header `X-API-Key: <SCORING_API_KEY>` trên **mọi** endpoint dưới đây
- Định dạng: JSON, UTF-8

Khoá API do ban tổ chức cấp. Thiếu hoặc sai khoá → `401`. App **đóng mặc định**: bản triển khai
chưa đặt biến `SCORING_API_KEY` thì mọi request đều bị từ chối, không có chế độ mở.

---

## 1. Barem điểm và phase nào cần AI

Tổng 100 điểm:

| Phase | Mã mục | Tên hiển thị | Trần | Căn cứ chấm | Cần AI? |
|---|---|---|---|---|---|
| 1 | `giaTriUngDung` | Giá trị ứng dụng | 25 | Tài liệu PRD, bài toán, người dùng mục tiêu | **Có** |
| 2 | `chatLuongKyThuat` | Chất lượng kỹ thuật | 40 | Mã nguồn GitHub, lịch sử commit | **Có** |
| 2 | `hoanThien` | Độ hoàn thiện | 15 | Sản phẩm chạy thật trên Vibe Host | **Có** |
| 3 | — | Lan tỏa cộng đồng | 20 | Bậc tương tác bài đăng Facebook | **Không** |

**Phase 3 không dùng AI.** Điểm lan tỏa tính theo bậc tương tác của bài đăng, ban tổ chức duyệt
và nhập tay trên giao diện quản trị — không có API cho mục này. Cần tự động hoá thì báo trước,
app đã có sẵn cột `engagement_count` / `engagement_tier` để mở thêm endpoint.

**Cổng an toàn CP4 không phải điểm** mà là cổng chặn (mục 5). Công cụ có thể rà bảy điều cấm và
đẩy kết quả về; bài bị gắn cờ sẽ không được công bố cho tới khi thí sinh sửa.

Điểm công cụ đẩy về là **điểm tham chiếu**, không phải điểm cuối. Hội đồng giám khảo vẫn chấm độc
lập; khi đã có phiếu giám khảo thì điểm cuối lấy **trung bình các phiếu giám khảo**, điểm máy chỉ
dùng khi chưa ai chấm tay. Thí sinh chỉ nhìn thấy điểm sau khi có phiếu giám khảo.

---

## 2. `GET /api/integrations/submissions` — lấy danh sách bài cần chấm

Điểm khởi đầu của công cụ. Đừng dò `id` tăng dần.

**Tham số**

| Tên | Bắt buộc | Giá trị | Mặc định |
|---|---|---|---|
| `phase` | có | `1` hoặc `2` | — |
| `scored` | không | `false` (chưa chấm) · `true` (đã chấm) · `all` | `false` |
| `limit` | không | 1–100 | `50` |
| `after` | không | con trỏ trang — `id` cuối của trang trước | `0` |

**Điều kiện một bài xuất hiện** (bài chưa đủ điều kiện bị loại, để công cụ không chấm trên dữ liệu
còn trống):

- Phase 1: đề tài đã được BTC duyệt **và** có tài liệu PRD
- Phase 2: có **cả** link sản phẩm Vibe Host **và** link mã nguồn GitHub

**Phản hồi**

```json
{
  "phase": 1,
  "modules": [{ "key": "giaTriUngDung", "label": "Giá trị ứng dụng", "max": 25 }],
  "count": 1,
  "nextCursor": 12,
  "submissions": [
    {
      "id": 4,
      "board": "van_phong",
      "branch": "B",
      "topicGroup": "Kinh doanh / bán hàng",
      "currentPhase": 2,
      "hasPrd": true,
      "vibehostUrl": "https://...",
      "githubRepoUrl": "https://github.com/...",
      "githubVerified": true,
      "updatedAt": "2026-09-11T04:13:29.613Z"
    }
  ]
}
```

**Phân trang bằng con trỏ, không phải `offset`.** Lặp cho tới khi `nextCursor` là `null`, mỗi vòng
truyền `after = nextCursor` của vòng trước. Lý do: công cụ vừa duyệt vừa ghi điểm, mà ghi điểm làm
bài đó rời khỏi danh sách "chưa chấm" — dùng `offset` thì mọi bài phía sau lùi một bậc và cứ mỗi
trang lại nhảy cóc mất một bài.

---

## 3. `GET /api/integrations/submissions/{id}` — đọc chi tiết một bài

**Phản hồi**

```json
{
  "submission": {
    "id": 4,
    "currentPhase": 2,
    "board": "van_phong",
    "branch": "B",
    "topicGroup": "Kinh doanh / bán hàng",
    "productName": "CRM mini",

    "problemDesc": "…",
    "targetUsers": "…",
    "prd": "# Tài liệu PRD dạng markdown…",
    "prdFileName": "crm-mini.md",

    "vibehostUrl": "https://…",
    "githubRepoUrl": "https://github.com/…",
    "githubVerified": true,
    "flaggedPrebuiltRepo": false,

    "securityStatus": "pending"
  },
  "rubric": [{ "key": "giaTriUngDung", "label": "…", "max": 25, "phase": 1, "basis": "…" }]
}
```

**Không trả thông tin cá nhân thí sinh** (tên, email, mã nhân viên) — công cụ chấm không cần biết
ai viết bài nào, và không biết thì cũng không thiên vị được.

`rubric` gửi kèm để công cụ không phải gõ cứng trần điểm ở phía mình.

`flaggedPrebuiltRepo = true` nghĩa là BTC đã xác định bài dùng lại repo có sẵn — vi phạm thể lệ,
không phải mục để trừ điểm. Bài đó không qua được Phase 2 bất kể điểm kỹ thuật.

Mã nguồn để **private**; tài khoản `matbao-vibe-bot` đã có quyền đọc. Công cụ cần đọc repo thì
dùng khoá riêng của tài khoản đó, app này không cấp token GitHub qua API.

---

## 4. `POST /api/integrations/scores` — trả điểm về

**Thân request**

```json
{
  "submissionId": 4,
  "phase": 2,
  "moduleScores": { "chatLuongKyThuat": 33, "hoanThien": 12 },
  "summary": "Mã nguồn rõ ràng, còn thiếu xử lý lỗi."
}
```

**Quy tắc kiểm — chặt cả hai chiều, sai là `422`:**

- Phải có **đủ** mọi mục của phase đó. Phase 1 cần `giaTriUngDung`; Phase 2 cần cả
  `chatLuongKyThuat` lẫn `hoanThien`. Điểm thiếu mục là điểm sai, không phải điểm một phần.
- **Không** được có khoá lạ. Khoá lạ gần như luôn là gõ sai tên.
- Mỗi mục nằm trong `0 … trần`.

Lỗi `422` trả kèm `expected` liệt kê đúng barem của phase để đối chiếu:

```json
{
  "error": "Khoá không thuộc barem Phase 1: giatriUngDung. Cho phép: giaTriUngDung",
  "expected": [{ "key": "giaTriUngDung", "label": "Giá trị ứng dụng", "max": 25, "phase": 1, "basis": "…" }]
}
```

> Bản API trước nhận mọi khoá. Gõ nhầm một ký tự là điểm vẫn "ghi nhận thành công", rồi phần tổng
> hợp đọc đúng tên khoá không thấy gì nên trả 0 — bài bị 0 điểm trong im lặng. Nay chặn ở cổng.

**Đẩy lại nhiều lần được.** Mỗi lần tạo một bản ghi mới; phần tổng hợp lấy bản mới nhất của công
cụ ngoài. Không cần xoá bản cũ, và không có endpoint xoá.

`summary` tối đa 4000 ký tự, hiển thị cho giám khảo đọc tham khảo.

---

## 5. `POST /api/integrations/security` — kết quả cổng an toàn (CP4)

**Thân request**

```json
{ "submissionId": 4, "status": "flagged", "note": "Chuỗi kết nối database nằm trong mã nguồn." }
```

`status` là `clean` hoặc `flagged`. Gắn cờ **bắt buộc** có `note` tối thiểu 10 ký tự nêu rõ vi
phạm điều cấm nào — chặn bài mà không nói vì sao thì thí sinh không có gì để sửa. Nội dung `note`
hiển thị thẳng cho thí sinh.

Bài `flagged` bị giữ lại không cho công bố cho tới khi thí sinh sửa và BTC rà lại.

---

## 6. Mã lỗi

| Mã | Nghĩa |
|---|---|
| `401` | Thiếu hoặc sai `X-API-Key` |
| `400` | Tham số hoặc thân request sai định dạng |
| `404` | `submissionId` không tồn tại |
| `422` | Bộ điểm không khớp barem (thiếu mục, thừa khoá, vượt trần) |

---

## 7. Vòng làm việc đề xuất

```
1. GET  /api/integrations/submissions?phase=1&scored=false
2. với mỗi bài:
     GET  /api/integrations/submissions/{id}      → đọc PRD
     chấm
     POST /api/integrations/scores                → trả điểm Phase 1
3. lặp lại với phase=2, đọc thêm repo và sản phẩm chạy thật
4. tuỳ chọn: POST /api/integrations/security      → kết quả rà bảy điều cấm
```

Chạy theo lịch (vd mỗi giờ) là đủ — app không gửi webhook khi có bài mới.

---

## 8. Chưa chốt

- **Giới hạn tần suất gọi**: hiện chưa có. Cần thì báo để bổ sung trước khi vào thi thật.
- **Webhook báo bài mới**: chưa có, công cụ tự hỏi theo lịch.
- **Điểm lan tỏa Phase 3**: hiện BTC nhập tay, chưa mở API (mục 1).
