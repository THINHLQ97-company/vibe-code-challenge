# vays-portable — DESIGN.md

> Design system **riêng của dự án này**. Kế thừa [`factory/DESIGN.md`](../DESIGN.md).
> Sinh **08/09/2026** từ dependency đo được trong repo.

## 1. Hệ đang dùng (đo thật)

Dependency dò được trong repo: **Next Tailwind**

- **Tailwind** — utility CSS. ⚠️ Tailwind KHÔNG phải design system: nó không ép nhất quán. Màu/khoảng cách vẫn phải đi qua token, đừng dùng số thô kiểu `p-[13px]`.
- **Next.js** — dùng được Astryx.

### Chưa có tài liệu design riêng trong repo

Màn hình mới thì bám [`factory/DESIGN.md`](../DESIGN.md) và token của
`factory/design-system-ap/`.

## 2. Luật cứng

- ❌ **Không hex/px thô.** Mọi màu, khoảng cách, bo góc, đổ bóng đi qua token.
- ❌ **Không tự chế wording.** Câu từ hiển thị thuộc quyền BA — DEV đặt biến i18n và áp đề xuất
  của BA (xem [`factory/RULES.md`](../RULES.md) mục M).
- ✅ **Mockup trước, code sau.** Màn hình mới phải có mockup kèm **empty state** và **error state**
  trước khi dựng. Dùng `/mockup` — mỗi màn một tệp `screens/<id>.html`, không gộp.
- ✅ **Responsive** mobile / tablet / desktop, không phải chỉ desktop.

## 3. Tra cứu — đừng đoán API component

```bash
node ../design-system-ap/cli/ds.mjs find <từ khoá>   # cần màu/khoảng cách này thì token nào
node ../design-system-ap/cli/ds.mjs explain <token>  # token này tham chiếu tới đâu
```
Cần style/palette/font-pairing/UX guideline: dùng skill `/ui-ux-pro-max`.
Dựng UI production-grade (tránh "AI-generic"): `/mb-frontend`.

Catalog tham khảo: `factory/open-design/design-systems/` (153 hệ: Apple, IBM, Atlassian, Linear,
Vercel…). Để **trích ý tưởng/pattern**, ❌ không import trực tiếp vào sản phẩm.

## 4. Trước khi báo xong một màn hình

1. Token — không còn giá trị thô
2. Empty · error · loading state có thật (không phải màn trắng)
3. Responsive 3 cỡ
4. Wording đã qua BA
5. Cổng UI của dự án xanh (xem [`RULES.md`](RULES.md) mục 3)

## 5. CHƯA XÁC ĐỊNH — người phụ trách điền

- [ ] Dự án bám hệ nào là chính thức (AP · Astryx · hệ riêng)?
- [ ] Token nguồn ở đâu, ai được sửa?
- [ ] Có nợ thiết kế nào đang khai không?
