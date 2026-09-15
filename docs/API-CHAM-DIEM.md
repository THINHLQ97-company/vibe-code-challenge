# Hợp đồng API — Công cụ chấm điểm ngoài

Tài liệu dành cho đội xây dựng công cụ chấm điểm. App quản lý cuộc thi **không tự chấm**: nó lưu
bài dự thi, mở cổng cho công cụ ngoài đọc dữ liệu và nhận điểm trả về, rồi hiển thị.

- Địa chỉ gốc hiện tại: `https://vibe-code-challenge.n1.tinhgon.xyz`
- Địa chỉ chính thức (khi DNS xong): `https://vibecodechallenge.matbao.ai` — đội chấm nên để địa
  chỉ gốc thành một biến cấu hình, đừng gõ cứng, vì nó sẽ đổi đúng một lần
- Xác thực: header `X-API-Key: <SCORING_API_KEY>` trên **mọi** endpoint dưới đây
- Định dạng: JSON, UTF-8

Khoá API do ban tổ chức cấp. Thiếu hoặc sai khoá → `401`. App **đóng mặc định**: bản triển khai
chưa đặt biến `SCORING_API_KEY` thì mọi request đều bị từ chối, không có chế độ mở.

---

## 1. Barem điểm và phase nào cần AI

Thang **100 điểm**, cộng dồn qua ba vòng. Đây là barem đang chạy thật trong hệ thống — giao diện
thí sinh, trang chấm của ban giám khảo và trang giới thiệu đều đọc từ cùng một nguồn
(`lib/scoring-rubric.ts`), nên không có bản nào lệch bản nào.

| Vòng | Tên | Mã mục gửi qua API | Trần | Căn cứ chấm | Công cụ AI chấm |
|---|---|---|---|---|---|
| **Phase 1** | Ý tưởng | `giaTriUngDung` | 25 | Tài liệu PRD, bài toán, người dùng mục tiêu | **Có** |
| **Phase 2** | Sản phẩm | `chatLuongKyThuat` | 40 | Mã nguồn GitHub, lịch sử commit | **Có** |
| | | `hoanThien` | 15 | Sản phẩm chạy thật trên Vibe Host | **Có** |
| **Phase 3** | Lan tỏa | — | 20 | Bậc tương tác bài đăng Facebook | **Không** |

Phase 2 gồm **hai** mục, tổng 55 điểm. Khi trả điểm Phase 2 phải gửi **cả hai** mục trong cùng một
request (xem mục 4).

### Phase 3 không có API và không dùng AI

Điểm lan tỏa quy đổi từ lượt tương tác của bài đăng so với **trung vị của những người cùng đợt
thi**, ban tổ chức chốt bậc trên giao diện quản trị:

| Bậc | Điều kiện | Điểm |
|---|---|---|
| 4 | Trên 200% trung vị | 20 |
| 3 | 120–200% trung vị | 15 |
| 2 | 70–119% trung vị | 10 |
| 1 | Dưới 70% trung vị | 5 |

Phase 3 là **tuỳ chọn** (BTC chốt 15/09/2026): thí sinh bỏ qua thì phần này 0 điểm nhưng bài vẫn
được ghi nhận. Bài đăng bị ban tổ chức từ chối cũng tính 0 điểm phần này và không được đăng lại.

Muốn tự động hoá phần này thì báo trước — app đã có sẵn cột `engagement_count` và
`engagement_tier`, mở thêm endpoint là xong.

### Điểm thưởng đăng ký sớm — nằm NGOÀI thang 100

Thí sinh đăng ký ở đợt thi (wave) càng sớm thì được cộng thêm điểm thưởng: đợt 1 cộng 5, đợt 2 cộng
4, giảm dần về 0 từ đợt 6. Điểm này **cộng ngoài** thang 100 — nó thưởng thời điểm đăng ký chứ không
đo chất lượng bài, gộp vào 100 sẽ làm loãng phần đo chất lượng và khiến một bài hoàn hảo ở đợt cuối
không bao giờ đạt được điểm tuyệt đối của barem.

Hệ quả cho công cụ chấm: **điểm cuối của một thí sinh có thể lên tới 105**. Công cụ không cần tính
phần này và cũng không được gửi nó qua API — hệ thống tự cộng theo đợt của bài lúc công bố. Công cụ
chỉ chấm ba mục trong bảng trên, đúng trần của từng mục.

### Quan hệ giữa điểm AI và điểm giám khảo

Điểm công cụ đẩy về là **điểm gợi ý**, không phải điểm cuối:

1. Công cụ chấm đẩy điểm Phase 1 và Phase 2 về → hệ thống hiển thị đó là điểm sơ bộ.
2. Giám khảo mở bài lên, thấy sẵn điểm máy. **Đồng ý thì bấm một nút xác nhận**, phiếu của họ
   chính là điểm máy. Chỉ khi muốn điều chỉnh mới phải nhập tay.
3. Có phiếu giám khảo rồi thì điểm cuối lấy **trung bình các phiếu giám khảo**; điểm máy chỉ được
   dùng khi chưa ai chấm tay, và ban tổ chức **không được công bố** bài còn đang lấy nguyên điểm
   máy.
4. Thí sinh chỉ nhìn thấy điểm **sau khi** có phiếu giám khảo.

Nghĩa là công cụ chấm càng sát thì giám khảo càng ít phải nhập tay — nhưng điểm máy sai cũng không
gây hậu quả không sửa được.

### Cổng an toàn CP4 — không phải điểm

