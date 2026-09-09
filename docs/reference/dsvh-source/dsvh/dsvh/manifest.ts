/**
 * DSVH — manifest của design system, SỞ HỮU BỞI REPO NÀY.
 *
 * Trước đây `src/components/dsvh/**` chỉ là bản port của projects/vibe-host-ui, không có nguồn
 * chân lý riêng → mỗi lần sửa phải nhớ đồng bộ tay nhiều nơi và thực tế ĐÃ lệch (bug Switch
 * 04–05/08 phải sửa 2 lượt). Từ nay vays-panel tự chủ: file này là hợp đồng.
 *
 * LUẬT NỀN: **component không có mặt trong `dsComponents` = không tồn tại.**
 * `npm run ds:check` fail nếu manifest ↔ file thật lệch nhau, nên không thể thêm/xoá component
 * mà quên khai báo. Trang `/dsvh` cũng sinh từ chính file này → docs không thể lệch code.
 *
 * Sửa component → cập nhật entry ở đây → `npm run ds:check`.
 */

export type ComponentEntry = {
  name: string;
  /** Nhóm trong IA tài liệu — giữ ĐÚNG 13 nhóm ngữ nghĩa của /dsvh gốc (Getting Started, Core
   *  Concepts, Foundations, Layout, Components, Forms, Overlays, Navigation, Feedback,
   *  Data Display, Deploy, Patterns, Guidelines). Trước đây gallery nhóm theo THƯ MỤC CODE nên
   *  người quen tra "Foundations"/"Layout"/"Charts" không tìm thấy — nhóm phải theo cách người
   *  dùng nghĩ, không theo cách file nằm trên đĩa. */
  group: string;
  /** đường dẫn import thật trong repo này */
  import: string;
  /** đường dẫn file, tương đối từ src/components/dsvh/ — ds:check đối chiếu file này có thật không */
  file: string;
  purpose: string;
  when: string;
  props?: { name: string; type: string; note?: string }[];
  /**
   * TRA NGƯỢC — "nhìn thấy gì trên màn thì là mục này", viết bằng từ đời thường tiếng Việt.
   *
   * Vì sao cần: tài liệu vốn viết bằng từ vựng của người ĐÃ BIẾT tên component, còn người đi tra thì
   * chưa biết — đó chính là lý do họ tra. Đo ngày 11/08: gõ "menu ba chấm", "phân trang", "ô tìm
   * kiếm" vào toàn bộ tài liệu đều KHÔNG ra gì, dù cả ba đều đã có component.
   *
   * Gate RECOGNISE ép mỗi mục có >=2 từ khoá VÀ mỗi từ khoá chỉ thuộc đúng MỘT mục. Luật thứ hai mới
   * là cái đáng giá: hai mục cùng nhận một từ nghĩa là chúng trùng vai, và phải phân định ngay tại đây.
   */
  looksLike?: string[];
  /**
   * RANH GIỚI với mục TRÙNG VAI — "hai thứ đều làm được, chọn cái nào".
   *
   * Đo ngày 11/08: chỉ 17/73 mục nêu được ranh giới với mục khác, và bốn cặp trùng vai rõ rệt
   * (StatCard↔StatTile, Select↔Combobox, Table↔trang Giải phẫu, Empty↔EmptyState) KHÔNG mục nào
   * nói chọn cái nào. Người dựng màn gặp hai đáp án thì chọn theo cảm tính, và hai màn cạnh nhau
   * ra hai kiểu — không phải vì ai ẩu, mà vì tài liệu không hề quyết.
   *
   * `useThisWhen` là điều kiện dùng CHÍNH MỤC NÀY (không phải mục kia) — đọc trên trang nào thì
   * câu đó nói về trang ấy. Gate PAIR ép ĐỐI XỨNG: A trỏ B thì B phải trỏ lại A, nếu không sẽ có
   * một phía biết đường sang phía kia còn phía kia thì không.
   */
  vs?: { name: string; useThisWhen: string }[];
  /**
   * MỤC LIÊN QUAN — láng giềng, không phải đối thủ.
   *
   * Khác `vs` ở chỗ đây không phải "chọn cái nào" mà là "cái này thường đi cùng cái kia". Đo ngày
   * 11/08: 18 mục không nối với BẤT KỲ mục nào — đọc xong một mục là cụt đường, trong khi việc thật
   * gần như luôn cần vài mục cạnh nhau (Table cần các ô của nó, AuthCard cần PinInput…).
   *
   * Gate LINK ép ĐỐI XỨNG và ép mọi mục phải với tới được từ ít nhất một hướng.
   */
  related?: string[];
  /**
   * MỤC CON của một component khác — hiện LỒNG dưới nó trong mục lục, không đứng ngang hàng.
   *
   * Vì sao cần: 14 ô bảng vào manifest thành 14 dòng phẳng nằm ngay trên `Table` trong mục lục, tên
   * na ná nhau. Chúng là BỘ PHẬN của `Table`, không phải 14 component ngang vai với nó — xếp ngang
   * hàng làm mục lục rối đúng cái mà trang này sinh ra để dẹp. Chủ dự án bắt đúng chỗ này.
   *
   * Mỗi mục con VẪN có trang riêng (`/dsvh/TableUsageCell`) — cái đổi là chỗ đứng trong mục lục và
   * cách nhóm trên trang cha, không phải khả năng tra.
   */
  partOf?: string;
  /** Nhóm chức năng trong lòng component cha — để trang cha xếp mục con theo VIỆC, không theo bảng chữ cái. */
  partCategory?: string;
};

export const dsRules: string[] = [
  "Token-only: KHÔNG hardcode hex. Dùng utility token (text-ink, bg-surface, border-stroke, text-orange…). Gate: npm run ds:check.",
  "DSVH là MẶC ĐỊNH cho mọi UI sản phẩm. shadcn/ui (src/components/ui/**) chỉ được dùng cho primitive DSVH chưa có — xem `shadcnBorrowed`.",
  "Mảng màu LIỀN rộng (pill, track, nền khối) phải dùng fill ĐẶC, KHÔNG alpha-blend: alpha lên nền trắng bị khử bão hoà về gần trắng. Alpha chỉ hợp cho chấm/viền nhỏ. (Bài học thật từ Switch onLabel/offLabel.)",
  "Status tone lấy từ một nguồn: @/components/dsvh/status.ts. success = teal, warning = amber (KHÔNG đỏ), error = đỏ đặc, info = neutral.",
  "Icon = Phosphor wrapper @/components/dsvh/icons. KHÔNG vẽ SVG tay. Ngoại lệ: logo hãng ở @/components/dsvh/brand-icons.",
  "Reuse trước, build sau. Có Card/Table/Modal/Select rồi thì dùng lại; chỉ tạo mới khi manifest không có.",
  "Delta màu: dương = text-teal, âm = text-orange.",
  "Chấm icon TRANG TRÍ để XÁM (`bg-stroke-soft text-ink-2`), không tô cam. Màu chỉ dùng khi mang NGHĨA trạng thái — đỏ cho hành động không hoàn tác, teal/amber cho status. Chấm cam cạnh một nút cam thì hai thứ tranh nhau sự chú ý, trong khi thứ đáng nhìn là cái nút. (Chủ dự án nêu 2 lần: /admin/templates 05/08, /profile 06/08.) Gate ACCENT canh luật này: mọi chỗ đặt `bg-orange/NN` cùng `text-orange` phải KHAI lý do bằng `ds-allow-accent: <vì sao>` ngay trên dòng đó, không khai thì mặc định là trang trí ⇒ xám. Vì sao phải có gate: luật này viết ra 05/08 mà tới 07/08 vẫn còn 12 chỗ tô cam ở 9 tệp — luật không có phép kiểm thì chỉ là trí nhớ của người vừa đọc nó.",
  "Bề rộng nội dung là của KHUNG ỨNG DỤNG (`max-w-[1600px]`), trang không tự ghim trần. Một trang gõ `max-w-7xl` thì hẹp hơn hàng xóm 320px — đứng một mình vẫn ổn, chuyển trang mới thấy giật (đúng lỗi ở /deploy và /databases/new, 07/08). Trần hẹp CHÍNH ĐÁNG vẫn có (một cột nhập liệu, một thẻ tiến trình canh giữa) thì khai `ds-allow-width: <vì sao hẹp>` ngay trên dòng. Gate WIDTHCAP kiểm.",
  "Dark/Light: component chỉ dùng semantic token nên tự đổi theo data-theme — nhưng LUÔN kiểm cả 2 theme.",
  "Nhãn NGẮN không bao giờ rớt dòng: Badge · Tag · StatusDot · Kbd · Button · Tabs · SegmentedControl · TableStatusCell đều `whitespace-nowrap`. (19/08/2026: tên cuối trước đây là `TableStatusBadge` — component đó bị gộp đi từ 11/08 nên luật trỏ vào khoảng không suốt 8 ngày, và bản kế nhiệm `TableStatusCell` thì thiếu hẳn `whitespace-nowrap`. Gate NOWRAP nay đọc chính danh sách này nên một cái tên chết cũng làm gate đỏ.) Chúng là NHÃN, không phải đoạn văn — rớt dòng là hỏng hình (pill cao gấp đôi, hàng bảng so le). Cần xuống dòng thì rút gọn CHỮ hoặc nới cột, đừng để nó tự vỡ.",
  "Font: MỘT font duy nhất — Inter, tự host qua next/font. KHÔNG `font-mono`: cần chữ số thẳng cột thì `tabular-nums`.",
  "Thang chữ: ĐÚNG 8 bậc CÓ TÊN — text-micro(10) · text-meta(11) · text-caption(12) · text-body(14) · text-title(16) · text-page(24) · text-kpi(28) · text-hero(34). KHÔNG dùng `text-[Npx]` tuỳ tiện, cũng KHÔNG dùng thang Tailwind gốc (text-xs/sm/base/lg/xl/2xl) — hai thang song song lại thành hai nguồn. Gate TYPESCALE chặn cả hai. (06/08: gom 1139 chỗ từ 23 cỡ về 8 bậc; 95 chỗ từng là cỡ NỬA PIXEL.)",
  "Trong MỘT HÀNG BẢNG chỉ có ĐÚNG BA vai chữ, không hơn: (1) CHÍNH — thứ người ta quét mắt tìm (tên, địa chỉ) = `text-body`; (2) PHỤ — bằng chứng đi kèm (chủ sở hữu, loại, chú thích) = `text-caption` + `text-ink-2`. NGÀY THÁNG thuộc vai CHÍNH (`text-body`, 08/08 — chủ dự án chốt): nó là thứ người ta quét mắt để so, không phải chú thích. Một GIÁ TRỊ bị cắt làm hai phần (vd 0/2) thì hai phần CÙNG cỡ, chỉ khác màu; (3) NHÃN — mọi `Badge` dùng CÙNG một `size`. KHÔNG dùng `text-meta`/`text-micro` trong ô bảng: chúng là cỡ cho chú thích ngoài luồng đọc, nhét vào bảng thì cùng một vai lại hai ba cỡ. Vì sao phải viết luật này ra: `Table` đã đặt sẵn `text-body` cho mọi ô, nhưng KHÔNG ai nói ô phụ dùng cỡ nào — nên mỗi bảng tự chọn, và ngày 08/08 đo được cùng một vai ra bốn cỡ khác nhau (10/11/12/14): cột \"Địa chỉ\" 14px ở /admin/deployments nhưng 12px ở /dashboard, huy hiệu \"Gói\" 10px trong khi huy hiệu \"Trạng thái\" 14px, ngay trên cùng một hàng. Thang 8 bậc ràng buộc TỪ VỰNG, luật này ràng buộc NGỮ PHÁP — thiếu nó thì ai cũng đúng luật mà bảng vẫn lệch. `density` KHÔNG đổi vai, chỉ đổi ĐỆM — nhưng nó CÓ hạ nền cỡ chữ: `compact` đặt nền ô = `text-caption`, `comfortable` = `text-body`. Nên bảng `compact` PHẢI khai `text-body` cho cột CHÍNH, nếu không mọi ô rơi về một cỡ và bảng không còn vai nào nổi lên. Đo 19/08: `node-health-table` là bảng compact duy nhất quên khai — tên node 12px đúng bằng dòng lý do ngay dưới nó. Gate TABLETYPE kiểm cả hai vế.",
  "BẬC ĐẬM cho CHỮ NHỎ: `orange-strong` · `teal-strong` (cùng khuôn `red-strong`/`amber-strong` đã có). Cam thương hiệu `#de4400` mang chữ TRẮNG chỉ đạt 4.26:1 và `text-teal` trên `bg-teal/12` chỉ đạt 2.69:1 — cả hai trượt WCAG AA 4.5 cho chữ thường. Lưu ý bẫy: 14px/600 KHÔNG tính là \"chữ lớn\" (ngưỡng nới 3:1 chỉ áp cho 18.66px đậm hoặc 24px thường), nên nút và badge đều phải đạt 4.5. Dùng bậc đậm cho: mảng ĐẶC mang chữ trắng (nút solid, Badge accent, track Switch bật) và CHỮ NHỎ màu trên nền sáng — kèm `dark:` lùi về bậc gốc vì theme tối nền đã tối. KHÔNG đổi `--color-orange`/`--color-teal`: bậc gốc giữ nguyên cho viền, icon, chấm và đường chart. Đo bằng `npm run ds:probe`; đợt 20/08/2026 hạ 85 lỗi tương phản xuống 0.",
  "GHI CHÚ TĨNH dùng `Note`, KHÔNG dùng `Alert` và KHÔNG tự gõ `<p className=\"flex items-start gap-2 rounded-lg border …\">`. Đếm 20/08/2026: khuôn đó viết tay ở 7 chỗ, lệch nhau cỡ icon (14↔16), cỡ chữ (caption↔body) và màu chữ (ink-2↔ink-3). Ranh giới với `Alert` là NGHĨA chứ không phải hình: `Alert` mang `role=\"alert\"` — vùng live ARIA, trình đọc màn hình NGẮT LỜI đọc ngay, đúng cho \"vừa có chuyện xảy ra\" và sai cho một câu vốn nằm đó từ đầu; nó cũng thuộc hệ trạng thái (luật 4) trong khi ghi chú không \"đang tốt\" hay \"đang hỏng\". Trạng thái vừa đổi / cần xử lý ⇒ `Alert`; giải thích luôn đúng ⇒ `Note`.",
  "Ô NHÃN + GIÁ TRỊ bên trong một thẻ dùng `InfoTile`, KHÔNG tự gõ `rounded-lg border border-stroke bg-surface-2 p-*`. Đếm 20/08/2026: khuôn đó viết tay ở 26 chỗ / 21 tệp, cùng hình dạng nhưng lệch nhau ở gần như mọi chi tiết đo được — nền `bg-surface-2` ↔ `bg-stroke-soft/40`, đệm `p-3` ↔ `px-3 py-2`, ô icon có/không khung, nhãn `text-caption text-ink-3` ↔ `text-body font-medium`. Đó là lý do các màn thông số trông \"mỗi nơi một kiểu\" dù không màn nào sai token. Chọn bố cục theo CÁCH ĐỌC: xếp lưới để so theo cột giữa nhiều thẻ ⇒ `stack`; một phép đo có mẫu số ⇒ `row` kèm thanh. KHÔNG nhét `StatCard` vào trong `Card` — đó là ô KPI cấp trang và tự bọc `Card`.",
  "KHÔNG có ảnh đại diện ⇒ vẽ LOGO Vibe Host, KHÔNG phải chữ viết tắt. `Avatar` của DSVH lo việc này (`fallback='logo'` mặc định) — nơi gọi không tự dựng avatar, không tự tính hai chữ cái. Luật chốt 06/08/2026 nhưng suốt 14 ngày chỉ áp cho NGƯỜI ĐANG ĐĂNG NHẬP: `shared/user-avatar.tsx` tự vẽ logo còn `Avatar` vẫn vẽ chữ cái, nên mọi bảng danh sách hiện chữ. Vì sao chữ viết tắt sai ở đây: nó TRÔNG như một dấu nhận diện nhưng không phân biệt được người — đo ngày 20/08 ở /admin/staff, \"Smoke Admin smoke-tokid\" và \"Smoke Admin settings\" đều ra \"SS\". Logo nói đúng một điều và nói thật: tài khoản này chưa đặt ảnh. Gate AVATARFALLBACK kiểm.",
  "LIÊN KẾT dùng token `link`/`link-hover` (xanh dương), KHÔNG `text-orange`. Cam là màu NHẤN của thương hiệu — dùng cho nút chính và điểm cần hút mắt; đem nó làm màu liên kết thì mọi tên dịch vụ trong bảng đều tranh sự chú ý ngang một nút CTA, và người đọc mất luôn dấu hiệu \"cái này bấm được\" vì cam ở khắp nơi. Token `link` thêm 13/08/2026 kèm lý do đo được: màu link mặc định của trình duyệt (#0072F5) chỉ đạt 4.44:1 trên nền trắng, TRƯỢT WCAG AA 4.5:1 cho chữ 14px; hệ chọn #0b6bcb (5.28:1). Trong BẢNG thì dùng thẳng `TableLinkCell`, đừng tự dựng `<a>`. Chốt 19/08/2026 — token nằm im 6 ngày không luật không gate, nên 15 chỗ vẫn tô cam. Gate LINKCOLOR kiểm.",
  "Tiêu đề bảng (`<thead>`) viết THƯỜNG, không `uppercase`. Chốt 19/08/2026 sau khi chủ dự án bắt được cùng một cột \"Gói\" hiện \"GÓI\" ở /admin/service-expiry (bảng DSVH, ép hoa) và \"Gói\" ở /admin/customers (bảng shadcn cũ, không ép). Bỏ hoa chứ không ép hoa nốt bên kia: tiếng Việt viết hoa toàn bộ mất dấu phụ ở một số mặt chữ và đọc chậm hơn, mà tiêu đề bảng là thứ người ta quét bằng mắt. Thứ bậc tiêu đề ↔ ô đã có `font-semibold` + `text-ink-2` lo. Áp cho mọi hàng tiêu đề cột, kể cả bảng dựng bằng grid (DNSRecordTable · KeyValueEditor · bảng KEY/VALUE ở env-vars) — và nhớ chữ hoa có thể nằm trong CHUỖI chứ không chỉ ở CSS.",
  "Thang chữ phải khai cho tailwind-merge ở CẢ HAI đường gộp class: `components/dsvh/tv.ts` (component DSVH) VÀ `lib/utils.ts` → `cn()` (component shadcn). Thang tự đặt không được nhận là cỡ chữ nên nó đè mất class MÀU — 06/08 vá `tv()` xong nút CTA của DSVH đúng nhưng nút \"Đăng nhập\" (shadcn, đi qua `cn()`) VẪN đen. Gate TVWRAP kiểm cả hai. Thêm bậc mới → khai cả hai chỗ.",
];

/**
 * Ranh giới shadcn/ui — quyết định 05/08.
 *
 * Repo có sẵn 55 component shadcn từ trước. Không migrate hết (rủi ro cao, lợi ích thấp), nhưng
 * cũng không để phình thêm. Cơ chế: **ratchet** trong `ds:check` —
 *  - `allowed`: primitive DSVH KHÔNG có → dùng thoải mái.
 *  - `duplicated`: đã có bản DSVH → import cũ được ân xá theo baseline, nhưng KHÔNG được tăng.
 *    Viết UI mới phải dùng bản DSVH. (Vd: 4 chỗ đang dùng `ui/switch` của shadcn nên KHÔNG nhận
 *    được bản vá Switch của DSVH — đúng loại lệch mà ranh giới này chặn.)
 */
export const shadcnBorrowed = {
  allowed: [
    /**
     * `collapsible` Ở LẠI ĐÂY — đã đối chiếu tận nơi ngày 13/08, không phải để sót.
     *
     * Tôi từng ghi trong ghi chú bàn giao rằng nó "cùng lỗi như alert-dialog" và cần chuyển sang
     * `duplicated` để đổi 6 chỗ ở `project-logs` sang `Accordion`. ĐỌC MÃ RỒI THÌ THẤY NGƯỢC LẠI:
     * `Accordion` của DSVH KHÔNG diễn đạt được ca này, và ép nó vào là làm hỏng màn hình —
     *
     *   · trạng thái mở giữ bằng `useState` NỘI BỘ, không có `open`/`onOpenChange`. Mà 3/9 chỗ dùng
     *     collapsible trong app phải tự mở nhóm đang chạy / vừa hỏng — đó là điều khiển từ ngoài.
     *   · tiêu đề bị bọc trong `<span className="truncate">`. Đầu nhóm ở `project-logs` là icon xoay
     *     + tên + huy hiệu trạng thái + "3/3 bước" + đồng hồ — truncate cắt cụt còn một dòng chữ.
     *   · luôn tự vẽ chevron ⇒ thành HAI mũi tên, vì đầu nhóm đã có caret riêng.
     *   · ép khung thân `border-t bg-surface-2 px-4 py-3 text-body text-ink-2`, chồng lên khung
     *     riêng của từng nhóm.
     *
     * Nói gọn: `Accordion` là mục đóng-mở có sẵn bộ áo; `collapsible` là CƠ CẤU đóng-mở trần để màn
     * hình tự mặc áo. Hai vai khác nhau, không phải hai bản của một thứ. Muốn gộp thì phải mở rộng
     * `Accordion` cho chế độ điều khiển ngoài + bỏ được chevron/khung — chưa ai cần tới mức đó.
     */
    "label", "chart", "collapsible", "tooltip",
    "toggle", "sonner", "sheet",     "aspect-ratio", "calendar", "carousel", "context-menu", "field", "form", "hover-card", "input-group", "input-otp", "item",
    "button-group", "direction", ],
  /** shadcn trùng chức năng với DSVH → dùng bản DSVH cho code mới */
  duplicated: {
    /* 11/08: chuyển từ `allowed` sang đây. `ConfirmDialog` của DSVH đã có và làm đúng việc
       này; `alert-dialog` nằm ở nhóm "mượn thoải mái" chỉ vì lúc gieo danh sách chưa ai đối chiếu.
       Nay 0 chỗ dùng, nên ngưỡng 0 = CẤM TUYỆT ĐỐI ngay từ bây giờ. */
    "alert-dialog": "ConfirmDialog (@/components/dsvh/ui/overlay/ConfirmDialog)",
    button: "@/components/dsvh/ui/Button",
    card: "@/components/dsvh/ui/Card",
    skeleton: "@/components/dsvh/ui/nav/Skeleton",
    input: "@/components/dsvh/ui/Input",
    badge: "@/components/dsvh/ui/Badge",
    dialog: "@/components/dsvh/ui/overlay/Modal",
    select: "@/components/dsvh/ui/form/Select",
    table: "@/components/dsvh/ui/Table",
    progress: "@/components/dsvh/ui/Progress",
    textarea: "@/components/dsvh/ui/form/Textarea",
    switch: "@/components/dsvh/ui/form/Switch",
    tabs: "@/components/dsvh/ui/nav/Tabs",
    slider: "@/components/dsvh/ui/form/Slider",
    avatar: "@/components/dsvh/ui/data/Avatar",
    "checkbox": "@/components/dsvh/ui/form/Checkbox",
    "radio-group": "@/components/dsvh/ui/form/RadioGroup",
    "alert": "@/components/dsvh/ui/overlay/Alert",
    "separator": "@/components/dsvh/ui/data/Separator",
    "popover": "@/components/dsvh/ui/overlay/Popover",
    "command": "@/components/dsvh/ui/overlay/Command",
    "drawer": "@/components/dsvh/ui/overlay/Drawer",
    "breadcrumb": "@/components/dsvh/ui/nav/Breadcrumb",
    "kbd": "@/components/dsvh/ui/data/Kbd",
    "empty": "@/components/dsvh/ui/data/Empty",
  } as Record<string, string>,
};

export type Gap = {
  /** thứ UI cần mà DSVH chưa có */
  need: string;
  /** phát hiện ở đâu, đang tạm xoay xở bằng gì */
  context: string;
  /** open = chờ quyết · planned = đã chốt, chờ dựng · borrowed = cố ý mượn lâu dài, không dựng */
  status: "open" | "planned" | "borrowed";
  note?: string;
};

/**
 * DANH SÁCH PHÉP KIỂM của `npm run ds:check`.
 *
 * Vì sao khai ở đây thay vì đếm bằng mắt: `/dsvh` từng ghi thẳng con số "17 phép kiểm" vào JSX. Số
 * gõ tay thì lần thêm gate nào cũng phải nhớ sửa hai chỗ — mà cả trang này tồn tại chính vì "phải
 * nhớ" là thứ không đáng tin. Nay danh sách nằm trong manifest, trang đọc `dsGates.length`, và
 * chính `ds:check` đối chiếu hai chiều: khai ở đây mà script không phát nhãn đó → lỗi; script phát
 * một nhãn chưa khai ở đây → cũng lỗi.
 */
/**
 * CÔNG THỨC GHÉP CỤM — tầng còn thiếu giữa TOKEN và COMPONENT.
 *
 * Đo ngày 11/08 bằng cách thử dựng lại `/admin/dashboard` chỉ bằng tài liệu: tách được 10 cụm, tra
 * ra 4 cụm có component, 2 cụm có HAI đáp án, và 4 cụm — dải trạng thái dính, danh sách việc cần
 * xử lý, hộp "đáng chú ý", thông báo ngưỡng — KHÔNG có gì cả. Không có gì, và cũng không có tài
 * liệu nào chỉ ghép từ đâu. Đến chỗ đó thì người dựng màn chỉ còn một đường: tự chế. Rồi màn sau
 * lại chế một kiểu khác.
 *
 * Danh mục component trả lời "có những viên gạch nào". Công thức trả lời "cụm này xây thế nào" —
 * và phần lớn thứ trên một màn thật là CỤM, không phải một component đơn lẻ.
 *
 * Mọi công thức đều RÚT TỪ MÀN ĐANG CHẠY THẬT (`seenOn` ghi rõ màn nào). Công thức nghĩ ra trong
 * đầu thì không ai dùng, vì nó không giải quyết ca thật nào.
 */
export type Recipe = {
  /** slug — cũng là địa chỉ /dsvh/<id>; gate RECIPE kiểm không đụng tên component hay tài liệu nền */
  id: string;
  title: string;
  /** tra ngược, cùng luật với `looksLike` của component: mỗi từ khoá chỉ thuộc đúng một mục */
  looksLike: string[];
  /** màn ĐANG CHẠY THẬT mà công thức này rút ra từ đó */
  seenOn: string;
  /** component DSVH dùng để ghép; rỗng = ghép thẳng từ token (hiếm, phải nói rõ lý do trong `rules`) */
  builtFrom: string[];
  /** các bước ghép, theo đúng thứ tự dựng */
  steps: string[];
  /** luật riêng của cụm — thứ hay bị làm sai nhất khi tự chế lại */
  rules: string[];
};

export const dsRecipes: Recipe[] = [
  {
    id: "the-bieu-do",
    title: "Thẻ biểu đồ",
    // Từ khoá KHÔNG được trùng/chồng với entry "Chart kit" (gate RECOGNISE chặn): kit trả lời "vẽ
    // bằng gì", recipe này trả lời "dựng cả cái thẻ ra sao". Nên tránh mọi biến thể của "biểu đồ"
    // và "đồ thị" đứng một mình.
    looksLike: ["chart card", "thẻ thống kê theo ngày", "khối số liệu có trục"],
    seenOn:
      "BẢN MẪU CHẠY THẬT: `/dsvh/patterns-dashboard` và `/dsvh/charts` — cùng render `ChartsDemo` trong `demos.tsx`. Dùng thật: /admin/reports (4 thẻ).",
    builtFrom: ["Card / CardHeader", "Chart kit (C / gridProps / cursorLine / TooltipCard / chartTooltip / pieTooltip / axisTick)", "LegendDot", "Empty", "Skeleton"],
    steps: [
      "MỞ `/dsvh/patterns-dashboard` TRƯỚC KHI VIẾT DÒNG NÀO — `ChartsDemo` là bản mẫu chạy được, không phải ảnh chụp.",
      "`Card` + `CardHeader` (title + subtitle nói rõ số này đếm theo gì).",
      "Chú giải `LegendDot` đặt TRÊN biểu đồ, không phải dưới.",
      "Bọc `<ResponsiveContainer>` trong một div CÓ CHIỀU CAO CỐ ĐỊNH + `chartFrame` — thiếu `chartFrame` là lưới sẽ gần trắng ở theme tối.",
      "Lưới `{...gridProps}` · trục `tick={axisTick}` · tooltip `content={chartTooltip(SERIES)}` · cursor `cursorBar` (chart có cột) hoặc `cursorLine` (chỉ đường/vùng).",
      "Khai `SERIES` MỘT chỗ rồi dùng cho cả chú giải lẫn tooltip — hai nơi khai riêng là hai nơi để lệch nhãn.",
      "Không có dữ liệu thì `Empty`, KHÔNG vẽ biểu đồ phẳng bằng 0. Đang nạp thì `Skeleton` đúng chiều cao biểu đồ.",
    ],
    rules: [
      "MÀU LẤY TỪ `C`, không đặt màu rời và cũng không khai biến CSS riêng cho biểu đồ. Bài học 14/08/2026: /admin/reports từng khai `--report-ok|failed|pending` riêng — đúng token nhưng NẰM NGOÀI tầm canh của gate `CHARTKIT`, nên nửa palette biểu đồ không ai đối chiếu.",
      "`C` là palette của theme SÁNG (viết cứng vì Recharts không nhận `var()`). Mọi thứ phụ thuộc theme — lưới, chữ trục, cursor — phải đi qua `chartFrame`, không qua `C`.",
      "Một biểu đồ hai trục thì hai dãy CÙNG MÀU, phân biệt bằng HÌNH DẠNG, và nhãn phải ghi '(trái)/(phải)'. Hai màu là mời người đọc so chiều cao giữa hai thang khác nhau.",
    ],
  },
  {
    id: "hang-kpi",
    title: "Hàng số liệu tóm tắt đầu trang",
    looksLike: ["hàng số liệu dưới tiêu đề", "dãy ô kpi ngang"],
    seenOn: "/dashboard · /admin/dashboard",
    builtFrom: ["PageHeader", "StatCard", "CountUp", "Skeleton"],
    steps: [
      "Đặt NGAY dưới `PageHeader`, trước mọi khối khác.",
      "Lưới `grid gap-4 sm:grid-cols-2 xl:grid-cols-4` — bốn ô là trần, nhiều hơn thì không ai đọc hết.",
      "Mỗi ô một `StatCard`; số cần gây chú ý thì bọc `CountUp`.",
      "Lúc đang nạp: `StatCard` có sẵn `loading` giữ NGUYÊN chiều cao — đừng thay bằng `Skeleton` rời, trang sẽ nhảy khi dữ liệu về.",
    ],
    rules: [
      "Ô KPI KHÔNG bấm được. Cần đi tiếp thì để liên kết trong khối nội dung bên dưới, đừng biến cả ô thành nút — người dùng bấm nhầm khi chỉ định đọc số.",
      "Mỗi ô đúng MỘT con số. Nhét hai số vào một ô là lúc người đọc phải đoán số nào mới là số chính.",
    ],
  },
  {
    id: "dai-trang-thai",
    title: "Dải trạng thái dính",
    looksLike: ["dải trạng thái", "thanh mỏng dính trên đầu nội dung"],
    seenOn: "/admin/dashboard — khối ① `status-bar.tsx`",
    builtFrom: ["Badge", "Tooltip", "Skeleton"],
    steps: [
      "`sticky top-14 z-[5]` — `top-14` đúng bằng chiều cao thanh đầu trang của khuôn `(app)`, `z` THẤP hơn `z-10` của thanh ấy để không bao giờ đè lên.",
      "Bên trong là các cặp nhãn–giá trị: nhãn `text-caption text-ink-2`, giá trị `font-semibold tabular-nums`.",
      "Giá trị vượt ngưỡng đổi màu bằng token trạng thái (`text-amber-strong` / `text-red`), KHÔNG đổi cỡ chữ.",
      "Số lấy mẫu định kỳ thì phải kèm mốc thời gian và dấu hiệu 'số đã cũ' — dùng `Tooltip` cho phần giải thích, đừng nhồi chữ vào dải.",
    ],
    rules: [
      "Chỉ chứa thứ trả lời câu 'hệ còn sống không' — đổi theo PHÚT. Số kinh doanh đổi theo NGÀY thuộc về hàng KPI. Một con số nằm ở cả hai chỗ là hai chỗ để lệch nhau.",
      "Dính được thì phải MỎNG. Cuộn tới cuối trang mà dải chiếm 1/5 màn thì nó thành vật cản, không phải chỗ dựa.",
    ],
  },
  {
    id: "danh-sach-viec",
    title: "Danh sách việc cần xử lý",
    looksLike: ["danh sách việc cần làm", "khối cần xử lý hôm nay"],
    seenOn: "/admin/dashboard — khối ④ `action-list.tsx`",
    builtFrom: ["Card / CardHeader", "Table", "Badge", "Button", "Empty", "TableActionsCell"],
    steps: [
      "`Card` + `CardHeader` có `subtitle` đếm số việc đang mở.",
      "Bên trong là `Table` — mỗi dòng một VIỆC: mức độ (`Badge`) · mô tả · thời điểm · nút xử lý.",
      "Mức độ do dữ liệu quyết (`severity` từ service), component chỉ ánh xạ sang tone `Badge` — không tự tính màu, không tự sắp xếp lại.",
      "Hết việc thì dùng `Empty` kèm một câu xác nhận là ổn, KHÔNG để khối trắng.",
    ],
    rules: [
      "Việc ĐÃ xử lý ở lại danh sách và đổi sang trạng thái 'đã nhận', không biến mất — người trực ca sau phải thấy được ai đã làm gì.",
      "Đây là danh sách VIỆC, không phải danh sách SỐ: đặt TRƯỚC hàng KPI trên màn trực ban.",
    ],
  },
  {
    id: "chu-giai-vi-so",
    title: "Hộp chú giải “vì sao số này như vậy”",
    looksLike: ["hộp đáng chú ý", "dòng giải thích cạnh số liệu"],
    seenOn: "/admin/dashboard — `why-note.tsx`, dùng dưới hầu hết các khối",
    builtFrom: [],
    steps: [
      "Khung `rounded-lg border border-stroke bg-stroke-soft/40 p-3 text-caption`.",
      "Lưới `sm:grid-cols-[180px_1fr]`: nhãn ngắn in đậm bên trái, diễn giải bên phải.",
      "Đặt NGAY dưới khối mà nó giải thích, không gom hết xuống cuối trang.",
    ],
    rules: [
      "CỐ Ý không dùng `Alert`. `Alert` mang nghĩa CẢNH BÁO (có vai trò ARIA, có màu trạng thái), còn hộp này là CHÚ GIẢI TRUNG TÍNH — phần lớn lần dùng là để nói 'số này bình thường, đây là lý do'. Mượn `Alert` cho việc đó là dạy người đọc bỏ qua `Alert` thật ở chỗ khác.",
      "Ghép thẳng từ token vì nó không có trạng thái, không có tương tác — dựng thành component chỉ thêm một lớp trung gian mà không thêm ràng buộc nào.",
    ],
  },
  {
    id: "trang-danh-sach",
    title: "Trang danh sách (khuôn chuẩn)",
    looksLike: ["màn danh sách có lọc", "trang liệt kê bản ghi"],
    seenOn: "/admin/customers · /admin/templates · /admin/audit",
    builtFrom: ["PageShell", "PageHeader", "Card / CardHeader", "TableToolbar", "Table", "Empty", "Pagination", "Skeleton"],
    steps: [
      "`PageShell` bọc ngoài — KHÔNG tự gõ lớp đệm (gate PAGESHELL chặn).",
      "`PageHeader`: tên màn + nút hành động chính bên phải.",
      "`TableToolbar`: tìm kiếm + bộ lọc + thao tác hàng loạt khi có dòng được chọn.",
      "`Card` + `CardHeader` bọc thanh lọc và bảng: tiêu đề danh sách + số bản ghi ở dòng phụ. THÊM 20/08/2026 — trước đó công thức liệt kê thiếu, và đúng hai màn trôi ra ngoài (/admin/backups, /admin/ai-rules): bảng nằm trần, hàng tiêu đề sát mép trang. Không phải chuyện số đông: chân phân trang của `Table` bo `rounded-b-xl border-t`, nó được thiết kế làm mép dưới của một khung bo góc.",
      "`Table` với ô lấy từ bộ ô dựng sẵn — xem trang Giải phẫu một bảng.",
      "Không có dữ liệu → `Empty` kèm hành động; đang nạp → `Table` có `loading` (skeleton dòng), không phải `Spinner` giữa màn.",
      "`pagination` của chính `Table`, không dựng thanh phân trang riêng bên ngoài.",
    ],
    rules: [
      "Trạng thái rỗng phải phân biệt CHƯA CÓ GÌ với BỘ LỌC KHÔNG KHỚP — hai câu khác nhau và hai hành động khác nhau (tạo mới ↔ xoá bộ lọc).",
      "Cột thao tác dùng MỘT menu ba chấm, không phải ba nút icon.",
    ],
  },
  {
    id: "trang-chi-tiet-tab",
    title: "Trang chi tiết chia tab",
    looksLike: ["màn chi tiết một bản ghi", "trang có tab tổng quan cấu hình"],
    seenOn: "/project/[id]",
    builtFrom: ["PageShell", "PageHeader", "Breadcrumb", "Tabs", "TabsNav", "Card / CardHeader", "DangerZone"],
    steps: [
      "`PageShell` + `PageHeader` (kèm `Breadcrumb` khi màn nằm sâu từ 3 tầng).",
      "Chia tab: đổi view tại chỗ dùng `Tabs`; mỗi tab là một MÀN cần gửi link được thì dùng `TabsNav`.",
      "Nhãn tab = icon TRƯỚC text; bỏ icon chỉ khi nhãn đã tự đủ rõ.",
      "Nội dung mỗi tab xếp bằng `Card`, mỗi thẻ một chủ đề.",
      "`DangerZone` đặt CUỐI tab Cài đặt, sau mọi khối thường.",
    ],
    rules: [
      "Tab đầu tiên phải trả lời được câu 'cái này đang thế nào' mà không cần bấm thêm.",
      "Không quá 5 tab. Nhiều hơn nghĩa là màn này đang gánh hai việc khác nhau, tách trang.",
    ],
  },
  {
    id: "luong-tao-moi",
    title: "Luồng tạo mới nhiều bước",
    looksLike: ["màn tạo mới qua nhiều bước", "wizard triển khai"],
    seenOn: "/deploy · /databases/new",
    builtFrom: ["PageShell", "Stepper", "FormField", "Input", "Select", "Button", "Alert", "ConfirmDialog"],
    steps: [
      "`Stepper` ở đầu, hiện đủ các bước ngay từ bước 1 — người dùng phải biết còn bao xa.",
      "Mỗi trường bọc `FormField` (nhãn · chỉ dẫn · lỗi · dấu bắt buộc), không tự gõ nhãn rời.",
      "Panel tóm tắt bên phải cập nhật theo từng lựa chọn — cùng khuôn cho mọi luồng tạo mới.",
      "Lỗi cấp bước dùng `Alert` tại chỗ; hành động không hoàn tác dùng `ConfirmDialog`.",
      "Bước cuối thất bại: chỉ icon + câu thông báo + MỘT lối thoát. Không đổ log, không ba nút.",
    ],
    rules: [
      "Không cho sang bước sau khi bước hiện tại chưa hợp lệ — chặn ở nút, và nói rõ còn thiếu gì.",
      "Giá trị đã nhập phải sống sót khi quay lại bước trước.",
    ],
  },
  {
    id: "the-co-hanh-dong",
    title: "Thẻ có tiêu đề và hành động",
    looksLike: ["thẻ có nút ở góc phải", "khối có tiêu đề kèm thao tác"],
    seenOn: "khắp /dashboard và /admin/*",
    builtFrom: ["Card / CardHeader", "Button", "KebabButton / IconGhostButton / TileKebabDropdown", "PeriodPill"],
    steps: [
      "`CardHeader` nhận `title`, `subtitle`, `icon`, `action` — đừng tự gõ hàng tiêu đề bằng `div` + `flex justify-between`.",
      "`action`: một hành động chính thì để `Button` size sm; từ hai trở lên thì gộp vào menu ba chấm của thẻ.",
      "Bộ chọn kỳ thời gian dùng `PeriodPill`, đặt trong `action`.",
    ],
    rules: [
      "Chấm icon ở đầu thẻ giữ TRUNG TÍNH (`bg-stroke-soft text-ink-2`) — chỉ tô màu khi icon mang nghĩa trạng thái.",
      "Thẻ trong cùng một lưới phải cao bằng nhau: `Card` đã có `h-full`, đừng gỡ.",
    ],
  },
];