Rà bảy điều cấm, kết quả là **đạt / không đạt** (mục 5). Bài bị trả về sửa thì rà lại qua mục 6. Bài bị gắn cờ không được công bố cho tới
khi thí sinh sửa và ban tổ chức rà lại.

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

Mã nguồn để **private**; thí sinh thêm `git@matbao.ai` làm collaborator quyền đọc. Công cụ cần
đọc repo thì dùng khoá riêng của tài khoản đó — app này không cấp token GitHub qua API.

> **Đổi ý nghĩa trường `githubVerified` (15/09/2026).** App đã BỎ việc tự gọi GitHub API kiểm
> quyền collaborator. Trường này vẫn còn trong payload và vẫn là boolean, nhưng nay có nghĩa là
> **thí sinh đã nộp đủ link sản phẩm và link mã nguồn**, không phải "đã xác minh được quyền đọc
> repo". Công cụ chấm nào đang dựa vào nó để biết repo chắc chắn mở được thì phải tự thử `git
> clone` thay vì tin trường này.
>
> Lý do bỏ: việc kiểm cần một token máy chủ luôn còn hạn, và mỗi lần token hỏng thì mọi thí sinh
> đều thấy "chưa xác minh" — một lỗi phía hệ thống hiện ra như lỗi của họ, ngay giữa hạn nộp.

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

## 6. `GET` / `POST /api/integrations/recheck` — rà lại bản sửa

Khi ban tổ chức yêu cầu thí sinh chỉnh sửa ở Phase 2, bài đó cần được **rà lại** trước khi thí sinh
được đi tiếp sang Phase 3.

### Vì sao không dùng lại `/submissions?scored=false`

Endpoint đó lọc theo *"đã có điểm từ công cụ ngoài chưa"*, nên một bài đã chấm **một lần** là biến
mất khỏi hàng đợi vĩnh viễn. Thí sinh sửa xong nộp lại thì công cụ chạy bao nhiêu lượt cũng không
thấy bản sửa. Đây là đường riêng cho đúng việc đó.

### Đây KHÔNG phải chấm lại

Vòng này chỉ trả lời một câu: bản sửa **đã đạt chuẩn để đi tiếp chưa**. Không nhận điểm. Điểm Phase
2 đã chốt ở lần chấm đầu và không chấm lại — thí sinh sửa là để đi tiếp, không phải để nâng điểm.

### `GET /api/integrations/recheck` — lấy danh sách chờ rà

```json
{
  "count": 2,
  "submissions": [
    {
      "id": 7,
      "githubRepoUrl": "https://github.com/…",
      "vibehostUrl": "https://…",
      "returnedBecause": "Thiếu xử lý lỗi khi kết nối database thất bại.",
      "updatedAt": "2026-09-15T04:13:29.613Z"
    }
  ]
}
```

`returnedBecause` là lý do ban tổ chức trả bài — công cụ cần biết để soi lại đúng chỗ đó.

### `POST /api/integrations/recheck` — trả kết quả

```json
{ "submissionId": 7, "result": "failed", "note": "Vẫn chưa bắt lỗi kết nối database." }
```

`result` là `passed` hoặc `failed`. **`failed` bắt buộc có `note` tối thiểu 10 ký tự** — thí sinh
đọc đúng câu đó để biết còn phải sửa gì.

`passed` sẽ **đóng luôn cổng an toàn** cho bài đó: vòng rà này chính là lần rà bảy điều cấm trên
bản sửa, bắt thí sinh chờ thêm một lượt rà nữa cho cùng một bản mã là thừa. Nghĩa là công cụ phải
rà đủ cả hai thứ trước khi trả `passed` — chuẩn kỹ thuật **và** bảy điều cấm.

Gọi trên bài không ở trạng thái chờ rà → `409`.

---

## 7. Mã lỗi

| Mã | Nghĩa |
|---|---|
| `401` | Thiếu hoặc sai `X-API-Key` |
| `400` | Tham số hoặc thân request sai định dạng |
| `404` | `submissionId` không tồn tại |
| `409` | Trạng thái không cho phép thao tác (vd rà lại một bài không đang chờ rà) |
| `422` | Bộ điểm không khớp barem (thiếu mục, thừa khoá, vượt trần) |

---

## 8. Vòng làm việc đề xuất

```
1. GET  /api/integrations/submissions?phase=1&scored=false
2. với mỗi bài:
     GET  /api/integrations/submissions/{id}      → đọc PRD
     chấm
     POST /api/integrations/scores                → trả điểm Phase 1
3. lặp lại với phase=2, đọc thêm repo và sản phẩm chạy thật
4. tuỳ chọn: POST /api/integrations/security      → kết quả rà bảy điều cấm

5. vòng rà lại — chạy CÙNG NHỊP với các bước trên:
     GET  /api/integrations/recheck                → bài vừa bị trả về, chờ rà bản sửa
     rà chuẩn kỹ thuật + bảy điều cấm (không chấm điểm)
     POST /api/integrations/recheck                → passed | failed + lý do
```

Chạy theo lịch (vd mỗi giờ) là đủ — app không gửi webhook khi có bài mới.

---

## 9. Chưa chốt

- **Giới hạn tần suất gọi**: hiện chưa có. Cần thì báo để bổ sung trước khi vào thi thật.
- **Webhook báo bài mới**: chưa có, công cụ tự hỏi theo lịch.
- **Điểm lan tỏa Phase 3**: hiện BTC nhập tay, chưa mở API (mục 1).