export const dsGates: { id: string; blocks: string }[] = [
  { id: "TOKEN", blocks: "hex tự chế trong toàn bộ code UI" },
  { id: "NGAYTHANG", blocks: "tự định dạng ngày/giờ ngoài `lib/datetime.ts` — app từng có BẢY kiểu ngày" },
  { id: "SRCAPTION", blocks: "`<caption className=\"sr-only\">` — Chromium neo caption tuyệt đối vào `<html>` nên nó thoát khung cuộn và kéo dài chiều cao tài liệu (đo 27/08: dôi 868px, sinh thanh cuộn cửa sổ thứ hai + mảng trắng dưới đáy)" },
  { id: "FRAMENEST", blocks: "`List` bản có khung đặt trong `Card` — khung lồng khung" },
  { id: "THEADCASE", blocks: "tiêu đề bảng ép `uppercase` — tiêu đề bảng viết thường" },
  { id: "SHELLCOPY", blocks: "chép tay `space-y-6 p-4 md:p-5 lg:p-6` thay vì dùng `PageShell`" },
  { id: "AVATARFALLBACK", blocks: "nơi viết màn hình tự tính chữ viết tắt thay vì dùng `Avatar` (không ảnh ⇒ logo)" },
  { id: "LINKCOLOR", blocks: "thẻ liên kết tô `text-orange` thay vì token `link` xanh dương" },
  { id: "NOWRAP", blocks: "component nhãn (luật 11) thiếu `whitespace-nowrap`, hoặc luật gọi tên component không còn tồn tại" },
  { id: "TOKENSDOC", blocks: "token có trong CSS nhưng thiếu trong tài liệu (và ngược lại)" },
  { id: "TOKENMIX", blocks: "cỡ chữ ngoài thang 8 bậc · token gắn đuôi `-foreground` không tồn tại" },
  { id: "MANIFEST", blocks: "manifest ↔ file/export thật lệch nhau" },
  { id: "VARIANT", blocks: "code có variant mà manifest không kể" },
  { id: "PROPS", blocks: "manifest khai prop mà code không có" },
  { id: "REIMPL", blocks: "dựng lại thứ DSVH đã có — element thô (button/select/textarea/table) VÀ đồ nhái ghép từ linh kiện hợp lệ (đường kẻ tự vẽ bằng `<div border-t>` → Separator · CopyButton tự dựng → CopyButton). Kèm mức GỢI Ý không chặn cho hai hình dạng chưa đủ chắc: dải nút solid/ghost → SegmentedControl, khối viền bo có đệm → Card" },
  { id: "TVWRAP", blocks: "component DSVH không đi qua `tv()` nên `cn()` gộp lớp sai" },
  { id: "RATCHET", blocks: "import shadcn trùng chức năng DSVH vượt baseline" },
  { id: "CHARTKIT", blocks: "chart đặt màu rời thay vì dùng palette `C` của kit" },
  { id: "PAGESHELL", blocks: "trang render PageHeader mà không có khung/đệm ngoài" },
  { id: "ACCENT", blocks: "tô cam cho thứ TRANG TRÍ (chỉ trạng thái mới được mang màu)" },
  { id: "WIDTHCAP", blocks: "chặn bề ngang cấp trang mà không khai lý do" },
  { id: "FIELDCLS", blocks: "lớp đệm/chiều cao truyền qua className của Input/Select/Textarea — rơi vào div gốc, đẩy ô nhập đi" },
  { id: "INVERTPAIR", blocks: "nền `bg-ink` đảo theo theme mà chữ ghim `text-white/black` — hỏng ở theme tối" },
  { id: "IMPORTPATH", blocks: "import `@/…` trỏ tới tệp không có thật — trang 500 lúc chạy dù tsc báo xanh" },
  { id: "DEMOEMPTY", blocks: "demo chỉ in chữ, không dựng component nào" },
  { id: "DEMODUP", blocks: "một khoá demo nhúng ở nhiều mục tài liệu — nhiều trang cùng trả lời một câu hỏi" },
  { id: "RECOGNISE", blocks: "mục không tra ngược được, hoặc hai mục cùng nhận một từ khoá" },
  { id: "LINK", blocks: "mục đứng một mình, nối một chiều, hoặc tài liệu nền không dẫn tới component nào" },
  { id: "PART", blocks: "mục con trỏ vào cha không có thật, hoặc thiếu nhóm chức năng" },
  { id: "RECIPE", blocks: "công thức ghép cụm trỏ vào component không có thật, thiếu bước, hoặc trùng địa chỉ" },
  { id: "PAIR", blocks: "cặp trùng vai khai ranh giới một chiều, hoặc trỏ vào mục không tồn tại" },
  { id: "CELLDOC", blocks: "ô bảng lệch nhau giữa code · manifest · trang giải phẫu" },
  { id: "TABLETYPE", blocks: "dùng `text-meta`/`text-micro` trong ô bảng, phá ba vai chữ" },
  { id: "ESCSTACK", blocks: "lớp phủ đóng theo Esc mà không hỏi sổ `overlay-stack` — hai lớp mở thì một lần Esc đóng cả hai; ratchet, danh sách chưa chuyển chỉ được ngắn đi" },
];

/**
 * SỔ THIẾU — vế "thiếu" của luồng thiết kế.
 *
 * Khi làm một màn hình mà DSVH chưa có thứ cần dùng, đường dễ nhất là dựng lén một bản trong
 * module — và nó KHÔNG BAO GIỜ quay lại design system. Gate `REIMPL` chặn việc dựng lén; sổ này
 * là lối thoát hợp lệ: **ghi vào đây thay vì dựng lén**, `ds:check` in ra mỗi lần chạy nên không
 * chìm xuồng, và `/dsvh` hiện cho người xem.
 *
 * Gieo lần đầu 05/08/2026 bằng số đo thật: các primitive đang phải mượn shadcn vì DSVH chưa có.
 * `borrowed` không phải nợ — là quyết định "mượn lâu dài, không dựng bản DSVH".
 */
export const dsGaps: Gap[] = [
  {
    need: "HAI thanh phân trang cùng sống — `Pagination` (chuẩn) và `TablePagination` (riêng trong Table.tsx)",
    context:
      "Phát hiện 20/08/2026 khi bật phân trang cho /admin/dashboard. `Pagination` của DSVH (qua `shared/AppPagination`) là bản 10+ màn đang dùng: dãy SỐ TRANG có rút gọn \"…\", câu \"Hiển thị 1–10 / 111 mục\". `TablePagination` thì nằm ẩn trong `Table.tsx`, lộ ra qua prop `pagination`, và vẽ hình dạng KHÁC HẲN: \"Trang x / y\" + hai mũi tên + ô chọn cỡ trang. Nó có 0 nơi dùng nên không ai thấy sự lệch — cho tới khi có người dùng nó và cả một module lệch khỏi phần còn lại của app.\n\nĐúng lớp lỗi mà `Empty` ↔ `TableEmptyState` vừa phải gộp (19/08): một component dùng chung mọc thêm bản thứ hai BÊN TRONG một component khác, nơi `ds:find` không chỉ tới và trang /dsvh không liệt kê. Chưa gộp ngay vì phải chốt trước: `Table` có nên tự vẽ thanh phân trang không, hay luôn để nơi gọi đặt `AppPagination` bên dưới (khi ấy gỡ hẳn prop `pagination` và sửa cả `TablePagination` lẫn kiểu `PaginationConfig`). Trước mắt: prop `pagination` đã ghi cảnh báo tại chỗ.",
    status: "open",
  },
  {
    need: "Bản đồ nhiệt (lưới giá trị + thang màu tuần tự + chú giải) — DSVH chưa có",
    context:
      "Phát hiện 19/08/2026 khi dựng 'Bản đồ nhiệt giờ × thứ' cho /admin/dashboard. `ds:find \"bản đồ nhiệt\"` không ra gì; chart kit chỉ phục vụ Recharts (SVG), mà lưới nhiệt dựng bằng CSS grid + token thì ĐÚNG HƠN — nó tự đổi theo theme, còn `C` là hex theme sáng viết cứng. CỐ Ý chưa đưa vào DSVH: đây là bản đồ nhiệt DUY NHẤT của app và trục của nó là nghiệp vụ (giờ × thứ), nên chưa biết hợp đồng chung nên trông thế nào — thang màu mấy bậc, chú giải đặt đâu, nhãn trục do ai truyền, phân biệt 'chưa đo được' với 'đã đo bằng 0' ra sao. Dựng vội một API chung từ MỘT nơi dùng là cách chắc chắn nhất để có một component chỉ vừa với chính nó. Khi xuất hiện cái thứ hai (ví dụ nhiệt theo node × ngày) thì gom vào DSVH và mang theo bốn quyết định trên. Bản đang dùng: `components/modules/admin-dashboard/error-heatmap.tsx` — token-only, fill ĐẶC theo luật 4 (ô nhiệt là mảng màu liền, alpha lên nền trắng sẽ khử bão hoà thành gần trắng).",
    status: "open",
  },
  {
    need: "`DropdownMenu` lồng nút thật trong vùng bấm `role=\"button\"` — hai điểm dừng Tab cho một nút",
    context:
      "Phát hiện 14/08/2026 khi dựng menu chọn giao diện. `DropdownMenu` bọc `trigger` trong `<div role=\"button\" tabIndex={0}>`, mà MỌI nơi gọi đều truyền vào một nút thật: `TableActionsCell` truyền `<button>`, demo và `ThemeMenu` truyền `<Button>` của DSVH. Kết quả là một phần tử bấm được nằm trong một phần tử bấm được: người dùng bàn phím phải Tab HAI lần mới qua khỏi một cái nút, và trình đọc màn hình đọc ra hai điều khiển chồng nhau ở cùng một chỗ. Bấm chuột vẫn đúng (click nổi bọt lên div) nên lỗi này không lộ ra khi thử tay. CHƯA sửa vì nó đổi hợp đồng của `trigger` ở mọi nơi gọi: đường đúng là DropdownMenu tự dựng nút và nhận `icon`/`label`/`variant` (như `TableActionsCell` đang làm sẵn ở tầng trên), hoặc nhận `asChild` rồi nhân bản phần tử con kèm handler thay vì bọc thêm một lớp. Cả hai đều phải sửa `TableActionsCell` + `KebabButton` + demo cùng lúc, nên tách ra làm riêng có ảnh trước/sau.",
    status: "open",
  },
  {
    need: "Bỏ shadcn khỏi code ứng dụng — CHỈ CÒN đợt 4: `table` ở 10 tệp",
    context: "Kế hoạch bốn đợt, chốt 08/08 sau khi đếm được 162 chỗ ở 44 tệp trong lúc gate RATCHET vẫn xanh — vì nó được giao việc 'không cho tăng', không phải 'trừ dần'. XONG: đợt 1 (Button·Badge·Separator·Progress) · đợt 2 (Card·Skeleton·Input·Textarea) · đợt 3 ngày 11/08 (Select 16 ô ở 8 tệp · Dialog + AlertDialog ở 6 tệp → Modal/ConfirmDialog · Skeleton 1 tệp). CÒN đợt 4: `table` ở 10 tệp — nặng nhất vì phải viết lại `columns`/sắp xếp/trạng thái rỗng cho từng bảng. Hai điều chỉnh phát hiện trong lúc làm đợt 3: (a) `alert-dialog` nằm nhầm ở nhóm mượn-thoải-mái dù `ConfirmDialog` đã có — đã chuyển sang nhóm trùng, ngưỡng 0 = cấm tuyệt đối ngay; (b) `Label` của DSVH bị INFRA miễn trừ nên VÔ HÌNH y hệt bộ ô bảng trước đây (0 nơi dùng, không có trong tài liệu) trong khi 12 tệp vẫn import `ui/label` của shadcn — đã khai vào manifest và gỡ miễn trừ, việc đổi 12 tệp đó để sang đợt sau. KHI SIẾT GATE cuối đợt 4 phải TÁCH HAI LOẠI: import shadcn nằm trong `src/components/ui/**` là primitive gọi nhau (button·separator·input·textarea nay chỉ còn ở đó), không phải nợ của code ứng dụng — không tách thì con số 0 không bao giờ đạt được và gate thành thứ ai cũng bỏ qua. Bài học cũ giữ nguyên: `--update-baseline` chạy ngay sau một lượt gộp sẽ lặng lẽ hợp thức hoá mọi thứ vừa về.",
    status: "open",
  },
  {
    need: "Trang tài liệu API `/docs` (Swagger + bảng kiểm kê) dựng ngoài DSVH",
    context:
      "Về từ dev-test ngày 07/08 (nhánh feat/docs-openapi) — `app/docs/api-docs.tsx` · `try-it.tsx` · `schema-view.tsx`, tổng 96 chỗ dùng token shadcn (`text-muted-foreground`, `bg-muted`), màu palette thô, `font-mono` và cỡ chữ ngoài thang (`text-[13px]`, `text-[12px]`). Baseline ratchet nới đúng bằng ngần ấy (__legacyToken 0→3 · __legacyPalette 0→4 · __legacyMono 0→3 · __legacyTypescale 0→3) để GHI NHẬN, KHÔNG phải để quên: `--update-baseline` chạy sau một lượt gộp sẽ lặng lẽ hợp thức hoá mọi thứ vừa về, nên con số nới phải đi kèm một dòng ở đây nói rõ nới cho cái gì.",
    status: "open",
  },
  {
    need: "Thẻ chọn engine ở /databases/new tự dựng, KHÔNG dùng `DBTypeCard` của DSVH",
    context: "`modules/deploy-database/deploy-database.tsx` dựng tay lưới 4 thẻ engine (~50 dòng JSX). DSVH đã có `ui/deploy/DBTypeCard` cho đúng việc này nhưng hiện chưa nơi nào dùng — trang này là ca duy nhất có thật.",
    status: "open",
    note: "Lượt 07/08 đã kéo phần TOKEN của bản tự dựng về đúng chuẩn (rounded-xl→rounded-card, hover surface-2→stroke-soft, bg-white→bg-surface, trạng thái chọn về đúng bg-orange/[0.06] ring-orange/25) nên hai bên giờ nhìn NHƯ NHAU. Chưa thay component vì bố cục khác thật: bản tự dựng là media-object (logo THẬT của hãng bên trái + tên/mô tả bên phải + dải \"tối thiểu core/RAM\" dưới đáy), còn DBTypeCard đang là cột dọc với `DatabaseIcon` tô theo DB_BRAND — thay thẳng là MẤT logo hãng và mất dải chỉ số. Việc đúng: nâng DBTypeCard lên media-object + thêm slot `icon`/`metrics` (cùng kiểu `onSelect` vừa thêm cho AppCard), rồi trang gọi lại — làm riêng, có ảnh trước/sau, vì nó đổi hình dạng một component DSVH.",
  },
  {
    need: "Hai màn AI mới về từ dev-test dựng trên shadcn: thẻ số liệu token + tab Cấu hình AI",
    context: "Gộp dev-test ← fontend ngày 06/08 (lượt gom 3 luồng) kéo về `modules/admin-reports/ai-usage-card.tsx` và `modules/admin-settings/tab-ai.tsx` — 5 chỗ import shadcn mới: card +2 · button +1 · input +1 · skeleton +1. Baseline ratchet đã nới đúng bằng ngần ấy để GHI NHẬN, không phải để quên.",
    status: "open",
    note: "Token · icon · thang chữ · font của CẢ HAI tệp đã chuẩn hoá xong ngay trong lượt merge này (text-muted-foreground→text-ink-2, bg-muted→bg-surface-2, bg-primary→bg-orange, text-destructive→text-red; lucide→Phosphor: Sparkles→Star, Info→Info, RefreshCw→Refresh, CheckCircle2→CheckCircle, AlertTriangle→Warning, XCircle→Error, Server→HardDrive; thang chữ về 8 bậc có tên; font-mono→tabular-nums). CÒN LẠI đúng phần THAY COMPONENT — và cố ý dừng ở đây theo cùng lý lẽ đã ghi ở hai mục trên: merge phải giữ nguyên việc của người khác, refactor thuộc về một thay đổi riêng. Cụ thể vướng: DSVH `Card` không có CardContent/CardTitle/CardDescription, nên đổi Card là viết lại cấu trúc màn chứ không phải đổi một dòng import — phải làm riêng, có ảnh trước/sau.",
  },
  {
    need: "Trung tâm hỗ trợ + Cấu hình (+ trang Cụm) còn dựng trên shadcn",
    context: "Gộp fontend ← dev-test ngày 06/08 kéo về `modules/admin-dashboard` (9 tệp), `modules/admin-settings` (6 tệp) và `modules/stack` (2 tệp) — tổng 47 chỗ import shadcn mới: card +8 · button +7 · badge +7 · skeleton +6 · table +6 · input +4 · switch +3 · tabs +2 · alert +2 · select +1 · textarea +1. Baseline ratchet đã nới đúng bằng ngần ấy để ghi nhận, KHÔNG phải để quên.",
    status: "open",
    note: "CỐ Ý dựng trên shadcn trước rồi port sau — §8.0 của kế hoạch. Token/thang chữ/font/icon của cả ba module ĐÃ chuẩn hoá xong; còn lại đúng phần THAY COMPONENT. Màn /deploy đã port xong 06/08 và là BẢN MẪU cho ba module còn lại: xem deploy-website.tsx để biết cách đổi Card (children → prop title/action), Select (compound SelectItem → prop options), Dialog → Modal (title/footer là prop), Slider (mảng → số). Lượt port đó cũng lộ ra 4 thứ DSVH còn thiếu và đã bổ sung: variant quiet, asChild, forward ref cho Button/Input, showShimmer cho Progress.",
  },
  {
    need: "Màn đăng nhập (auth.tsx) còn dùng shadcn Button",
    context: "Đến từ nhánh dev-test khi merge 05/08/2026 — 8 chỗ. `variant=\"link\"` ĐÃ CÓ trong DSVH từ 06/08 (thêm khi chữa lỗi \"Xem tất cả phiên đăng nhập\" hiện ra thành một cái hộp có viền); còn thiếu `variant=\"outline\"`.",
    status: "open",
    note: "CỐ Ý không đổi trong lượt merge: merge phải giữ nguyên việc của người khác, refactor thuộc về một thay đổi riêng. Đổi được thì cần quyết lại biến thể nút cho màn đăng nhập, và DSVH đã có sẵn AuthCard + SocialButton cho đúng ca này. Baseline ratchet nới 27→28 để ghi nhận, không phải để quên.",
  },
  {
    need: "StatCard — khối DỰNG TRANG chưa vào DSVH (PageHeader · PageShell · EmptyState ĐÃ vào)",
    context: "Đang ở `src/components/shared/**`. EmptyState XONG ngày 11/08: gộp về `Empty` của DSVH — trước đó DSVH có một bản 0 nơi dùng còn app chạy bản khác ở 25 chỗ/20 tệp, và bản DSVH còn bọc icon trong chấm CAM, phạm luật #8 (icon trang trí phải xám). Không xoá một bản mà gộp thành hai `variant` kèm luật chọn, vì chúng phục vụ hai ngữ cảnh thật: nằm trong khối đã có khung ↔ đứng một mình. Khuôn dựng trang thì đã đóng: `PageShell` vào DSVH ngày 07/08 sau khi hai trang mới nhất (`/agent-tokens`, `/stack/[id]`) đều quên đệm ngoài — tiêu đề dính sát mép khung trắng, chủ dự án nhìn thấy trước gate.",
    status: "open",
    note: "BÀI HỌC: khuôn dựng trang từng là quy ước CHÉP TAY ở 23 file — không nằm trong component nào, không có phép kiểm nào, nên `/dsvh` cũng không mô tả nổi \"một trang trông như thế nào\". Người mới không có cách nào tra ra cái đúng. Nay có `PageShell` + gate PAGESHELL (file render `PageHeader` mà không qua `PageShell`/không mang đủ lớp đệm thì fail). 23 trang cũ vẫn gõ tay lớp đệm — hợp lệ với gate, nhưng nên chuyển dần sang `PageShell` để đổi nhịp trang chỉ phải sửa MỘT chỗ."
  },
  {
    need: "Tooltip dùng chung với Button size='icon'",
    context: "DSVH đã có `ui/Tooltip.tsx`, nhưng 1 file vẫn dùng `@/components/ui/tooltip` của shadcn.",
    status: "planned",
    note: "Đã có bản DSVH — việc còn lại là chuyển nốt chỗ dùng cũ.",
  },
  {
    need: "AvatarGroup (avatar chồng nhau +N)",
    context: "Avatar đã có; bản nhóm chồng nhau thì chưa.",
    status: "open",
  },
  {
    need: "Chart card mẫu (MonthlyTraffic, UserGrowth, TrendCards…)",
    context: "Hệ cũ có `src/components/cards/**` — các thẻ chart dựng sẵn dùng làm ví dụ recipe. Chưa port vì đó là MÀN HÌNH mẫu của app cũ, không phải primitive.",
    status: "borrowed",
    note: "Chart kit (C/gridProps/TooltipCard/LegendDot) ĐÃ có — đủ để tự dựng chart card theo recipe. Không cần bê nguyên thẻ của app cũ sang.",
  },
];

export const dsComponents: ComponentEntry[] = [
  {
    name: "PageShell",
    group: "Layout",
    import: "@/components/dsvh/ui/layout/PageShell",
    file: "ui/layout/PageShell.tsx",
    purpose: "KHUNG của một trang: đệm ngoài co theo breakpoint (16 → 20 → 24px), nhịp dọc 24px, và `PageHeader` bên trong. Đổi hai con số đó ở đây là đổi MỌI trang.",
    when: "Khối ngoài cùng của MỌI trang trong `app/(app)/**`. Trước bản này khuôn dựng trang là quy ước chép tay ở 23 file, không có gì canh — nên hai trang mới nhất (`/agent-tokens`, `/stack/[id]`) đều quên đệm ngoài và tiêu đề dính sát mép khung. Gate PAGESHELL nay chặn: file nào render `PageHeader` mà không qua `PageShell` (hoặc tự mang đủ lớp đệm) thì fail.",
    props: [
      { name: "title / subtitle", type: "string — bỏ trống thì không dựng PageHeader, chỉ còn cái khung" },
      { name: "action", type: "ReactNode — nút/bộ lọc/thanh bước đối diện tiêu đề" },
      { name: "children", type: "ReactNode — nội dung trang" },
      { name: "className", type: "string" },
    ],
    looksLike: ["khung trang", "lề ngoài trang", "đệm quanh nội dung"],
  },
  {
    name: "PageHeader",
    group: "Layout",
    import: "@/components/dsvh/ui/layout/PageHeader",
    file: "ui/layout/PageHeader.tsx",
    purpose: "Tiêu đề trang (title + subtitle, tuỳ chọn `action` góc phải). Khối ĐẦU TIÊN của mọi trang trong vùng nội dung.",
    when: "Mọi trang. Xem mục \"Cấu trúc trang\" (nhóm Bố cục) để biết thứ tự các khối còn lại.",
    props: [
      { name: "title / subtitle", type: "string" },
      { name: "action", type: "ReactNode — nút/bộ lọc ở góc phải" },
    ],
    looksLike: ["tiêu đề trang", "đầu trang", "tên màn hình"],
  },
  {
    name: "HintTip",
    group: "Overlay",
    import: "@/components/dsvh/ui/overlay/HintTip",
    file: "ui/overlay/HintTip.tsx",
    purpose: "Icon chữ i cạnh một nhãn/tiêu đề — rê hoặc Tab vào thì hiện câu giải thích trong tooltip. Không chiếm dòng nào.",
    when: "Câu BỔ TRỢ đọc một lần là hiểu. Ranh giới với dòng chữ hiện sẵn là CHỖ ĐỨNG chứ không phải nội dung: câu người đọc cần thấy MỖI LẦN mở màn thì để hiện, câu giải thích một lần thì vào đây. Chủ dự án chốt 26/08: chín câu hướng dẫn dài 50–282 ký tự ở /admin/nodes tab Cấu hình làm vỡ bố cục lưới hai cột — mọi ô cùng hàng cao bằng ô cao nhất, nên một câu ba dòng ở cột phải đẩy cả hàng giãn ra. Dùng qua prop `tip` của `CardHeader` và `FormField`, ít khi gọi thẳng.",
    props: [
      { name: "content", type: "ReactNode", note: "câu giải thích" },
    ],
    looksLike: ["icon chữ i cạnh nhãn", "chú thích bổ trợ", "dấu hỏi giải thích"],
    vs: [
      { name: "Note", useThisWhen: "Câu giải thích LUÔN ĐÚNG và cần thấy mỗi lần — nó chiếm một khối riêng dưới nội dung." },
    ],
  },
  {
    name: "Note",
    group: "Data Display",
    import: "@/components/dsvh/ui/data/Note",
    file: "ui/data/Note.tsx",
    purpose: "Ghi chú TĨNH — một câu giải thích luôn hiện, gắn dưới khối nó nói về. Khối viền mảnh, icon Info, `text-caption`.",
    when: "Chú thích giới hạn/điều kiện của một khối. KHÔNG dùng `Alert`: `Alert` mang `role=\"alert\"` (vùng live ARIA) nên trình đọc màn hình NGẮT LỜI đọc ngay — đúng cho 'vừa có chuyện xảy ra', sai cho câu vốn nằm đó từ đầu.",
    props: [
      { name: "children", type: "ReactNode" },
      { name: "tone", type: "'neutral' | 'warning' | 'danger'", note: "mặc định `neutral`. `warning`/`danger` cho câu cảnh báo LUÔN ĐÚNG về hệ quả của tình trạng đang có (\"chưa liên kết thì không được sao lưu\", \"danh sách IP rỗng = mở cho cả Internet\") — vẫn KHÔNG phải `Alert`, vì nó không ngắt lời trình đọc màn hình. Icon đi theo tone, nơi gọi không tự chọn." },
      { name: "icon", type: "boolean — mặc định true; tắt khi khối đã có dấu nhận biết riêng" },
      { name: "className", type: "string" },
    ],
    looksLike: ["ghi chú dưới khối", "câu giải thích luôn hiện", "chú thích giới hạn", "dòng cảnh báo nền hổ phách"],
    vs: [
      { name: "HintTip", useThisWhen: "Câu đọc một lần là hiểu — để nó nằm vĩnh viễn thì mỗi lần vào lại phải lướt qua mới tới được nội dung." },
      { name: "Alert", useThisWhen: "Trạng thái VỪA đổi hoặc CẦN người xử lý — có `role=\"alert\"`, trình đọc màn hình đọc ngay." },
    ],
  },
  {
    name: "InfoRow",
    group: "Data Display",
    import: "@/components/dsvh/ui/data/InfoRow",
    file: "ui/data/InfoRow.tsx",
    purpose: "Hàng NHÃN ↔ GIÁ TRỊ chỉ-đọc, KHÔNG khung — dùng bên trong một thẻ đã có khung. Phát `<dt>`/`<dd>` nên phải nằm trong một `<dl>`.",
    when: "Thẻ danh tính, ngăn kéo chi tiết, tab hồ sơ. Đóng mục sổ thiếu mở 19/08 sau khi đếm đủ BA bản viết tay: `InfoRow` (profile), `Muc` (service-expiry), `Row` (admin-nodes). Cỡ chữ do component quyết, nơi gọi KHÔNG truyền vào được — bản `Row` không khai cỡ nào, và vì không chỗ nào đặt cỡ nền cho `body` nên nó render ra 16px, đúng bằng `text-title` (cỡ của TIÊU ĐỀ thẻ). Chủ dự án bắt được 26/08: \"sai size font, đây là một lỗi rất nặng\".",
    props: [
      { name: "label", type: "string" },
      { name: "value", type: "ReactNode" },
      { name: "layout", type: "'row' | 'stack'", note: "mặc định `row` (nhãn trái ↔ giá trị phải). `stack` cho ngăn kéo nhiều cột, nơi nhãn dài mà bề ngang hẹp" },
      { name: "size", type: "'md' | 'sm'", note: "mặc định `md` (giá trị `text-body`). `sm` hạ giá trị xuống `text-caption` — cho cụm siêu dữ liệu ở HÀNG TIÊU ĐỀ thẻ, nơi `text-body` làm nó to ngang chữ trong thân thẻ. Tập ĐÓNG hai phần tử: cỡ vẫn do component quyết, nơi gọi chỉ chọn vai — không mở lại lỗ 16px của bản `Row`" },
      { name: "icon", type: "ComponentType", note: "tuỳ chọn — ngăn kéo 10 mục mà gắn icon cả 10 là nhiễu" },
      { name: "numeric", type: "boolean", note: "bật `tabular-nums`; nơi gọi tự khai vì ép lên chữ thường (địa chỉ, tên miền) chỉ làm đổi hình chữ" },
      { name: "wrap", type: "boolean", note: "giá trị xuống dòng thay vì cắt — bật cho UUID, chuỗi kết nối, đường dẫn" },
    ],
    looksLike: ["hàng nhãn và giá trị", "danh tính", "thông số chỉ đọc"],
    vs: [
      { name: "InfoTile", useThisWhen: "Ô ĐỨNG RIÊNG trong lưới và cần khung. Đặt `InfoTile` vào trong `Card` là khung lồng khung (gate FRAMENEST)." },
    ],
  },
  {
    name: "InfoTile",
    group: "Data Display",
    import: "@/components/dsvh/ui/data/InfoTile",
    file: "ui/data/InfoTile.tsx",
    purpose: "Ô nhãn + giá trị nằm TRONG một thẻ (hạn mức gói, chỉ số node). Hai bố cục: `stack` (nhãn trên, giá trị dưới — xếp lưới để so theo cột) và `row` (nhãn trái, giá trị phải, kèm thanh đo).",
    when: "Bảng thông số nhỏ bên trong `Card`. KHÔNG thay `StatCard`: `StatCard` là ô KPI cấp trang và tự bọc `Card`, nhét nó vào trong một `Card` là lồng hai bề mặt trắng có viền.",
    props: [
      { name: "icon", type: "ComponentType — icon DSVH, tuỳ chọn" },
      { name: "label", type: "string" },
      { name: "value", type: "ReactNode — nhận node vì có ô ghép hai con số có màu riêng (Mạng ở /admin/nodes)" },
      { name: "progress", type: "number | null | undefined — `null` = chưa đo được (thanh rỗng), `undefined` = ô không có thanh. Chỉ có nghĩa ở `row`" },
      { name: "progressTone", type: "'orange' | 'teal' | 'amber' | 'red'" },
      { name: "layout", type: "'stack' | 'row' — mặc định `stack`" },
      { name: "wrap", type: "boolean — giá trị xuống dòng thay vì cắt. Bật khi người dùng phải đọc TRỌN (địa chỉ kết nối, mã dịch vụ): cắt một `host:port` là giấu đúng thứ người ta mở ô đó ra để lấy" },
    ],
    looksLike: ["ô nhãn và giá trị trong thẻ", "ô hạn mức của gói", "ô chỉ số nhỏ", "ô thông số kèm thanh đo"],
    vs: [
      { name: "InfoRow", useThisWhen: "Hàng nằm TRONG một thẻ đã có khung — `InfoTile` tự mang khung nên đặt vào trong `Card` là khung lồng khung." },
      { name: "StatCard", useThisWhen: "Ô KPI cấp trang, đứng thành hàng dưới tiêu đề trang." },
    
    ],
    related: ["Progress", "StatCard"],
  },
  {
    name: "StatCard",
    group: "Data Display",
    import: "@/components/dsvh/ui/data/StatCard",
    file: "ui/data/StatCard.tsx",
    purpose: "Ô KPI tóm tắt — hàng 4 ô ngay dưới PageHeader. Tĩnh, KHÔNG bấm được. Hỗ trợ `loading` (Skeleton giữ chiều cao) và `tone` (tô đỏ/xanh con số khi nó mang nghĩa xấu/tốt).",
    when: "Hàng số liệu tóm tắt đầu trang quản trị. Trước 05/08/2026 tồn tại 5 BẢN khác nhau (1 shared + 4 tự viết trong module) chia 2 thiết kế — nay gộp về một.",
    props: [
      { name: "icon", type: "component icon DSVH (Phosphor) — KHÔNG dùng lucide" },
      { name: "label / value / desc", type: "string | number" },
      { name: "loading", type: "boolean" },
      { name: "tone", type: "'default' | 'danger' | 'success'" },
    ],
    looksLike: ["thẻ số liệu", "hàng bốn ô kpi", "ô tóm tắt tĩnh"],
    related: ["InfoTile"],
    vs: [
      { name: "StatTile", useThisWhen: "Ô to, TĨNH, xếp thành hàng ngay dưới tiêu đề trang — con số tóm tắt cả màn." },
    
      { name: "InfoTile", useThisWhen: "Ô nằm TRONG một `Card` đã có, mô tả thuộc tính của chính thẻ đó — không phải KPI cấp trang." },
    ],
  },
  {
    name: "Chart kit (C / gridProps / cursorLine / TooltipCard / chartTooltip / pieTooltip / axisTick)",
    group: "Data Display",
    import: "@/components/dsvh/charts/kit",
    file: "charts/kit.tsx",
    purpose: "Bộ dụng cụ dùng chung cho MỌI biểu đồ Recharts: `C` (palette theo token), `axisTick`, `gridProps`, `cursorLine`, `TooltipCard`. Không phải component vẽ chart — là lớp thống nhất để chart nào cũng cùng một ngôn ngữ thị giác.",
    // 19/08: thêm `pieTooltip`. `chartTooltip` đọc theo TRƯỜNG (mỗi dãy một cột trong hàng dữ liệu)
    // nên KHÔNG dùng được cho biểu đồ TRÒN, nơi mọi lát chung một `dataKey` và cái phân biệt là
    // HÀNG. Mượn nhầm thì trỏ một lát mà tooltip hiện N dòng cùng một con số dưới N cái tên —
    // gặp thật ở biểu đồ 5 nhóm lỗi của /admin/dashboard, và bộ kiểm dựng TĨNH không bắt được vì
    // tooltip chỉ tồn tại lúc rê chuột.
    when: "Bất cứ khi nào dựng biểu đồ. LUẬT: chart = Recharts + kit này, KHÔNG tự set màu/lưới/tooltip rời rạc.",
    props: [
      { name: "C", type: "palette màu chart lấy từ token" },
      { name: "gridProps", type: "props cho <CartesianGrid>" },
      { name: "cursorLine", type: "cursor cho <Tooltip>" },
      { name: "TooltipCard", type: "component nội dung tooltip" },
      { name: "axisTick", type: "style tick cho <XAxis>/<YAxis>" },
    ],
    looksLike: ["biểu đồ", "đồ thị", "màu series"],
  },
  {
    name: "Reveal",
    group: "Core Concepts",
    import: "@/components/dsvh/motion/Reveal",
    file: "motion/Reveal.tsx",
    purpose: "Hiệu ứng xuất hiện khi cuộn tới (fade + slide-up nhẹ), dùng IntersectionObserver.",
    when: "Bọc khối nội dung cần vào màn có nhịp. LUẬT motion của DSVH: entrance dùng Reveal, không tự chế keyframe rời.",
    props: [
      { name: "children", type: "ReactNode", note: "khối cần hiện dần" },
      { name: "delay", type: "number", note: "ms trễ, để xếp nhịp nhiều khối cạnh nhau (0 · 80 · 160…)" },
      { name: "className", type: "string" },
    ],
    looksLike: ["hiện dần khi cuộn", "hiệu ứng xuất hiện"],
    related: ["CountUp"],
  },
  {
    name: "CountUp",
    group: "Core Concepts",
    import: "@/components/dsvh/motion/CountUp",
    file: "motion/CountUp.tsx",
    purpose: "Số đếm tăng dần tới giá trị đích khi khối vào màn — dùng cho KPI, không dùng cho số phải đọc chính xác tức thì (giá tiền trong hoá đơn).",
    when: "Số KPI trong StatTile / dashboard. Đi kèm Reveal trong recipe KPI.",
    props: [
      { name: "end", type: "number", note: "số đích; tự chạy từ 0 lên khi vào màn" },
      { name: "duration", type: "number", note: "ms, mặc định ~1200" },
      { name: "className", type: "string" },
    ],
    looksLike: ["số chạy tăng dần", "số đếm lên"],
    related: ["Reveal"],
  },
  {
    name: "PeriodPill",
    group: "Data Display",
    import: "@/components/dsvh/ui/Card",
    file: "ui/Card.tsx",
    purpose: "Nút chọn khoảng thời gian (Today / Last 7 Days / …) dạng pill, mở dropdown qua FloatingLayer.",
    when: "Góc phải CardHeader của chart card.",
    props: [
      { name: "label", type: "string", note: "nhãn đang chọn (7 ngày · 30 ngày…)" },
      { name: "options", type: "string[]", note: "danh sách kỳ; bỏ trống thì dùng bộ mặc định" },
      { name: "onChange", type: "(val: string) => void" },
    ],
    looksLike: ["chọn kỳ thời gian", "bảy ngày ba mươi ngày"],
  },
  {
    name: "KebabButton / IconGhostButton / TileKebabDropdown",
    group: "Data Display",
    import: "@/components/dsvh/ui/Card",
    file: "ui/Card.tsx",
    purpose: "Nút ⋮ (kebab) + nút icon ghost dùng ở góc thẻ; TileKebabDropdown là bản có sẵn menu mặc định (Xem/Làm mới/Xuất…).",
    when: "Hành động phụ trên Card/StatTile.",
    props: [
      { name: "items", type: "KebabItem[]", note: "{ label, icon?, action?, danger? } — danger tô đỏ, luôn đặt cuối" },
      { name: "children", type: "ReactNode", note: "(IconGhostButton) icon bên trong" },
      { name: "label", type: "string", note: "(IconGhostButton) BẮT BUỘC — nhãn cho screen reader vì nút chỉ có icon" },
      { name: "active", type: "boolean", note: "(IconGhostButton) trạng thái bật, ví dụ nút lọc đang áp dụng" },
    ],
    looksLike: ["nút ba chấm trên đầu thẻ", "nút icon mờ trong thẻ"],
    vs: [
      { name: "DropdownMenu", useThisWhen: "Bản dựng sẵn cho ĐẦU THẺ (CardHeader): nút icon chìm, hợp với mật độ của thẻ." },
    ],
  },
  {
    name: "LegendDot",
    group: "Data Display",
    import: "@/components/dsvh/ui/Card",
    file: "ui/Card.tsx",
    purpose: "Chấm màu + nhãn cho chú thích chart, màu lấy từ palette `C` của kit.",
    when: "Legend của chart card — mỗi series một LegendDot.",
    props: [
      { name: "color", type: "string", note: "class token của chấm, ví dụ 'bg-orange' — KHÔNG truyền hex" },
      { name: "label", type: "string", note: "tên series" },
    ],
    looksLike: ["chấm chú giải", "ký hiệu màu cho từng đường"],
  },
  {
    name: "Button",
    group: "Components",
    import: "@/components/dsvh/ui/Button",
    file: "ui/Button.tsx",
    purpose: "Canonical button (tailwind-variants). Variants: solid/dark/ghost/soft/cream/link/quiet; sizes sm/md/lg/icon. Hỗ trợ leftIcon/rightIcon (tự cách bằng gap), loading (spinner + disable), icon-only (size='icon' + aria-label), asChild (mặc children làm phần tử gốc — cho `<a href>` mở tab mới), và forward ref tới `<button>`.",
    when: "Any button. solid=primary CTA, dark=send-style, ghost/soft=secondary, cream=Create New, link=hành động phụ trong luồng đọc, quiet=nút chìm hẳn vào nền (icon nhỏ, hành động phụ cạnh CTA). LƯU Ý tên gọi: `ghost` của DSVH CÓ viền + nền (tương đương `outline` của shadcn); muốn trong suốt thì dùng `quiet`. Icon+text: leftIcon/rightIcon; chỉ-icon: size='icon'.",
    props: [
      { name: "variant", type: "'solid'|'dark'|'ghost'|'soft'|'cream'|'link'|'quiet'|'danger' — danger cho hành động KHÔNG HOÀN TÁC (xoá/huỷ), màu từ token red" },
      { name: "size", type: "'sm'|'md'|'lg'|'icon'|'icon-sm' — icon 36px cho form/thanh công cụ, icon-sm 32px cho HÀNG BẢNG (ba nút icon ở 36px đội chiều cao hàng lên rõ rệt)" },
      { name: "leftIcon / rightIcon", type: "ReactNode" },
      { name: "loading", type: "boolean (spinner + disable)" },
      { name: "asChild", type: "boolean — mặc children làm phần tử gốc, chỉ truyền class xuống" },
      { name: "ref", type: "Ref<HTMLButtonElement> — forward tới chính <button>" },
    ],
    looksLike: ["nút bấm", "nút hành động"],
    related: ["SocialButton"],
  },
  {
    name: "Badge",
    group: "Components",
    import: "@/components/dsvh/ui/Badge",
    file: "ui/Badge.tsx",
    purpose: "Nhãn trạng thái do HỆ THỐNG sinh (Đang chạy · Lỗi · Pro), tone lấy từ status.ts. Trong một bảng chỉ dùng MỘT cỡ badge.",
    when: "Status tags, deltas, counters, 'soon' markers.",
    props: [
      { name: "tone", type: "'neutral'|'accent'|'success'|'warning'|'danger'|'outline'" },
      { name: "size", type: "'sm'|'md' — trong BẢNG dùng cùng MỘT size cho mọi huy hiệu (mặc định md); trộn size là cùng một vai ra hai cỡ" },
      { name: "title", type: "string? — chú thích đầy đủ khi rê chuột (08/08); nhãn hay viết tắt (db/FREE/ok) nên cần nói đủ nghĩa, trước phải bọc thêm một `<span title>` chỉ để giữ một thuộc tính HTML sẵn có" },
    ],
    looksLike: ["nhãn trạng thái", "huy hiệu"],
    vs: [
      { name: "Tag", useThisWhen: "Nhãn do HỆ THỐNG sinh: trạng thái, hạng gói. Người dùng không gỡ được." },
    ],
    related: ["StatusDot"],
  },
  {
    name: "TableIdentityCell",
    group: "Data Display",
    import: "@/components/dsvh/ui/table-cells",
    file: "ui/table-cells.tsx",
    purpose: "Ô ĐỊNH DANH hai dòng: tên (vai CHÍNH) + mô tả (vai PHỤ), tuỳ chọn icon/avatar bên trái.",
    when: "Cột ĐẦU TIÊN của gần như mọi bảng. Đây là mẫu ô hay bị chép tay nhất — chép tay là lúc cỡ chữ hai dòng bắt đầu lệch giữa các bảng.",
    props: [
      { name: "title", type: "ReactNode" },
      { name: "sub?", type: "ReactNode" },
      { name: "leading?", type: "ReactNode" },
    ],
    looksLike: ["ô tên hai dòng", "cột đầu của bảng"],
    related: ["Table"],
    partOf: "Table",
    partCategory: "Chữ & định danh",
  },
  {
    name: "TableTextCell",
    group: "Data Display",
    import: "@/components/dsvh/ui/table-cells",
    file: "ui/table-cells.tsx",
    purpose: "Ô chữ thường, vai CHÍNH. `muted` hạ MÀU xuống text-ink-2 nhưng GIỮ cỡ chữ.",
    when: "Giá trị chữ không có cấu trúc gì thêm. Cần hạ bớt độ nổi thì dùng `muted`, ĐỪNG hạ cỡ chữ — hạ cỡ là việc của vai, không phải của độ quan trọng.",
    props: [
      { name: "value", type: "ReactNode" },
      { name: "muted?", type: "boolean" },
      { name: "truncate?", type: "boolean" },
    ],
    looksLike: ["ô chữ trong bảng", "giá trị chữ trong bảng"],
    related: ["Table"],
    partOf: "Table",
    partCategory: "Chữ & định danh",
  },
  {
    name: "TableNumberCell",
    group: "Data Display",
    import: "@/components/dsvh/ui/table-cells",
    file: "ui/table-cells.tsx",
    purpose: "Ô số: canh PHẢI, `tabular-nums`, định dạng vi-VN (tiền tệ VND).",
    when: "Mọi cột số. Canh phải + tabular-nums là điều kiện để so sánh theo chiều dọc — thiếu thì cột số chỉ còn đọc được từng ô một.",
    props: [
      { name: "value", type: "number" },
      { name: "null", type: "—" },
      { name: "format?", type: "'plain'" },
      { name: "'currency'", type: "—" },
      { name: "'percent'", type: "—" },
      { name: "prefix?/suffix?", type: "string" },
    ],
    looksLike: ["ô số trong bảng", "cột số canh phải", "cột tiền"],
    related: ["Table"],
    partOf: "Table",
    partCategory: "Số & mức đo",
  },
  {
    name: "TableFractionCell",
    group: "Data Display",
    import: "@/components/dsvh/ui/table-cells",
    file: "ui/table-cells.tsx",
    purpose: "Ô phân số kiểu 1/2 — hai vế CÙNG cỡ, mẫu số chỉ nhạt hơn về màu.",
    when: "Đang dùng bao nhiêu trên tổng bấy nhiêu (website, tên miền, chỗ ngồi). Thu nhỏ mẫu số làm mắt đọc ra hai thông tin khác cấp trong khi ý nghĩa chỉ có một.",
    props: [
      { name: "used", type: "number" },
      { name: "total", type: "number" },
    ],
    looksLike: ["ô phân số", "một trên hai trong bảng"],
    related: ["Table"],
    partOf: "Table",
    partCategory: "Số & mức đo",
  },
  {
    name: "TableDateCell",
    group: "Data Display",
    import: "@/components/dsvh/ui/table-cells",
    file: "ui/table-cells.tsx",
    purpose: "Ô ngày, vai CHÍNH, định dạng giờ Việt Nam. KHÔNG kèm icon lịch.",
    when: "`withTime` cho cột nói về việc VỪA xảy ra (lần chạy, đăng nhập gần nhất); ngày trần cho thứ đổi theo ngày. Icon lịch lặp ở mọi dòng là trang trí — tiêu đề cột đã nói đó là ngày.",
    props: [
      { name: "value", type: "string" },
      { name: "Date", type: "—" },
      { name: "null", type: "—" },
      { name: "withTime?", type: "boolean" },
    ],
    looksLike: ["ô ngày trong bảng", "cột ngày tạo"],
    related: ["Table"],
    partOf: "Table",
    partCategory: "Thời gian",
  },
  {
    name: "TableStatusCell",
    group: "Data Display",
    import: "@/components/dsvh/ui/table-cells",
    file: "ui/table-cells.tsx",
    purpose: "Ô trạng thái: chấm màu + nhãn chữ, tone lấy từ một nguồn status.ts.",
    when: "Trạng thái vận hành (đang chạy / lỗi / chờ). Đừng tự chế tone tại chỗ: cùng một trạng thái phải cùng màu ở bảng, ở thẻ và ở dải trạng thái.",
    props: [
      { name: "status", type: "Status" },
      { name: "label?", type: "string" },
    ],
    looksLike: ["ô trạng thái có chấm", "chấm màu kèm chữ trong bảng"],
    related: ["Table"],
    partOf: "Table",
    partCategory: "Trạng thái & nhãn",
  },
  {
    name: "TableBooleanCell",
    group: "Data Display",
    import: "@/components/dsvh/ui/table-cells",
    file: "ui/table-cells.tsx",
    purpose: "Ô đúng/sai bằng icon check (teal) hoặc close (đỏ).",
    when: "Cột hẹp mà giá trị chỉ có hai khả năng. Giá trị có sắc thái hơn hai mức thì dùng Badge, không dùng ô này.",
    props: [
      { name: "value", type: "boolean" },
      { name: "null", type: "—" },
    ],
    looksLike: ["ô đúng sai", "dấu tích trong bảng"],
    related: ["Table"],
    partOf: "Table",
    partCategory: "Trạng thái & nhãn",
  },
  {
    name: "TableTagsCell",
    group: "Data Display",
    import: "@/components/dsvh/ui/table-cells",
    file: "ui/table-cells.tsx",
    purpose: "Ô nhiều nhãn nhỏ, dựng bằng `Tag`; quá `max` thì gộp thành +N có title liệt kê phần còn lại.",
    when: "Phân loại, thông số ngắn, danh sách ngắn trong một ô. Nhận cả chuỗi trần lẫn chip có icon — CỐ Ý một hàm, tách đôi là tự tạo thêm một cặp trùng vai.",
    props: [
      { name: "tags", type: "(string " },
      { name: " { icon?", type: "ReactNode; label: string })[]" },
      { name: "max?", type: "number" },
    ],
    looksLike: ["ô nhiều nhãn nhỏ", "chip trong bảng"],
    related: ["Table"],
    partOf: "Table",
    partCategory: "Trạng thái & nhãn",
  },
  {
    name: "TableUsageCell",
    group: "Data Display",
    import: "@/components/dsvh/ui/table-cells",
    file: "ui/table-cells.tsx",
    purpose: "Ô thanh đo có ngưỡng màu, dựng bằng `Progress`.",
    when: "`high-bad` cho MỨC DÙNG tài nguyên (≥90 đỏ · ≥70 cam); `low-bad` cho ĐỘ HOÀN THÀNH / độ phủ (<30 đỏ · <70 cam). Bắt buộc khai hướng — dùng nhầm thì một máy chủ sắp đầy đĩa lại hiện màu teal yên tâm.",
    props: [
      { name: "value", type: "number" },
      { name: "direction", type: "'high-bad' " },
      { name: " 'low-bad'", type: "—" },
    ],
    looksLike: ["thanh đo trong ô bảng", "cột mức dùng"],
    vs: [
      { name: "Progress", useThisWhen: "Chính thanh đó nhưng NẰM TRONG Ô BẢNG: đã gói sẵn ngưỡng màu và bề rộng tối thiểu." },
    ],
    partOf: "Table",
    partCategory: "Số & mức đo",
  },
  {
    name: "TableUserCell",
    group: "Data Display",
    import: "@/components/dsvh/ui/table-cells",
    file: "ui/table-cells.tsx",
    purpose: "Ô người dùng: Avatar + tên (CHÍNH) + email/vai trò (PHỤ).",
    when: "Bảng nhân sự, khách hàng, người thao tác. Dùng `Avatar` của DSVH nên cách rơi về khi không có ảnh (logo Vibe Host) giống hệt mọi nơi khác.",
    props: [
      { name: "name", type: "string" },
      { name: "sub?", type: "string" },
      { name: "src?", type: "string" },
      { name: "null", type: "—" },
    ],
    looksLike: ["ô người dùng trong bảng", "avatar kèm tên trong bảng"],
    vs: [
      { name: "Avatar", useThisWhen: "Ảnh + tên + dòng phụ, đã gói sẵn cho một ô bảng." },
    ],
    partOf: "Table",
    partCategory: "Người",
  },
  {
    name: "TableUserGroupCell",
    group: "Data Display",
    import: "@/components/dsvh/ui/table-cells",
    file: "ui/table-cells.tsx",
    purpose: "Nhóm avatar chồng nhau +N.",
    when: "Cột 'ai đang tham gia'. AvatarGroup chưa có bản chính trong DSVH (đang trong Sổ thiếu) — khi dựng xong thì ô này rút lại thành lời gọi component đó.",
    props: [
      { name: "people", type: "{ name, src? }[]" },
      { name: "max?", type: "number" },
    ],
    looksLike: ["nhiều avatar chồng nhau", "ô nhóm người"],
    related: ["Table"],
    partOf: "Table",
    partCategory: "Người",
  },
  {
    name: "TableLinkCell",
    group: "Data Display",
    import: "@/components/dsvh/ui/table-cells",
    file: "ui/table-cells.tsx",
    purpose: "Ô liên kết; mặc định mở tab mới kèm icon mũi tên.",
    when: "Địa chỉ website đã triển khai, liên kết ra ngoài. `external={false}` cho liên kết nội bộ — kéo người dùng rời khỏi danh sách họ đang quét là làm mất chỗ đang đứng.",
    props: [
      { name: "text", type: "string" },
      { name: "href", type: "string" },
      { name: "external?", type: "boolean" },
    ],
    looksLike: ["ô liên kết trong bảng", "cột địa chỉ website"],
    related: ["Table"],
    partOf: "Table",
    partCategory: "Liên kết & hành động",
  },
  {
    name: "TableActionsCell",
    group: "Data Display",
    import: "@/components/dsvh/ui/table-cells",
    file: "ui/table-cells.tsx",
    purpose: "Ô hành động: MỘT menu ba chấm, dựng bằng `DropdownMenu`.",
    when: "Mọi cột thao tác. KHÔNG dùng ba nút icon xếp hàng: chúng đội chiều cao dòng và bắt đoán nghĩa icon, trong khi menu gọi tên hành động bằng chữ và thêm đúng một nhịp trước hành động nguy hiểm.",
    props: [
      { name: "items", type: "MenuItem[]" },
    ],
    looksLike: ["nút ba chấm cuối dòng bảng", "cột thao tác"],
    vs: [
      { name: "DropdownMenu", useThisWhen: "Bản dựng sẵn cho CỘT THAO TÁC của bảng: đã có nút ba chấm, canh phải, cỡ đúng chiều cao dòng." },
    ],
    partOf: "Table",
    partCategory: "Liên kết & hành động",
  },
  {
    name: "TableEmptyCell",
    group: "Data Display",
    import: "@/components/dsvh/ui/table-cells",
    file: "ui/table-cells.tsx",
    purpose: "Dấu gạch cho ô không có dữ liệu.",
    when: "Các ô dựng sẵn tự gọi khi giá trị rỗng; gọi tay khi tự viết `render`. Để cột không bị 'thủng' và người đọc biết là TRỐNG chứ không phải lỗi.",
    looksLike: ["ô trống dấu gạch", "dấu gạch ngang thay giá trị"],
    related: ["Table"],
    partOf: "Table",
    partCategory: "Ô rỗng",
  },
  {
    name: "Table",
    group: "Data Display",
    import: "@/components/dsvh/ui/Table",
    file: "ui/Table.tsx",
    purpose: "Generic data table <T>: sortable columns, row selection (checkbox + indeterminate), variants (default/bordered/zebra), density, sticky header, skeleton loading, empty state, pagination. RESPONSIVE: `<th>` không rớt dòng (`whitespace-nowrap`), vệt mờ hai mép tự bật/tắt báo còn nội dung khi cuộn ngang, scrollbar mảnh — ba thứ này đi cùng nhau, thiếu cái nào thì trên màn hẹp bảng hoặc rớt dòng hoặc trông như bị cắt cụt. Ô trong bảng KHÔNG dựng tay: lấy từ bộ ô dựng sẵn (xem `Ô bảng dựng sẵn`), và cách ghép cả bảng xem mục Giải phẫu ngay trên trang này. ƯU TIÊN CỘT: dùng `hideBelow` bỏ cột phụ ở màn hẹp — cuộn ngang là lối thoát CUỐI, không phải mặc định; giữ định danh · trạng thái · thao tác ở mọi bề ngang. GOM NHÓM (`rowGroup`): dồn các dòng cùng khoá về liền nhau rồi bọc chúng trong MỘT khung có tiêu đề — dùng khi mấy dòng thật ra là một thứ (các thành phần của một cụm). Khung vẽ bằng viền trên `<td>`, KHÔNG trên `<tr>`: bảng dùng `border-collapse` nên viền đặt ở `<tr>` bị trình duyệt bỏ qua. Dồn nhóm chạy SAU phép sắp xếp, nên bấm sắp theo cột nào thì cả khối di chuyển theo mà không bị xé rời.",
    when: "Any tabular data — user lists, transactions, admin tables. Dùng `rowGroup` khi các dòng có quan hệ 'thuộc về nhau': quan hệ đó là THỊ GIÁC, nhét thêm chữ vào từng dòng không thay được cái khung.",
    props: [
      { name: "data", type: "T[]" },
      { name: "columns", type: "ColumnDef<T>[]", note: "key, header, accessorKey, align, render, sortable, hideBelow (ẩn cột trùng thông tin ở màn hẹp thay vì cuộn ngang)" },
      {
        name: "columns[].maxWidth",
        type: "string | number — TRẦN bề ngang cột. Thứ DUY NHẤT làm `truncate` cắt được thật: bảng chạy `table-layout: auto` nên `width` chỉ là gợi ý, và `<td>` mang sẵn `whitespace-nowrap` nên nội dung dài đẩy cả bảng cuộn ngang. Đo 24/08: cột thêm `truncate` mà không có `maxWidth` vẫn cuộn y như cũ, và bộ kiểm dựng vẫn xanh vì nó chỉ soi được LỚP CSS chứ không soi được bố cục.",
      },
      { name: "selectable / selectedRowIds / onSelectionChange", type: "row selection" },
      { name: "sortState / onSortChange", type: "sorting" },
      { name: "variant/density/loading/pagination", type: "states" },
      { name: "rowGroup", type: "{ keyOf, header }", note: "gom dòng cùng khoá vào MỘT khối có khung + tiêu đề; keyOf trả null ⇒ dòng đứng riêng như cũ" },
      { name: "pagination", type: "PaginationConfig", note: "⚠ KHÔNG phải bản chuẩn của app. Nó vẽ `TablePagination` — một thanh RIÊNG nằm trong `Table.tsx`: chỉ có \"Trang x / y\" + hai mũi tên, kèm ô chọn cỡ trang. Thanh CHUẨN mà 10+ màn đang dùng là `AppPagination` (`components/shared/app-pagination`) → `Pagination` của DSVH: dãy SỐ TRANG có rút gọn dấu \"…\". Đi qua prop này là làm màn của bạn lệch khỏi mọi màn danh sách còn lại — gặp thật ở /admin/dashboard ngày 20/08, phải làm lại cả bốn bảng. Dùng `AppPagination` đặt DƯỚI bảng, và để `data` là mảng ĐÃ CẮT theo trang." },
      { name: "emptyText / emptySubtext / emptyIcon", type: "trạng thái rỗng", note: "Từ 19/08/2026 hàng rỗng dựng bằng `Empty` (variant inline) — MỘT trạng thái rỗng cho cả app, xem `Empty`. Truyền ĐỦ CẢ BA: câu mặc định của Table nói về BỘ LỌC KHÔNG KHỚP, dùng nhầm cho ca CHƯA CÓ GÌ là chỉ sai đường cho người dùng. Bảng đã tự lo hàng rỗng rồi thì ĐỪNG bọc thêm một nhánh `data.length === 0 ? <Empty/> : <Table/>` bên ngoài — nhánh `emptyText` khi ấy chết hẳn mà không có gì báo (gặp thật ở `/admin/dashboard`, hai câu chữ khác nhau cho cùng một tình huống)." },
    ],
    looksLike: ["bảng dữ liệu", "danh sách nhiều cột", "bảng có sắp xếp"],
    vs: [
      { name: "List / ListItem", useThisWhen: "Từ BA cột so sánh được trở lên, hoặc cần sắp xếp / chọn nhiều dòng / phân trang." },
    ],
    related: ["Empty", "TableBooleanCell", "TableDateCell", "TableEmptyCell", "TableFractionCell", "TableIdentityCell", "TableLinkCell", "TableNumberCell", "TableStatusCell", "TableTagsCell", "TableTextCell", "TableToolbar", "TableUserGroupCell", "TreeGuide · TreeRow"],
  },
  {
    name: "UploadModal",
    group: "Components",
    import: "@/components/dsvh/ui/overlay/UploadModal",
    file: "ui/overlay/UploadModal.tsx",
    purpose: "Multi-state file upload dialog (Figma 'Media Upload' layout, DSVH skin): dropzone drag/browse, validation (maxFiles, accept), per-file states queued/uploading(progress+pause/cancel)/done, footer Cancel/Upload.",
    when: "A confirmed upload flow in a modal (vs FileUpload inline dropzone).",
    props: [
      { name: "open / onClose", type: "control" },
      { name: "onComplete", type: "(files)=>void" },
      { name: "maxFiles / accept", type: "constraints" },
    ],
    looksLike: ["hộp thoại tải tệp", "cửa sổ tải lên"],
  },
  {
    name: "FileUpload",
    group: "Components",
    import: "@/components/dsvh/ui/FileUpload",
    file: "ui/FileUpload.tsx",
    purpose: "Dropzone (drag+click) + validation (accept, maxSize) + per-file progress and states (queued/uploading/success/error+retry). Helpers formatFileSize, validateFile; sub-parts Dropzone, FileRow.",
    when: "Any file/attachment upload surface.",
    props: [
      { name: "accept / maxSize / maxFiles / multiple", type: "constraints" },
      { name: "value / onChange / onUploadComplete", type: "controlled + callbacks" },
      { name: "disabled / autoUpload / label / description", type: "options" },
    ],
    looksLike: ["vùng kéo thả tệp", "chọn tệp từ máy"],
  },
  {
    name: "Input",
    group: "Components",
    import: "@/components/dsvh/ui/Input",
    file: "ui/Input.tsx",
    purpose: "Text field with label/hint/error, sizes sm/md/lg, optional left icon, invalid state. Forward `ref` tới chính `<input>` (để focus()/select() sau khi báo lỗi) — `className` thì gắn vào DIV ROOT vì root mới là phần tử tham gia layout.",
    when: "Any single-line text entry.",
    props: [
      { name: "label/hint/error", type: "string" },
      { name: "size", type: "'sm'|'md'|'lg'" },
      { name: "leftIcon", type: "ReactNode" },
    ],
    looksLike: ["ô nhập một dòng", "trường nhập chữ", "ô tìm kiếm"],
    vs: [
      { name: "Textarea", useThisWhen: "Một dòng." },
    ],
    related: ["PasswordInput", "PinInput"],
  },
  {
    name: "CopyButton",
    group: "Components",
    import: "@/components/dsvh/ui/CopyButton",
    file: "ui/CopyButton.tsx",
    purpose: "Nút sao chép giá trị vào clipboard, hiện trạng thái 'đã chép' (icon đổi + teal). Icon-only hoặc nút viền có chữ.",
    when: "Sao chép URL/subdomain, connection string, API key, giá trị env.",
    props: [
      { name: "value", type: "string" },
      { name: "label", type: "string", note: "có → nút viền; không → icon" },
      { name: "size", type: "'sm'|'md'" },
    ],
    looksLike: ["nút sao chép", "icon copy"],
    related: ["CredentialCard", "SecretInput"],
  },
  {
    name: "SecretInput",
    group: "Forms",
    import: "@/components/dsvh/ui/form/SecretInput",
    file: "ui/form/SecretInput.tsx",
    purpose: "Ô nhập bí mật: che (•••), nút hiện/ẩn, nút sao chép, font mono. Nhận mọi prop của <input>.",
    when: "API key, connection string, biến môi trường mã hoá.",
    props: [
      { name: "label/hint/error", type: "string" },
      { name: "copyable", type: "boolean", note: "mặc định true" },
      {
        name: "defaultVisible",
        type: "boolean",
        note:
          "mặc định false (che). Bật cho ca HIỆN ĐÚNG MỘT LẦN ĐỂ CHÉP LẠI — chuỗi TOTP lúc bật 2FA, khoá API vừa tạo — nơi người dùng đang phải đọc và gõ lại giá trị ngay lúc đó, che đi là thêm một bước vào đúng việc màn hình sinh ra để làm. Nút hiện/ẩn vẫn còn.",
      },
      { name: "value/onChange", type: "controlled" },
    ],
    looksLike: ["ô khoá bí mật", "ô token che đi"],
    related: ["CopyButton"],
  },
  {
    name: "KeyValueEditor",
    group: "Forms",
    import: "@/components/dsvh/ui/form/KeyValueEditor",
    file: "ui/form/KeyValueEditor.tsx",
    purpose: "Trình sửa cặp KEY–VALUE (biến môi trường): mỗi dòng input KEY (mono) + SecretInput (che/hiện/sao chép) cho VALUE, thêm/bớt dòng.",
    when: "Bảng biến môi trường mã hoá, config key-value.",
    props: [
      { name: "value", type: "KVPair[]" },
      { name: "onChange", type: "(rows)=>void" },
      { name: "label/hint", type: "string" },
      { name: "secret", type: "boolean", note: "mặc định true — value che" },
    ],
    looksLike: ["biến môi trường", "cặp khoá giá trị"],
  },
  {
    name: "LogViewer",
    group: "Data Display",
    import: "@/components/dsvh/ui/data/LogViewer",
    file: "ui/data/LogViewer.tsx",
    purpose: "Terminal/log stream nền surface-hover (theme-aware, xem giá trị ở mục Token): tô màu theo level, số dòng, search/filter, auto-scroll follow-tail + nút về mới nhất, copy toàn bộ + tải log, StatusDot pulse khi đang stream.",
    when: "Log build/deploy, runtime container, database.",
    props: [
      { name: "lines", type: "(LogLine|string)[]" },
      { name: "title / streaming", type: "string / boolean" },
      { name: "heightClass / showLineNumbers / filename", type: "options" },
    ],
    looksLike: ["khung xem log", "nhật ký chạy", "cửa sổ terminal"],
  },
  {
    name: "DBTypeCard",
    group: "Deploy",
    import: "@/components/dsvh/ui/deploy/DBTypeCard",
    file: "ui/deploy/DBTypeCard.tsx",
    purpose: "Lưới thẻ chọn engine database (Postgres/MySQL/Redis/Mongo) — icon tô màu hãng (DB_BRAND), chọn = ring cam + tick. Radiogroup.",
    when: "Bước chọn loại DB khi tạo database.",
    props: [
      { name: "options", type: "DBTypeOption[]" },
      { name: "value / onChange", type: "DBEngine" },
      { name: "columns", type: "2|3|4" },
    ],
    looksLike: ["thẻ chọn loại database", "chọn mysql postgres"],
  },
  {
    name: "CredentialCard",
    group: "Deploy",
    import: "@/components/dsvh/ui/deploy/CredentialCard",
    file: "ui/deploy/CredentialCard.tsx",
    purpose: "Thẻ thông tin kết nối DB: connection string (SecretInput che+copy) + lưới field host/port/user/password (mỗi field CopyButton, field secret dùng SecretInput).",
    when: "Hiển thị credential database/service sau khi tạo.",
    props: [
      { name: "connectionString", type: "string" },
      { name: "fields", type: "CredentialField[]" },
      { name: "title / action", type: "ReactNode" },
    ],
    looksLike: ["khối thông tin đăng nhập", "mật khẩu hiện một lần"],
    related: ["CopyButton"],
  },
  {
    name: "ResourceMeter",
    group: "Data Display",
    import: "@/components/dsvh/ui/data/ResourceMeter",
    file: "ui/data/ResourceMeter.tsx",
    purpose: "Thanh đo tài nguyên (CPU core/RAM/disk): icon + used/total + bar tô theo ngưỡng (<70% teal · 70–90% amber · ≥90% red).",
    when: "Giám sát container; metrics trên AppCard.",
    props: [
      { name: "icon / label", type: "ReactNode / string" },
      { name: "used / total", type: "number" },
      { name: "unit", type: "string" },
      { name: "format", type: "(v)=>string" },
    ],
    looksLike: ["dòng đo tài nguyên có icon", "cpu ram đĩa dạng dòng"],
    vs: [
      { name: "MetricGauge", useThisWhen: "Nhiều chỉ số xếp thành DÒNG, so sánh được với nhau (CPU · RAM · đĩa)." },
    ],
  },
  {
    name: "AppCard",
    group: "Deploy",
    import: "@/components/dsvh/ui/deploy/AppCard",
    file: "ui/deploy/AppCard.tsx",
    purpose: "Thẻ app catalog (one-click deploy): logo + tên + Badge category + mô tả + metrics core/RAM/disk (icon+số) + nút hành động. Hover-lift.",
    when: "Danh mục app/template deploy sẵn.",
    props: [
      { name: "icon / name / category / description", type: "content" },
      { name: "metrics", type: "{core,ram,disk}" },
      { name: "actionLabel / onDeploy", type: "action" },
    ],
    looksLike: ["thẻ ứng dụng", "thẻ website đã triển khai"],
  },
  // Tách ra 13/08/2026 vì `/deploy` và `/templates` mỗi bên tự dựng lấy: icon đang chạy một bên
  // SpinnerIcon một bên ArrowClockwiseIcon, xong một bên text-success một bên text-teal, khe hở
  // space-y-4 vs space-y-3, một bên bọc Card một bên không. Component chỉ VẼ — phần tính trạng thái
  // ở lại từng màn vì mỗi màn có nguồn sự thật riêng.
  {
    name: "DeployStages",
    group: "Deploy",
    import: "@/components/dsvh/ui/deploy/DeployStages",
    file: "ui/deploy/DeployStages.tsx",
    purpose: "Danh sách chặng của một lượt triển khai đang chạy — icon trạng thái, nhãn, nhãn phụ, dòng mô tả, thanh tiến độ tuỳ chọn.",
    when: "Bất kỳ màn nào đang dựng/khôi phục và cần kể tiến trình theo chặng. KHÔNG tự dựng lại danh sách này bằng tay.",
    props: [
      { name: "items", type: "DeployStageItem[]" },
      { name: "title", type: "string" },
      { name: "subtitle", type: "string" },
      { name: "progress", type: "number" },
      { name: "labels", type: "Partial<{running,failed,doneSr,pending}>" },
    ],
    looksLike: ["danh sách bước đang chạy", "tiến trình triển khai", "checklist có spinner"],
    related: ["Stepper", "Progress"],
  },
  {
    name: "TemplateGallery",
    group: "Deploy",
    import: "@/components/dsvh/ui/deploy/TemplateGallery",
    file: "ui/deploy/TemplateGallery.tsx",
    purpose: "Lưới catalog app responsive (1→sm:2→lg:3) gồm nhiều AppCard — đúng ca 'chiều ngang rộng + metrics/category/action per-card'.",
    when: "Trang chọn template/app để deploy.",
    props: [
      { name: "items", type: "TemplateItem[]" },
      { name: "columns", type: "2|3" },
      { name: "onDeploy", type: "(id)=>void" },
    ],
    looksLike: ["lưới chọn mẫu", "thư viện template"],
  },
  {
    name: "MetricGauge",
    group: "Data Display",
    import: "@/components/dsvh/ui/data/MetricGauge",
    file: "ui/data/MetricGauge.tsx",
    purpose: "Đồng hồ đo 1 chỉ số (CPU/RAM/uptime): cung 270° tô theo ngưỡng (<70% teal · 70–90% amber · ≥90% red), số lớn ở giữa.",
    when: "Điểm nhấn một metric trên dashboard/monitoring; bổ trợ ResourceMeter.",
    props: [
      { name: "value / max", type: "number" },
      { name: "label / sublabel / unit", type: "string" },
      { name: "thresholds", type: "{warning,danger}" },
      { name: "tone", type: "'auto'|teal|amber|red|orange|ink" },
      { name: "size", type: "number" },
    ],
    looksLike: ["đồng hồ đo", "vòng cung chỉ số"],
    vs: [
      { name: "ResourceMeter", useThisWhen: "MỘT chỉ số làm điểm nhấn, vẽ dạng cung tròn — dùng khi nó là thứ đáng nhìn nhất trên màn." },
    ],
  },
  {
    name: "DNSRecordTable",
    group: "Deploy",
    import: "@/components/dsvh/ui/deploy/DNSRecordTable",
    file: "ui/deploy/DNSRecordTable.tsx",
    purpose: "Bảng bản ghi DNS (verify domain): badge loại + host + value mono có copy + TTL + trạng thái verify. Cuộn ngang trên mobile.",
    when: "Thêm domain / hướng dẫn trỏ DNS.",
    props: [
      { name: "records", type: "DNSRecord[]" },
      { name: "hideTtl", type: "boolean" },
    ],
    looksLike: ["bảng bản ghi dns", "cname và a record"],
  },
  {
    name: "ConfirmDialog",
    group: "Overlays",
    import: "@/components/dsvh/ui/overlay/ConfirmDialog",
    file: "ui/overlay/ConfirmDialog.tsx",
    purpose: "Hộp xác nhận dựng trên Modal; tone danger (nút đỏ + icon) + confirmText (gõ tên để bật nút xác nhận).",
    when: "Xác nhận hành động phá huỷ / quan trọng.",
    props: [
      { name: "open / onClose / onConfirm", type: "control" },
      { name: "title / description", type: "ReactNode" },
      { name: "tone", type: "'danger'|'default'" },
      { name: "confirmText", type: "string" },
      { name: "loading", type: "boolean" },
    ],
    looksLike: ["hộp thoại xác nhận", "hỏi có chắc không"],
    vs: [
      { name: "Modal", useThisWhen: "Đúng một câu hỏi có/không trước một hành động — không nhét thêm gì khác vào." },
    ],
  },
  {
    name: "DangerZone",
    group: "Deploy",
    import: "@/components/dsvh/ui/deploy/DangerZone",
    file: "ui/deploy/DangerZone.tsx",
    purpose: "Card viền đỏ liệt kê hành động phá huỷ (pause/xoá app…); mỗi mục mở ConfirmDialog tone danger.",
    when: "Đặt CUỐI tab Cài đặt, sau mọi khối thường — hành động không hoàn tác được thì không nằm chung chỗ với hành động sửa đổi bình thường.",
    props: [
      { name: "title", type: "string", note: 'mặc định "Danger Zone"' },
      {
        name: "actions",
        type: "DangerAction[]",
        note: "{ title, description, buttonLabel, confirmTitle, confirmDescription?, confirmText?, onConfirm } — confirmText có giá trị thì buộc gõ đúng chuỗi đó mới bấm được nút xác nhận (dùng cho xoá vĩnh viễn)",
      },
    ],
    looksLike: ["vùng nguy hiểm", "khối xoá vĩnh viễn"],
  },
  {
    name: "RepoPicker",
    group: "Deploy",
    import: "@/components/dsvh/ui/deploy/RepoPicker",
    file: "ui/deploy/RepoPicker.tsx",
    purpose: "Chọn repo import/deploy (icon provider + tên + badge private + updated, dòng chọn tô cam). Kèm BranchPicker (dropdown nhánh qua FloatingLayer).",
    when: "Bước import Git → deploy.",
    props: [
      { name: "repos", type: "Repo[]" },
      { name: "value / onChange", type: "repo id" },
      { name: "BranchPicker.branches", type: "string[]" },
      { name: "defaultBranch", type: "string" },
    ],
    looksLike: ["chọn kho mã nguồn", "chọn repository"],
  },
  {
    name: "TableToolbar",
    group: "Data Display",
    import: "@/components/dsvh/ui/data/TableToolbar",
    file: "ui/data/TableToolbar.tsx",
    purpose: "Thanh trên Table: search + filters + action chính; khi có selection đổi sang 'N đã chọn' + bulk actions. Responsive.",
    when: "Toolbar cho danh sách/bảng có lọc & thao tác hàng loạt.",
    props: [
      { name: "search / onSearchChange", type: "controlled" },
      { name: "selectedCount / onClearSelection", type: "selection" },
      { name: "filters / bulkActions / actions", type: "ReactNode" },
    ],
    looksLike: ["thanh công cụ trên bảng", "bộ lọc phía trên danh sách"],
    related: ["Table"],
  },
  {
    name: "Tooltip",
    group: "Components",
    import: "@/components/dsvh/ui/Tooltip",
    file: "ui/Tooltip.tsx",
    purpose: "Câu giải thích ngắn hiện khi rê chuột/focus, KHÔNG chứa nội dung bấm được — cần bấm thì dùng Popover.",
    when: "Explain icon-only buttons (pair with aria-label).",
    props: [
      { name: "content", type: "ReactNode" },
      { name: "side", type: "'top'|'bottom'|'left'|'right'" },
    ],
    looksLike: ["chú thích khi rê chuột", "bong bóng giải thích"],
    vs: [
      { name: "Popover", useThisWhen: "Chỉ một câu giải thích, KHÔNG có gì bấm được bên trong." },
    ],
  },
  {
    name: "TreeGuide · TreeRow",
    group: "Data Display",
    import: "@/components/dsvh/ui/data/TreeGuide",
    file: "ui/data/TreeGuide.tsx",
    purpose: "Nét nối cây thư mục (├─ └─) cho dòng CON, và `TreeRow` bọc sẵn nét nối + nội dung. Đường kẻ trung tính `stroke`, hỗ trợ lồng nhiều cấp qua `depth`.",
    when: "Bảng/danh sách có quan hệ CHA–CON: cụm nhiều thành phần ở /dashboard, cây thư mục, cây tài nguyên. Đừng thụt lề bằng `pl-8` — thụt lề không nói dòng đó thuộc về AI, cũng không nói còn phần tử nữa hay đã hết.",
    props: [
      { name: "last", type: "boolean — phần tử cuối nhánh, đường dọc dừng ở khuỷu" },
      { name: "depth", type: "number (1 = con trực tiếp); mỗi cấp thêm một đường dọc để nhánh trên không đứt" },
    ],
    looksLike: ["nét nối cây", "dòng cha con"],
    related: ["Table"],
  },
  {
    name: "Progress",
    group: "Data Display",
    import: "@/components/dsvh/ui/Progress",
    file: "ui/Progress.tsx",
    purpose: "Thanh tiến độ cho tác vụ ĐO ĐƯỢC phần trăm; không đo được thì dùng Spinner.",
    when: "Task/quota/upload progress.",
    props: [
      { name: "value", type: "number 0-100" },
      {
        name: "tone",
        type: "'orange'|'teal'|'amber'|'ink'|'red'",
        note:
          "`amber` thêm 14/08/2026 cho bậc CẢNH BÁO của luật #7 — trước đó chỉ có teal và đỏ, nên chỗ 'sắp chạm ngưỡng' phải chọn giữa nói quá (đỏ) và nói thiếu (teal). Đừng thay bằng `orange`: cam là màu THƯƠNG HIỆU (nút chính, tiến độ trung tính), amber là màu TRẠNG THÁI.",
      },
      { name: "showValue", type: "boolean" },
    ],
    looksLike: ["thanh tiến độ", "phần trăm hoàn thành"],
    vs: [
      { name: "Spinner", useThisWhen: "ĐO được phần trăm." },
      { name: "TableUsageCell", useThisWhen: "Thanh tiến độ đứng riêng, ngoài bảng." },
    ],
    related: ["DeployStages", "InfoTile"],
  },
  {
    name: "StatTile",
    group: "Data Display",
    import: "@/components/dsvh/ui/StatTile",
    file: "ui/StatTile.tsx",
    purpose: "Ô số liệu nhỏ: nhãn + số lớn + biến động. Delta dương teal, âm cam (luật #7).",
    when: "Dashboard KPI groups (pair with CountUp).",
    props: [
      { name: "label", type: "string" },
      { name: "value", type: "ReactNode" },
      { name: "delta", type: "string" },
      { name: "positive", type: "boolean" },
    ],
    looksLike: ["ô số liệu nhỏ có biến động", "số kèm mũi tên tăng giảm"],
    vs: [
      { name: "StatCard", useThisWhen: "Ô NHỎ có phần biến động (mũi tên tăng/giảm), nhét được vào trong một thẻ khác." },
    ],
  },
  {
    name: "Select",
    group: "Forms",
    import: "@/components/dsvh/ui/form/Select",
    file: "ui/form/Select.tsx",
    purpose: "Custom dropdown select (not native), options with disabled, sizes, error.",
    when: "Choose one value from a list in forms.",
    props: [
      { name: "size", type: "'sm' | 'md' | 'lg'", note: "mặc định `md` — chiều cao trường. Đặt chiều cao qua `className` KHÔNG có tác dụng (gate FIELDCLS chặn): `className` gắn vào div gốc chứ không vào ô nhập." },
      { name: "value/onChange/options", type: "controlled" },
      { name: "className", type: "string", note: "gốc mang `w-full` (đúng cho một trường trong biểu mẫu). Đặt trong HÀNG LỌC nằm ngang thì phải `w-auto min-w-[…]` — `min-w-*` một mình KHÔNG ghi đè `w-full` vì khác nhóm twMerge, và hậu quả là mỗi ô lọc chiếm trọn một dòng. Đo thật 11/08 ở /admin/staff." },
    ],
    looksLike: ["ô chọn xổ xuống", "chọn một trong danh sách"],
    vs: [
      { name: "Combobox", useThisWhen: "Danh sách NGẮN, nhìn hết được trong một tầm cuộn." },
    ],
  },
  {
    name: "Textarea",
    group: "Forms",
    import: "@/components/dsvh/ui/form/Textarea",
    file: "ui/form/Textarea.tsx",
    purpose: "Ô nhập nhiều dòng, cùng thang cỡ và cùng cách báo lỗi với Input — dùng cho mô tả, ghi chú, dán biến môi trường.",
    when: "Long text entry.",
    props: [
      { name: "size", type: "'sm' | 'md' | 'lg'", note: "mặc định `md` — chiều cao trường. Đặt chiều cao qua `className` KHÔNG có tác dụng (gate FIELDCLS chặn): `className` gắn vào div gốc chứ không vào ô nhập." },
      { name: "autoGrow", type: "boolean" },
    ],
    looksLike: ["ô nhập nhiều dòng", "ô mô tả dài"],
    vs: [
      { name: "Input", useThisWhen: "Nhiều dòng — mô tả, ghi chú, dán khối văn bản." },
    ],
  },
  {
    name: "Checkbox",
    group: "Forms",
    import: "@/components/dsvh/ui/form/Checkbox",
    file: "ui/form/Checkbox.tsx",
    purpose: "Ô đánh dấu nhiều lựa chọn, có cả trạng thái nửa vời (indeterminate) cho ô chọn-tất-cả ở đầu bảng.",
    when: "Multi-select / toggle confirmable options.",
    props: [
      { name: "checked", type: "boolean" },
      { name: "onChange", type: "(checked: boolean) => void" },
      { name: "indeterminate", type: "boolean", note: "ô 'chọn tất cả' khi mới chọn một phần — vẽ gạch ngang thay vì dấu tick" },
      { name: "disabled", type: "boolean" },
      { name: "label", type: "ReactNode", note: "nhãn cạnh ô; bỏ trống thì phải tự gắn aria-label" },
      { name: "size", type: "'sm' | 'md' | 'lg'", note: "mặc định md; trong bảng dùng sm" },
      { name: "id / name", type: "string" },
    ],
    looksLike: ["ô đánh dấu", "tick chọn nhiều mục"],
    vs: [
      { name: "Switch", useThisWhen: "Chọn nhiều mục trong một danh sách; thay đổi chỉ có hiệu lực khi bấm Lưu." },
      { name: "RadioGroup", useThisWhen: "Chọn được NHIỀU mục cùng lúc." },
    ],
  },
  {
    name: "RadioGroup",
    group: "Forms",
    import: "@/components/dsvh/ui/form/RadioGroup",
    file: "ui/form/RadioGroup.tsx",
    purpose: "Nhóm chọn MỘT trong nhiều — dùng khi số lựa chọn ít và cần thấy hết cùng lúc; nhiều hơn ~6 lựa chọn thì đổi sang Select.",
    when: "Pick one exclusive option.",
    props: [
      { name: "value", type: "string", note: "giá trị đang chọn" },
      { name: "onChange", type: "(value: string) => void" },
      { name: "options", type: "RadioOption[]", note: "{ value, label, disabled? }" },
      { name: "name", type: "string", note: "gom nhóm khi submit form thật" },
      { name: "disabled", type: "boolean", note: "khoá cả nhóm" },
    ],
    looksLike: ["nút tròn chọn một", "nhóm lựa chọn tròn"],
    vs: [
      { name: "Checkbox", useThisWhen: "Chỉ chọn được MỘT trong nhóm." },
    ],
  },
  {
    name: "Switch",
    group: "Forms",
    import: "@/components/dsvh/ui/form/Switch",
    file: "ui/form/Switch.tsx",
    purpose: "Instant on/off toggle (bg-orange when on). Optional `onLabel`/`offLabel` renders a SHORT status label INSIDE the track itself instead of an external `label` — track width is tuned SNUG for a short 1-word label (vd 'Bật'/'Tắt'), one fixed width for both states (no layout shift on toggle), thumb order flips via flex instead of translate-x. OFF fill is SOLID `bg-ink-3` (no alpha) — same treatment as ON's solid `bg-orange`, just a neutral hue. Tried alpha-blending both the `--dsvh-line-*` scale AND `ink-3` itself at 10–35% first — any alpha blend over a white table background desaturates back toward white regardless of the source color's chroma, so nothing short of an opaque fill reads as a confidently-filled ~56px pill. White label text on `ink-3` ≈ 4.6:1, enough for the small bold label. Thumb size is derived BACKWARD from the desired inset (`thumb = trackHeight − 2×inset`) with `padding-x = inset − border`, so the white thumb sits an equal 2/3/4px (sm/md/lg) from all four edges — a fixed thumb height ignores vertical padding and is centered by `items-center`, so sizing the thumb independently of `px-*` is what made it look squashed against the top/bottom edge. The in-track label carries its own `px-*` so it clears the rounded cap.",
    when: "Immediate setting toggle. Use `onLabel`/`offLabel` in dense contexts (status column in a table with many rows) where an external label would eat too much horizontal space — default width fits a short 1-word label; longer text needs `className=\"w-<n>\"` to widen the track (merges via twMerge, no separate prop).",
    props: [
      { name: "checked / onChange", type: "controlled" },
      { name: "label", type: "ReactNode — nhãn NGOÀI track (mặc định)" },
      { name: "onLabel / offLabel", type: "string — nhãn NGẮN (lý tưởng 1 từ, vd 'Bật'/'Tắt') hiện TRONG track, thay cho `label` khi cả hai đều có mặt" },
      { name: "size", type: "'sm'|'md'|'lg'" },
    ],
    looksLike: ["công tắc bật tắt", "gạt on off"],
    vs: [
      { name: "Checkbox", useThisWhen: "Bật/tắt MỘT thứ và có hiệu lực NGAY, không cần nút Lưu." },
    ],
  },
  {
    name: "Label",
    group: "Forms",
    import: "@/components/dsvh/ui/form/Label",
    file: "ui/form/Label.tsx",
    purpose: "Nhãn của một control: cỡ `text-caption`, màu `text-ink-2`, có dấu sao khi bắt buộc.",
    when: "Khi control đứng RIÊNG, không bọc `FormField` (vd nhãn cạnh một công tắc trong hàng cài đặt). Có chỉ dẫn hoặc thông báo lỗi đi kèm thì dùng `FormField` — nó đã gói sẵn cả ba.",
    props: [
      { name: "htmlFor", type: "string", note: "phải khớp id của control, nếu không bấm vào nhãn sẽ không focus" },
      { name: "required", type: "boolean", note: "thêm dấu sao cam" },
      { name: "children", type: "ReactNode" },
    ],
    looksLike: ["nhãn của ô nhập", "chữ đứng trên trường nhập"],
    related: ["FormField"],
    vs: [
      { name: "FormField", useThisWhen: "Chỉ cần MỖI cái nhãn — control đứng riêng, không có chỉ dẫn hay lỗi đi kèm." },
    ],
  },
  {
    name: "FormField",
    group: "Forms",
    import: "@/components/dsvh/ui/form/FormField",
    file: "ui/form/FormField.tsx",
    purpose: "Khung bọc quanh một control: nhãn, chỉ dẫn, thông báo lỗi và dấu bắt buộc — để mọi trường trong app xếp nhãn và báo lỗi giống hệt nhau.",
    when: "Consistent form field layout.",
    props: [
      { name: "label", type: "string" },
      { name: "hint", type: "string", note: "chỉ dẫn phụ, hiện khi CHƯA lỗi" },
      { name: "error", type: "string", note: "có giá trị thì thay chỗ hint và đổi sang tone lỗi" },
      { name: "required", type: "boolean", note: "thêm dấu sao vào nhãn" },
      { name: "htmlFor", type: "string", note: "phải khớp id của control bên trong, nếu không nhãn bấm vào không focus" },
      { name: "children", type: "ReactNode", note: "control thật: Input / Select / Textarea…" },
    ],
    looksLike: ["nhãn kèm ô nhập", "báo lỗi dưới trường"],
    vs: [
      { name: "Label", useThisWhen: "Cần nhãn + chỉ dẫn + báo lỗi + dấu bắt buộc gói sẵn trong một khối." },
    ],
    related: ["Label"],
  },
  {
    name: "Modal",
    group: "Overlays",
    import: "@/components/dsvh/ui/overlay/Modal",
    file: "ui/overlay/Modal.tsx",
    purpose: "Center dialog + backdrop (close on backdrop/Esc); trạng thái có icon theo tone (info/success/warning/error, màu từ status.ts); bề rộng chặn min/max theo size (sm 400–500 · md 460–640 · lg 540–800 · xl 620–1000 · 2xl 820–1160, w-auto vừa nội dung); tiêu đề + mô tả tách 2 khối; header/footer LUÔN cố định, chỉ phần children ở giữa cuộn (`overflow-y-auto`) khi nội dung vượt chiều cao.",
    when: "Confirm / short form / thông báo có icon. Form dài hơn vẫn dùng được (size lg/xl) nhờ nội dung tự cuộn — không cần đổi sang Drawer chỉ vì form dài, trừ khi cố ý muốn dạng panel cạnh màn hình. TRẦN NỚI MỘT NẤC 08/08 (480/620/780/980 → 500/640/800/1000): hàng \"biến môi trường\" ở /admin/templates cần 728px mà `lg` cũ chỉ chừa 730px, sát tới mức ô giá trị nở một chút là nút X rớt xuống dòng riêng. Hộp thoại canh giữa màn mà chiều cao đổi theo thao tác người dùng thì nên ghim (`fixedHeight`) — xem ghi chú trong Modal.tsx.",
    props: [
      { name: "open / onClose", type: "control" },
      { name: "title / description", type: "ReactNode" },
      { name: "tone", type: "'default'|'info'|'success'|'warning'|'error'" },
      { name: "icon", type: "ReactNode (đè icon tone)" },
      { name: "size", type: "'sm'|'md'|'lg'|'xl'|'2xl' — 2xl (820–1160) thêm 07/09/2026 cho hộp thoại NHIỀU BƯỚC có bảng bản ghi DNS. Thêm bậc chứ KHÔNG nới `xl`: `xl` có 6 nơi gọi và hai trong số đó tính bố cục cột theo đúng bề ngang cũ. LƯU Ý `min-w` mới là con số quyết định — panel để `w-auto` nên nó co vừa nội dung rồi mới bị kẹp; bước đầu của một wizard chỉ có một ô nhập thì nó rơi đúng về `min-w`, `max-w` không bao giờ chạm tới" },
      { name: "fixedHeight", type: "boolean|string — mặc định false (co vừa nội dung, đúng cho confirm ngắn). Bật khi nội dung DAO ĐỘNG nhiều theo lựa chọn người dùng (field điều kiện, danh sách thêm/bớt) — ghim cao để hộp thoại không đổi cao/thấp và nút footer không nhảy vị trí giữa các lượt thao tác. `true` = ghim mức TRẦN (100vh-3rem, dùng khi nội dung thật sự dài). Chuỗi = ghim mức TỰ CHỌN thấp hơn trần (vd 'h-[min(820px,calc(100vh-3rem))]') — đo thật nội dung trước khi chọn số, mức trần cho nội dung ngắn để lại khoảng trắng thừa." },
      { name: "footer / children", type: "ReactNode" },
    ],
    looksLike: ["cửa sổ nổi giữa màn", "popup che nền"],
    vs: [
      { name: "Drawer", useThisWhen: "Bắt buộc quyết xong mới đi tiếp; che nền để cắt mọi thứ khác." },
      { name: "ConfirmDialog", useThisWhen: "Nội dung tự do: biểu mẫu, danh sách, nhiều bước." },
    ],
  },
  {
    name: "Drawer",
    group: "Overlays",
    import: "@/components/dsvh/ui/overlay/Drawer",
    file: "ui/overlay/Drawer.tsx",
    purpose: "Tấm trượt từ mép màn hình, giữ nguyên ngữ cảnh phía sau — dùng cho thao tác phụ (bộ lọc, xem nhanh); việc buộc phải quyết xong mới đi tiếp thì dùng Modal.",
    when: "Longer detail / side form.",
    props: [
      { name: "open", type: "boolean" },
      { name: "onClose", type: "() => void", note: "bấm nền mờ hoặc Esc đều gọi hàm này" },
      { name: "side", type: "'left' | 'right'", note: "mặc định right" },
      { name: "title", type: "ReactNode" },
      { name: "width", type: "string", note: "class bề rộng, ví dụ 'w-[420px]'" },
    ],
    looksLike: ["tấm trượt từ mép", "panel bên phải"],
    vs: [
      { name: "Modal", useThisWhen: "Thao tác PHỤ, cần giữ nguyên ngữ cảnh phía sau để đối chiếu (bộ lọc, xem nhanh)." },
    ],
  },
  {
    name: "Alert",
    group: "Overlays",
    import: "@/components/dsvh/ui/overlay/Alert",
    file: "ui/overlay/Alert.tsx",
    purpose: "Dải thông báo NẰM TRONG trang, tồn tại tới khi người dùng xử lý — khác Toast là thứ tự tắt sau vài giây.",
    when: "Persistent in-page message.",
    props: [
      { name: "tone", type: "Status", note: "info · success · warning · error — lấy từ status.ts, KHÔNG tự chế màu" },
      { name: "variant", type: "'soft' | 'loud'", note: "soft nằm trong trang, loud dành cho cảnh báo chặn" },
      { name: "title", type: "ReactNode" },
      { name: "children", type: "ReactNode", note: "phần diễn giải" },
      { name: "onClose", type: "() => void", note: "có truyền thì hiện nút đóng" },
    ],
    looksLike: ["dải thông báo trong trang", "khung cảnh báo"],
    vs: [
      { name: "ToastProvider / useToast", useThisWhen: "Việc CÒN PHẢI XỬ LÝ — nằm trong trang, tồn tại tới khi người dùng làm gì đó." },
    
      { name: "Note", useThisWhen: "Câu giải thích TĨNH, luôn đúng, không phải trạng thái — không cần trình đọc màn hình ngắt lời." },
    ],
  },
  {
    name: "Popover",
    group: "Overlays",
    import: "@/components/dsvh/ui/overlay/Popover",
    file: "ui/overlay/Popover.tsx",
    purpose: "Khối nổi có thể chứa nội dung tương tác (nút, ô nhập) — nếu chỉ cần một câu giải thích thì dùng Tooltip, đừng dùng cái này.",
    when: "Context menu / small form.",
    props: [
      { name: "trigger", type: "ReactNode", note: "phần tử bấm để mở" },
      { name: "children", type: "ReactNode", note: "nội dung nổi" },
      { name: "side", type: "'top' | 'bottom' | 'left' | 'right'" },
      { name: "align", type: "'start' | 'center' | 'end'" },
    ],
    looksLike: ["khối nổi có nội dung bấm được", "bong bóng có nút bên trong"],
    vs: [
      { name: "Tooltip", useThisWhen: "Bên trong có thứ bấm/nhập được — lúc đó tooltip không dùng nổi vì nó tắt khi rời chuột." },
    ],
  },
  {
    name: "ToastProvider / useToast",
    group: "Overlays",
    import: "@/components/dsvh/ui/overlay/Toast",
    file: "ui/overlay/Toast.tsx",
    purpose: "Thông báo thoáng qua ở góc màn, tự tắt — báo việc ĐÃ xong; việc còn phải xử lý thì dùng Alert. Bọc ToastProvider một lần ở layout gốc rồi gọi useToast() ở bất kỳ đâu.",
    when: "Ephemeral success/error feedback.",
    props: [
      { name: "toast(opts)", type: "(opts: ToastOptions) => string", note: "trả về id để tự đóng sớm" },
      { name: "dismiss(id)", type: "(id: string) => void" },
      { name: "opts.tone", type: "Status", note: "mặc định info" },
      { name: "opts.duration", type: "number", note: "ms, mặc định 4000" },
      { name: "opts.title / description", type: "ReactNode" },
    ],
    looksLike: ["thông báo góc màn", "thông báo tự tắt"],
    vs: [
      { name: "Alert", useThisWhen: "Việc ĐÃ XONG — nổi ở góc màn rồi tự tắt sau vài giây." },
    ],
  },
  {
    name: "Tabs",
    group: "Navigation",
    import: "@/components/dsvh/ui/nav/Tabs",
    file: "ui/nav/Tabs.tsx",
    purpose: "Underline tabs, keyboard nav, aria roles. `label` là ReactNode — ICON ĐẶT TRƯỚC TEXT là cách dùng chuẩn, bọc `<span className=\"inline-flex items-center gap-1.5\">` với icon `size={15}`. Quy ước này đang chạy thật ở /admin/deployments và /admin/plans nhưng trước 05/08/2026 mỗi nơi tự gõ lại vì chưa được tài liệu hoá.",
    when: "Đổi view trong một khu vực. Có icon thì đặt trước text; chỉ bỏ icon khi nhãn đã tự đủ rõ (vd Tất cả / Đang chạy).",
    props: [
      { name: "tabs", type: "TabItem[] = { id, label: ReactNode, content: ReactNode, disabled? }[]" },
      { name: "defaultTab", type: "string? — chế độ TỰ GIỮ state" },
      { name: "value", type: "string? — chế độ ĐIỀU KHIỂN: tab đang mở do nơi gọi quyết (08/08). Cần khi tab phải đồng bộ với thứ khác: /admin/settings ghi tab vào URL `?tab=email` để F5 và gửi link còn đúng chỗ" },
      { name: "onChange", type: "(id: string) => void" },
    ],
    looksLike: ["tab đổi khu vực", "thanh tab gạch chân"],
    vs: [
      { name: "TabsNav", useThisWhen: "Đổi view TẠI CHỖ, không đổi đường dẫn — không cần gửi link riêng cho từng tab." },
      { name: "SegmentedControl", useThisWhen: "Đổi hẳn KHU VỰC nội dung bên dưới." },
    ],
    related: ["Accordion"],
  },
  {
    name: "TabsNav",
    group: "Navigation",
    import: "@/components/dsvh/ui/nav/Tabs",
    file: "ui/nav/Tabs.tsx",
    purpose: "Tab ĐI THEO ROUTE — cùng vẻ ngoài với `Tabs` (chung `tabTriggerClass` nên không trôi khỏi nhau) nhưng mỗi đầu tab là một `<Link>`, trạng thái chọn đọc từ `usePathname()`. Ngữ nghĩa là `<nav>` + `aria-current`, KHÔNG phải `role=\"tablist\"`: vai trò tab của ARIA bắt buộc điều khiển panel cùng tài liệu, mà đây là điều hướng sang màn khác.",
    when: "Mỗi mục là một MÀN riêng cần gửi link được, cần nút Back chạy đúng, cần F5 giữ nguyên chỗ đang đứng (vd cụm /profile). Đổi view tại chỗ (lọc bảng) thì dùng `Tabs`. Tab gốc của cụm PHẢI đặt `exact: true`, nếu không route con làm sáng cả hai tab.",
    props: [
      { name: "items", type: "TabNavItem[] = { href, label: ReactNode, icon?: ReactNode, exact?, disabled? }[] — icon là ANH EM RIÊNG của label (shrink-0 được), đừng nhét icon vào trong label" },
      { name: "label", type: "string — nhãn vùng điều hướng cho trình đọc màn hình" },
      { name: "className", type: "string" },
    ],
    looksLike: ["tab theo đường dẫn", "tab đổi url"],
    vs: [
      { name: "Tabs", useThisWhen: "Mỗi tab là một MÀN riêng: cần gửi link được, nút Back chạy đúng, F5 giữ nguyên chỗ đang đứng." },
    ],
  },
  {
    name: "Breadcrumb",
    group: "Navigation",
    import: "@/components/dsvh/ui/nav/Breadcrumb",
    file: "ui/nav/Breadcrumb.tsx",
    purpose: "Đường dẫn phân cấp về trang cha — dùng khi trang nằm sâu từ 3 tầng trở lên, nông hơn thì chỉ cần nút quay lại.",
    when: "Show location in nested pages.",
    props: [
      { name: "items", type: "BreadcrumbItem[]", note: "{ label, href? } — mục CUỐI bỏ href vì đó là trang đang đứng" },
      { name: "className", type: "string" },
    ],
    looksLike: ["đường dẫn phân cấp", "lối về trang cha"],
  },
  {
    name: "Pagination",
    group: "Navigation",
    import: "@/components/dsvh/ui/nav/Pagination",
    file: "ui/nav/Pagination.tsx",
    purpose: "Thanh chuyển trang có rút gọn dấu … — dùng cho danh sách đếm được tổng số; danh sách trôi vô hạn thì dùng nút tải thêm.",
    when: "Paginate grids/lists (Table has its own).",
    props: [
      { name: "page", type: "number", note: "trang hiện tại, đếm từ 1" },
      { name: "totalPages", type: "number" },
      { name: "onPageChange", type: "(page: number) => void" },
      { name: "siblingCount", type: "number", note: "số trang hiện hai bên trang hiện tại, mặc định 1; phần giữa rút thành dấu …" },
    ],
    looksLike: ["phân trang", "chuyển trang"],
  },
  {
    name: "Spinner",
    group: "Feedback",
    import: "@/components/dsvh/ui/nav/Spinner",
    file: "ui/nav/Spinner.tsx",
    purpose: "Vòng quay chờ cho tác vụ KHÔNG biết trước bao lâu; chờ có tiến độ đo được thì dùng Progress, còn chờ nạp một khối có hình dạng biết trước thì dùng Skeleton.",
    when: "Short inline loading (button submit).",
    props: [
      { name: "size", type: "'sm' | 'md' | 'lg'", note: "sm nằm trong nút, md trong khối, lg giữa trang" },
      { name: "className", type: "string" },
    ],
    looksLike: ["vòng quay chờ", "đang tải"],
    vs: [
      { name: "Skeleton", useThisWhen: "Không biết trước nội dung sắp hiện có hình dạng thế nào." },
      { name: "Progress", useThisWhen: "Không đo được phần trăm." },
    ],
  },
  {
    name: "Skeleton",
    group: "Feedback",
    import: "@/components/dsvh/ui/nav/Skeleton",
    file: "ui/nav/Skeleton.tsx",
    purpose: "Khung xám mô phỏng nội dung đang nạp, giữ nguyên chỗ để trang không nhảy khi dữ liệu về — luôn ưu tiên hơn Spinner khi biết trước bố cục.",
    when: "Loading list/table/card content.",
    props: [
      { name: "variant", type: "'text' | 'circle' | 'rect'", note: "dựng đúng hình khối sắp thay thế" },
      {
        name: "className",
        type: "string",
        note:
          "đặt bề rộng/cao/bo góc ở đây. Gộp bằng `cn()` từ 14/08/2026 — trước đó nối chuỗi thường nên `rounded-lg` của variant `rect` và `rounded-*` của nơi gọi cùng tồn tại, thắng thua do thứ tự trong stylesheet đã biên dịch chứ không do thứ tự viết. Đo ở khung xương /admin/dashboard: `rounded-card` ra 8px (variant thắng) trong khi `rounded-xl` ra 12px (nơi gọi thắng) — cùng cách viết, kết quả ngược nhau tuỳ tên lớp. Đây là luật 10 lặp lại ở nhóm BO GÓC thay vì cỡ chữ, nên `rounded-card` đã phải khai thêm vào `tv.ts` + `lib/utils.ts`; khai `cn()` không thôi chưa đủ vì tailwind-merge không tự biết khoá theme tự đặt.",
      },
    ],
    looksLike: ["khung xám đang nạp", "chỗ giữ tạm khi nạp"],
    vs: [
      { name: "Spinner", useThisWhen: "BIẾT trước bố cục — giữ chỗ để trang không nhảy khi dữ liệu về. Ưu tiên hơn Spinner." },
      { name: "Empty", useThisWhen: "ĐANG tải, chưa biết có dữ liệu hay không." },
    ],
  },
  {
    name: "Avatar",
    group: "Data Display",
    import: "@/components/dsvh/ui/data/Avatar",
    file: "ui/data/Avatar.tsx",
    purpose: "Ảnh đại diện. KHÔNG có ảnh ⇒ vẽ logo Vibe Host, không phải chữ viết tắt.",
    when: "Người dùng, nhân sự, người được giao việc.",
    props: [
      { name: "name", type: "string", note: "BẮT BUỘC — dùng cho aria-label/title, và cho chữ cái đầu nếu fallback='initials'" },
      { name: "src", type: "string | null", note: "null hoặc lỗi tải đều rơi về `fallback`" },
      { name: "fallback", type: "'logo' | 'initials'", note: "mặc định 'logo' (luật chốt 06/08). 'initials' chỉ cho ca hiếm — hai chữ cái trùng nhau rất dễ, đo được ở /admin/staff" },
      { name: "size", type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", note: "trong bảng dùng sm" },
      { name: "shape", type: "'circle' | 'square'", note: "circle cho người, square cho tổ chức/dự án" },
    ],
    looksLike: ["ảnh đại diện", "chữ viết tắt tên", "logo thay ảnh đại diện", "chưa đặt ảnh"],
    vs: [
      { name: "TableUserCell", useThisWhen: "Chỉ riêng ảnh/chữ viết tắt." },
    ],
  },
  {
    name: "Tag",
    group: "Data Display",
    import: "@/components/dsvh/ui/data/Tag",
    file: "ui/data/Tag.tsx",
    purpose: "Nhãn phân loại do NGƯỜI DÙNG gắn và gỡ được (bộ lọc đang áp dụng, từ khoá). Trạng thái do HỆ THỐNG sinh thì dùng Badge — hai thứ khác nhau về nghĩa nên không thay nhau.",
    when: "Selected filters, editable labels.",
    props: [
      { name: "children", type: "ReactNode" },
      { name: "tone", type: "'neutral' | 'accent' | 'success' | 'danger'", note: "mặc định neutral" },
      { name: "onRemove", type: "(e) => void", note: "có truyền thì hiện dấu × để gỡ" },
    ],
    looksLike: ["nhãn gỡ được", "chip có dấu x"],
    vs: [
      { name: "Badge", useThisWhen: "Nhãn do NGƯỜI DÙNG gắn và gỡ được: bộ lọc đang áp dụng, từ khoá." },
    ],
  },
  {
    name: "List / ListItem",
    group: "Data Display",
    import: "@/components/dsvh/ui/data/List",
    file: "ui/data/List.tsx",
    purpose: "Danh sách dọc mỗi dòng một bản ghi — dùng khi mỗi bản ghi chỉ có 1–2 thông tin; từ ba cột so sánh được trở lên thì dùng Table. Hai variant, chọn theo NGỮ CẢNH chứ không theo thẩm mỹ, đúng cặp từ `Empty` đang dùng: `block` tự mang khung để đứng một mình, `inline` không khung vì đã nằm trong một khối có khung.",
    when: "Member lists, settings rows, feeds. Nằm trong `Card`/tab thì BẮT BUỘC `inline` — bản `block` đặt vào trong `Card` là hai đường viền lồng nhau, mắt đọc ra hai bề mặt cho một nội dung. Đây là lỗi tái diễn (`Empty` dính ngày 11/08, thẻ \"Website sử dụng\" của /databases/[id] dính lại ngày 20/08) nên nay có gate FRAMENEST chặn.",
    props: [
      { name: "variant", type: "'block' | 'inline'", note: "mặc định `block`. `inline` bỏ khung + bỏ đệm ngang của hàng con (để chữ thẳng hàng với tiêu đề thẻ) và bỏ nền riêng của hàng; vạch ngăn giữ nguyên vì đó mới là thứ khiến nhiều dòng đọc ra MỘT danh sách" },
      { name: "ListItem.title", type: "ReactNode", note: "dòng chính" },
      { name: "ListItem.description", type: "ReactNode", note: "dòng phụ" },
      { name: "ListItem.leading", type: "ReactNode", note: "icon/avatar bên trái" },
      { name: "ListItem.trailing", type: "ReactNode", note: "giá trị hoặc nút bên phải" },
      { name: "ListItem.onClick", type: "() => void", note: "có truyền thì dòng thành bấm được (đổi nền khi rê chuột)" },
    ],
    looksLike: ["danh sách dọc", "mỗi dòng một bản ghi"],
    vs: [
      { name: "Table", useThisWhen: "Mỗi bản ghi chỉ có 1–2 thông tin và không ai đi so cột với cột." },
    ],
  },
  {
    name: "Empty",
    group: "Data Display",
    import: "@/components/dsvh/ui/data/Empty",
    file: "ui/data/Empty.tsx",
    purpose: "Trạng thái rỗng, hai variant: `inline` (mặc định, KHÔNG khung — dùng bên trong một khối đã có khung) và `block` (tự mang khung, đứng một mình giữa trang). Luật: luôn kèm action — màn trống không lối đi là chỗ người dùng mắc kẹt nhiều nhất.",
    when: "Khối đã tải xong mà không có dữ liệu. Chọn variant theo NGỮ CẢNH chứ không theo thẩm mỹ: nằm trong Card/tab thì `inline` (thêm khung thứ hai là hai đường viền lồng nhau), đứng một mình giữa trang thì `block` (không có khung thì nó trôi lơ lửng). Gộp từ hai bản rời ngày 11/08 — trước đó DSVH có một bản 0 nơi dùng còn app chạy bản khác ở 25 chỗ. LẦN GỘP THỨ HAI 19/08: hàng rỗng bên trong `Table` cũng tự vẽ một bản riêng (21 chỗ, không khai manifest, icon bọc khung) — nay nó gọi `Empty` variant inline, nên đây là trạng thái rỗng DUY NHẤT của app, cả trong lẫn ngoài bảng. Icon phải theo NGHĨA chứ không theo thói quen: rỗng-là-tin-tốt dùng dấu tích, chưa-đo-được dùng icon trung tính, chỉ hỏng thật mới dùng tam giác cảnh báo.",
    props: [
      { name: "title", type: "string", note: "BẮT BUỘC — nói rõ trống vì CHƯA CÓ hay vì bộ lọc không khớp; hai tình huống này cần hai câu và hai hành động khác nhau" },
      { name: "description", type: "ReactNode" },
      { name: "icon", type: "ReactNode", note: "dạng PHẦN TỬ: `icon={<BackupIcon size={40} />}`; icon trang trí nên nó xám (`text-ink-3`), không tô màu" },
      { name: "action", type: "ReactNode", note: "nút tạo mới hoặc nút xoá bộ lọc" },
      { name: "variant", type: "'inline' | 'block'", note: "mặc định inline" },
    ],
    looksLike: ["màn trống", "chưa có dữ liệu"],
    vs: [
      { name: "Skeleton", useThisWhen: "Đã tải xong và KHÔNG có dữ liệu." },
    ],
    related: ["Table"],
  },
  {
    name: "Separator",
    group: "Layout",
    import: "@/components/dsvh/ui/data/Separator",
    file: "ui/data/Separator.tsx",
    purpose: "Đường kẻ ngăn hai nhóm nội dung. Chỉ dùng khi khoảng trắng không đủ tách nhóm — kẻ nhiều làm trang vụn.",
    when: "Split sections/toolbars.",
    props: [
      { name: "orientation", type: "'horizontal' | 'vertical'", note: "dọc thì khối cha phải có chiều cao xác định" },
      { name: "className", type: "string" },
    ],
    looksLike: ["đường kẻ ngăn", "gạch phân cách"],
    related: ["Card / CardHeader"],
  },
  {
    name: "Kbd",
    group: "Components",
    import: "@/components/dsvh/ui/data/Kbd",
    file: "ui/data/Kbd.tsx",
    purpose: "Ô hiển thị phím tắt, dựng bằng thẻ <kbd> thật để công cụ đọc màn hình đọc đúng là phím.",
    when: "Show shortcuts.",
    props: [
      { name: "children", type: "ReactNode", note: "tên phím: ⌘ · Ctrl · K" },
    ],
    looksLike: ["ô hiển thị phím", "tên phím trong câu chữ"],
    related: ["Command"],
  },
  {
    name: "Accordion",
    group: "Navigation",
    import: "@/components/dsvh/ui/data/Accordion",
    file: "ui/data/Accordion.tsx",
    purpose: "Nhóm mục đóng-mở để giấu nội dung dài. Không dùng để giấu thông tin BẮT BUỘC phải đọc — cái gì quan trọng thì để mở sẵn.",
    when: "FAQ, nhóm cài đặt — những chỗ mục đóng-mở chỉ cần một dòng tiêu đề và nội dung chữ.\n\nKHÔNG dùng khi: (a) trạng thái mở do màn hình quyết (tự bung nhóm đang chạy/vừa hỏng) — component này giữ state nội bộ, không nhận `open`/`onOpenChange`; (b) đầu mục là một cụm giàu (icon trạng thái + huy hiệu + số đếm + đồng hồ) — tiêu đề bị `truncate` cắt cụt và chevron dựng sẵn thành mũi tên thứ hai; (c) mỗi mục cần khung riêng — thân bị ép `bg-surface-2 px-4 py-3`. Ba ca đó dùng `collapsible` của shadcn (nhóm `allowed`, có ghi lý do tại chỗ), như `project-logs` và `deploy-website` đang làm.",
    props: [
      { name: "items", type: "AccordionItem[]", note: "{ id, title, content, disabled? }" },
      { name: "type", type: "'single' | 'multiple'", note: "single tự đóng mục khác khi mở mục mới" },
      { name: "defaultOpen", type: "string | string[]", note: "id mở sẵn khi vào trang" },
    ],
    looksLike: ["mục đóng mở", "gập nội dung dài"],
    related: ["Tabs"],
  },
  {
    name: "Slider",
    group: "Forms",
    import: "@/components/dsvh/ui/form/Slider",
    file: "ui/form/Slider.tsx",
    purpose: "Thanh kéo chọn giá trị trong dải liên tục (RAM, CPU) — luôn hiện số bên cạnh, vì kéo tay không đặt được giá trị chính xác.",
    when: "Numeric range/level input.",
    props: [
      { name: "value", type: "number" },
      { name: "onChange", type: "(value: number) => void" },
      { name: "min / max / step", type: "number", note: "mặc định 0 / 100 / 1" },
      { name: "disabled", type: "boolean" },
    ],
    looksLike: ["thanh kéo chọn giá trị", "kéo để chỉnh ram cpu"],
  },
  {
    name: "Combobox",
    group: "Forms",
    import: "@/components/dsvh/ui/form/Combobox",
    file: "ui/form/Combobox.tsx",
    purpose: "Select CÓ Ô GÕ LỌC — dùng khi danh sách dài quá tầm cuộn (chọn vùng, chọn ảnh nền); danh sách ngắn thì dùng Select cho nhẹ.",
    when: "Long option lists.",
    props: [
      { name: "value", type: "T | null" },
      { name: "onChange", type: "(value: T) => void" },
      { name: "options", type: "ComboboxOption<T>[]", note: "{ value, label, disabled? }" },
      { name: "placeholder / emptyText", type: "string", note: "emptyText là câu hiện khi gõ không khớp gì" },
      { name: "size", type: "'sm' | 'md' | 'lg'" },
    ],
    looksLike: ["ô chọn có tìm kiếm", "gõ để lọc danh sách"],
    vs: [
      { name: "Select", useThisWhen: "Danh sách DÀI, phải gõ để lọc mới tìm ra." },
      { name: "Command", useThisWhen: "Chọn một GIÁ TRỊ để điền vào biểu mẫu." },
    ],
  },
  {
    name: "Command",
    group: "Overlays",
    import: "@/components/dsvh/ui/overlay/Command",
    file: "ui/overlay/Command.tsx",
    purpose: "Bảng lệnh mở bằng phím tắt (⌘K): gõ để tìm nhanh trang/thao tác. Là ĐƯỜNG TẮT chứ không thay điều hướng — mọi thứ trong này phải có lối tới bằng chuột.",
    when: "Quick actions/navigation.",
    props: [
      { name: "groups", type: "CommandGroup[]", note: "{ heading, items } — items: { id, label, icon?, onSelect, disabled? }" },
      { name: "open", type: "boolean" },
      { name: "onOpenChange", type: "(open: boolean) => void", note: "tự gọi khi bấm Esc hoặc bấm ra ngoài" },
      { name: "placeholder", type: "string" },
    ],
    looksLike: ["bảng lệnh gõ nhanh", "tìm nhanh bằng tổ hợp phím"],
    vs: [
      { name: "Combobox", useThisWhen: "Tìm nhanh TRANG hoặc THAO TÁC trong cả app, mở bằng tổ hợp phím." },
    ],
    related: ["Kbd"],
  },
  {
    name: "Card / CardHeader",
    group: "Components",
    import: "@/components/dsvh/ui/Card",
    file: "ui/Card.tsx",
    purpose: "Bề mặt trắng có viền — TĨNH theo mặc định. `CardHeader` dựng sẵn `<h3>` + dòng mô tả (`subtitle`) hoặc chú thích tooltip (`hint`) + slot hành động bên phải, KHÔNG có bộ phận con kiểu shadcn (Content/Footer): nội dung đặt thẳng vào `Card`, lớp bố cục (grid/flex) thì tự khai bằng `div`.",
    when: "Mọi khối nội dung. Thẻ BẤM ĐƯỢC thì bật hiệu ứng tường minh `<Card hoverShadow hoverLift>` — mặc định TẮT từ 08/08, vì trước đó 39 chỗ phải viết `={false}` để tắt trong khi thẻ bấm được đếm trên đầu ngón tay; và sau đợt 2 bỏ shadcn thì 23 tệp lặng lẽ mọc thêm hiệu ứng nhấc-lên mà không ai gõ thêm dòng nào.",
    props: [
      { name: "className", type: "string" },
      { name: "ref", type: "Ref<HTMLElement> — chuyển tiếp từ 08/08; /admin/dashboard cần DOM node để `scrollIntoView`" },
      { name: "hoverShadow / hoverLift", type: "boolean, MẶC ĐỊNH false — hai cái luôn bật/tắt cùng nhau, tắt lẻ một cái nhìn dở dang" },
      { name: "title", type: "ReactNode", note: "CardHeader" },
      { name: "subtitle", type: "ReactNode — dòng mô tả dưới tiêu đề (08/08). Thay cho việc tự gõ `<p className=\"-mt-3 mb-4 …\">` sau header: `-mt-3` ở đó là số ma, chỉ đúng khi lề dưới của CardHeader vẫn là 4", note: "CardHeader" },
      { name: "hint", type: "ReactNode — câu BỔ TRỢ, hiện trong tooltip cạnh tiêu đề thay vì chiếm một dòng (20/08). Ranh giới với `subtitle`: thứ người đọc cần thấy MỖI LẦN mở thẻ (vd \"34 khách hàng\") thì `subtitle`; thứ đọc một lần là hiểu (vd giải thích nền/tuỳ chỉnh ở /admin/ai-rules) thì `hint`. Trigger là `<button>` thật để mở được bằng bàn phím", note: "CardHeader" },
      { name: "icon", type: "ReactNode — anh em RIÊNG của title (shrink-0 được); nhét icon vào title sẽ bị `truncate` bóp gần về 0px khi thẻ hẹp", note: "CardHeader" },
      { name: "action", type: "ReactNode", note: "CardHeader right slot" },
      { name: "titleSub", type: "ReactNode — dòng phụ NẰM TRONG cụm icon+title (07/09/2026). Khác `subtitle` ở loại nội dung: `subtitle` là câu nói về CẢ THẺ nên canh mép trái thẻ (chốt 17/08); `titleSub` là THUỘC TÍNH của chính cái tên (\"thêm ngày nào\") nên thụt theo tên, đúng khuôn `TableIdentityCell`. Có nó thì `<h3>` bỏ `truncate` và thành khối hai dòng", note: "CardHeader" },
    ],
    looksLike: ["thẻ nội dung", "khối viền bo"],
    related: ["Separator"],
  },
  {
    name: "StatusDot",
    group: "Data Display",
    import: "@/components/dsvh/ui/data/StatusDot",
    file: "ui/data/StatusDot.tsx",
    purpose: "Chấm trạng thái VẬN HÀNH (idle/queued/building/deploying/live/stopped/failed/degraded) có pulse cho trạng thái đang diễn ra. Khác status.ts (4 tone semantic).",
    when: "Trạng thái deploy / container / database.",
    props: [
      { name: "status", type: "OpStatus" },
      { name: "label / showLabel / pulse", type: "tuỳ chọn" },
    ],
    looksLike: ["chấm trạng thái nhấp nháy", "chấm tình trạng triển khai"],
    related: ["Badge", "DeploymentTimeline"],
  },
  {
    name: "SocialButton",
    group: "Components",
    import: "@/components/dsvh/ui/auth/SocialButton",
    file: "ui/auth/SocialButton.tsx",
    purpose: "Nút đăng nhập provider full-width; truyền brand icon (Google/GitHub…) qua prop icon.",
    when: "OAuth login (Google/GitHub…).",
    props: [
      { name: "size", type: "'sm' | 'md' | 'lg'", note: "mặc định `md`, khớp thang chiều cao của `Button`." },
      { name: "icon", type: "ReactNode (brand-icons)" },
      { name: "...button", type: "native" },
    ],
    looksLike: ["đăng nhập google", "nút mang màu hãng"],
    related: ["AuthCard", "Button"],
  },
  {
    name: "PasswordInput",
    group: "Components",
    import: "@/components/dsvh/ui/auth/PasswordInput",
    file: "ui/auth/PasswordInput.tsx",
    purpose: "Ô mật khẩu: nút hiện/ẩn + thanh đo độ mạnh (showStrength), label/hint/error.",
    when: "Login / đăng ký / đổi mật khẩu.",
    props: [
      { name: "size", type: "'sm' | 'md' | 'lg'", note: "mặc định `md` — chiều cao trường. Đặt chiều cao qua `className` KHÔNG có tác dụng (gate FIELDCLS chặn): `className` gắn vào div gốc chứ không vào ô nhập." },
      { name: "label/hint/error", type: "string" },
      { name: "showStrength", type: "boolean" },
    ],
    looksLike: ["ô mật khẩu", "nút hiện mật khẩu"],
    related: ["AuthCard", "Input"],
  },
  {
    name: "PinInput",
    group: "Components",
    import: "@/components/dsvh/ui/auth/PinInput",
    file: "ui/auth/PinInput.tsx",
    purpose: "Nhập OTP nhiều ô: auto-advance, backspace lùi, dán full-code, onComplete.",
    when: "Xác thực 2 bước / đặt lại mật khẩu.",
    props: [
      { name: "value/onChange", type: "controlled" },
      { name: "length", type: "number (6)" },
      { name: "onComplete", type: "(v)=>void" },
    ],
    looksLike: ["ô nhập mã otp", "mã sáu số"],
    related: ["AuthCard", "Input"],
  },
  {
    name: "AuthCard",
    group: "Components",
    import: "@/components/dsvh/ui/auth/AuthCard",
    file: "ui/auth/AuthCard.tsx",
    purpose: "Khung căn giữa cho màn xác thực: nền canvas + thẻ surface, logo + title + subtitle + footer.",
    when: "Login / register / reset password.",
    props: [
      { name: "title", type: "string" },
      { name: "subtitle / footer / brand", type: "ReactNode" },
    ],
    looksLike: ["khung đăng nhập", "thẻ giữa màn đăng nhập"],
    related: ["PasswordInput", "PinInput", "SocialButton"],
  },
  {
    name: "SegmentedControl",
    group: "Components",
    import: "@/components/dsvh/ui/SegmentedControl",
    file: "ui/SegmentedControl.tsx",
    purpose: "Chọn 1 trong vài mục ngắn (view/filter), mục active nổi trên rãnh surface-2. Nhẹ hơn Tabs (không đổi panel).",
    when: "Đổi view/chế độ tại chỗ, 2–4 lựa chọn.",
    props: [
      { name: "options", type: "{value,label,icon?,disabled?}[]" },
      { name: "value / onChange", type: "controlled" },
      { name: "size / fullWidth", type: "tuỳ chọn" },
    ],
    looksLike: ["nút gạt vài lựa chọn ngắn", "đổi chế độ tại chỗ"],
    vs: [
      { name: "Tabs", useThisWhen: "Đổi CÁCH XEM cùng một nội dung (2–4 lựa chọn ngắn), nhẹ hơn, không đổi panel." },
    ],
  },
  {
    name: "SourcePicker",
    group: "Deploy",
    import: "@/components/dsvh/ui/deploy/SourcePicker",
    file: "ui/deploy/SourcePicker.tsx",
    purpose: "Lưới thẻ chọn NGUỒN deploy (GitHub/ZIP/URL git/Vercel/Template/HTML). Icon (brand-icons cho GitHub/Vercel) + mô tả; thẻ chọn viền cam + tick; badge cho Beta/Sắp có.",
    when: "Bước 1 của luồng deploy — chọn nguồn.",
    props: [
      { name: "options", type: "SourceOption[] (value,label,description?,icon,badge?,disabled?)" },
      { name: "value / onChange", type: "controlled (string|null)" },
      { name: "columns", type: "2 | 3" },
    ],
    looksLike: ["chọn nguồn triển khai", "git hay docker"],
  },
  {
    name: "Stepper",
    group: "Components",
    import: "@/components/dsvh/ui/Stepper",
    file: "ui/Stepper.tsx",
    purpose: "Chỉ báo tiến trình nhiều bước (khung luồng deploy/tạo DB). Bước xong=cam+tick, hiện tại=viền cam, sắp tới=mờ. Ngang hoặc dọc.",
    when: "Luồng nhiều bước (deploy wizard, tạo database…).",
    props: [
      { name: "steps", type: "{label,description?}[]" },
      { name: "current", type: "number (0-based; < current = xong)" },
      { name: "orientation", type: "'horizontal'|'vertical'" },
    ],
    looksLike: ["các bước một hai ba", "chỉ báo tiến trình nhiều bước"],
    vs: [
      { name: "DeploymentTimeline", useThisWhen: "Tiến trình đang diễn ra, biết trước có mấy bước (wizard tạo mới)." },
    ],
    related: ["DeployStages"],
  },
  {
    name: "SubdomainInput",
    group: "Deploy",
    import: "@/components/dsvh/ui/deploy/SubdomainInput",
    file: "ui/deploy/SubdomainInput.tsx",
    purpose: "Nhập subdomain + suffix cố định (.dev.matbao.ai) + trạng thái check trùng (idle/checking/available/taken/invalid/check_failed). Tự lọc ký tự a-z 0-9 -. Suffix nằm TRONG khung viền, cùng hàng với ô nhập.",
    when: "MỌI chỗ đặt subdomain: /deploy · /templates · /project/domains. Đừng dựng tay — bản dựng tay ở /deploy từng đặt suffix bằng `absolute right-3` + `pr-32`, và khi Input trả className về div gốc thì suffix rơi hẳn ra ngoài khung viền (07/08).",
    props: [
      { name: "value / onChange", type: "controlled (value đã lọc)" },
      { name: "status", type: "SubdomainStatus — check_failed KHÁC taken: chưa hỏi được máy chủ, không phải tên hỏng" },
      { name: "suffix", type: "string ('.dev.matbao.ai')" },
      { name: "message", type: "string? — đè chữ mặc định của status bằng lý do CỤ THỂ từ server (vd taken/reserved)" },
      { name: "action", type: "ReactNode? — nút cùng hàng với ô nhập (vd 'Tạo ngẫu nhiên')" },
      { name: "messageAction", type: "ReactNode? — nút thuộc về CÂU thông báo (vd 'Thử lại' khi check_failed)" },
      { name: "inputRef", type: "Ref<HTMLInputElement>? — kéo con trỏ về ô khi validate hỏng" },
    ],
    looksLike: ["ô nhập tên miền phụ", "đuôi domain cố định"],
  },
  {
    name: "DropdownMenu",
    group: "Components",
    import: "@/components/dsvh/ui/overlay/DropdownMenu",
    file: "ui/overlay/DropdownMenu.tsx",
    purpose: "Menu ngữ cảnh chuẩn (icon, phím tắt, mục danger, separator, mục chọn-một) dựng trên FloatingLayer (portal + né mép). Thay các Popover-menu chế tay.",
    when: "Menu hành động trong bảng/card/toolbar; hoặc nhóm CHỌN MỘT gọn (giao diện, sắp xếp theo…) khi không đáng dựng cả một Select.",
    props: [
      { name: "trigger", type: "ReactNode" },
      {
        name: "items",
        type: "MenuItem[] ({label,icon?,onSelect?,danger?,shortcut?,selected?} | {separator:true})",
        note: "`selected` (thêm 14/08/2026 cho menu chọn giao diện Sáng/Tối/Theo hệ thống) đổi ngữ nghĩa trợ năng của mục: `menuitem` → `menuitemradio` + `aria-checked`. Khác biệt này NGHE ĐƯỢC trên trình đọc màn hình — `menuitem` chỉ nói 'bấm được', `menuitemradio` nói 'một trong mấy lựa chọn, cái này đang chọn'. Mục HÀNH ĐỘNG (Xoá, Làm mới) phải để TRỐNG vì không có gì để chọn. Trình bày trạng thái chọn BÁM ĐÚNG `form/Select`: chữ CAM + tick cam 16px. NỀN xám (`bg-stroke-soft`) chỉ dành cho hover/focus — nó nói 'con trỏ đang ở đây', không nói 'đang chọn'. Bản đầu 14/08 tô nền cho mục đang chọn và trúng đúng màu hover, nên mục đang chọn với mục đang rê chuột nhìn y hệt nhau; chủ dự án nhìn ảnh chụp phát hiện trước gate. Chỗ đánh dấu luôn chiếm chỗ kể cả khi chưa chọn (`invisible`, không bỏ hẳn) để bề rộng bảng menu không đổi khi lựa chọn đổi.",
      },
      { name: "side / align", type: "vị trí" },
    ],
    looksLike: ["menu xổ xuống", "danh sách lệnh khi bấm", "menu ba chấm"],
    vs: [
      { name: "TableActionsCell", useThisWhen: "Menu ngữ cảnh ở bất cứ đâu, trigger tự chọn." },
      { name: "KebabButton / IconGhostButton / TileKebabDropdown", useThisWhen: "Menu ngữ cảnh dùng chung, trigger tự chọn." },
    ],
  },
  {
    name: "DeploymentTimeline",
    group: "Deploy",
    import: "@/components/dsvh/ui/deploy/DeploymentTimeline",
    file: "ui/deploy/DeploymentTimeline.tsx",
    purpose: "Lịch sử các lần deploy (version): StatusDot trạng thái + commit + thời gian; bản 'Hiện tại' + nút Rollback cho bản cũ.",
    when: "Trang project — lịch sử deploy + rollback.",
    props: [
      { name: "items", type: "DeploymentItem[] (id,status,title,commit?,time,current?,canRollback?)" },
      { name: "onRollback", type: "(id)=>void" },
    ],
    looksLike: ["lịch sử triển khai", "danh sách phiên bản deploy"],
    vs: [
      { name: "Stepper", useThisWhen: "Lịch sử ĐÃ XẢY RA, số mục không biết trước và còn dài thêm (các lần deploy)." },
    ],
    related: ["StatusDot"],
  },
];

/** Thứ tự 13 nhóm — bám nguyên IA của /dsvh gốc, đừng đổi tuỳ hứng. */
export const dsGroupOrder: string[] = ["Getting Started", "Core Concepts", "Foundations", "Layout", "Components", "Forms", "Overlays", "Navigation", "Feedback", "Data Display", "Deploy", "Patterns", "Guidelines"];

export const dsManifest = { rules: dsRules, components: dsComponents, shadcnBorrowed, gaps: dsGaps };
