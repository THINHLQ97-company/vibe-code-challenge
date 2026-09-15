/**
 * CHECKLIST BẮT BUỘC TRƯỚC KHI ĐĂNG BÀI PHASE 3.
 *
 * Nguồn: thể lệ v3 mục J và K, sổ tay vận hành group MK-TL01 mục 9 và phụ lục A, B
 * (bản do ban tổ chức chốt ngày 15/09/2026).
 *
 * Thí sinh phải tick TỪNG DÒNG, không phải một ô "tôi đã đọc và đồng ý". Lý do không nằm ở thủ
 * tục: bài đăng bị từ chối là mất toàn bộ điểm lan tỏa và KHÔNG có vòng sửa, nên trước khi áp một
 * hình phạt như vậy thì phải chắc người ta đã đọc qua từng điều — và phải giữ được bằng chứng.
 *
 * `VERSION` đi cùng mỗi lần xác nhận. Khi ban tổ chức sửa checklist, bản xác nhận cũ vẫn tra ra
 * được là người đó đã đồng ý với NHỮNG ĐIỀU NÀO — thiếu con số này thì mọi khiếu nại về sau đều
 * rơi vào cảnh hai bên nhớ hai bản khác nhau.
 *
 * Mã dòng (`id`) KHÔNG được đổi khi sửa câu chữ: nó là thứ lưu xuống database.
 */

export const CHECKLIST_VERSION = "2026-09-15";

export type ChecklistItem = { id: string; text: string };
export type ChecklistGroup = { key: string; title: string; note?: string; items: ChecklistItem[] };

/** Chữ giữa hai dấu sao được in đậm khi hiển thị — giữ đúng phần ban tổ chức muốn nhấn. */
export const CHECKLIST: ChecklistGroup[] = [
  {
    key: "A",
    title: "Bảo mật và thương hiệu",
    note: "Bảy điều cấm của cuộc thi, phần liên quan tới bài đăng.",
    items: [
      {
        id: "a1",
        text: "Toàn bộ dữ liệu trong sản phẩm tôi đăng là **dữ liệu giả** do tôi tự tạo. Không có dữ liệu khách hàng thật, không có thông tin nội bộ, không có bảng giá chưa công bố.",
      },
      {
        id: "a2",
        text: "Sản phẩm và bài đăng của tôi **không dùng logo, bộ nhận diện hay hình ảnh thương hiệu Mắt Bão**.",
      },
      {
        id: "a3",
        text: "Bài đăng của tôi **không nhắc tên Mắt Bão**, không dùng email công ty, không dùng danh xưng công ty.",
      },
      {
        id: "a4",
        text: "Bài đăng và sản phẩm của tôi **không để lộ tôi đang làm việc tại Mắt Bão** — kể cả trong ảnh chụp màn hình, chữ ký, tên thư mục hay phần giới thiệu bản thân.",
      },
      { id: "a5", text: "Tôi **không nói hay gợi ý** rằng đây là sản phẩm chính thức của Mắt Bão." },
      {
        id: "a6",
        text: "Ảnh chụp màn hình trong bài **không lộ** email công ty, tên đồng nghiệp, tên khách hàng, hay bất kỳ cửa sổ nào của hệ thống nội bộ.",
      },
    ],
  },
  {
    key: "B",
    title: 'Nội quy nhóm "Vibe Coding chưa?"',
    note: "Nhóm bật kiểm duyệt bài trước khi hiển thị. Vi phạm là bài không được duyệt.",
    items: [
      {
        id: "b1",
        text: "Bài viết bằng **tiếng Việt hoặc tiếng Anh đầy đủ ngữ pháp**. Không viết tắt, không teen code, không từ ngữ thiếu văn hóa.",
      },
      {
        id: "b2",
        text: "Bài **đúng chủ đề AI và vibe coding** — kể lại quá trình tôi làm sản phẩm.",
      },
      {
        id: "b3",
        text: "Bài **không mang tính quảng cáo hay bán hàng**: không kêu gọi mua, không bảng giá, không khuyến mãi, không kêu gọi đăng ký dịch vụ.",
      },
      {
        id: "b4",
        text: "Bài **không gắn thẻ trang hoặc nhóm khác**, không rủ người vào nhóm Zalo hay Telegram.",
      },
      {
        id: "b5",
        text: "Bài **không chứa nội dung chính trị, tôn giáo**, không công kích ai.",
      },
      { id: "b6", text: "Nội dung nào không phải của tôi thì tôi **có ghi nguồn**." },
      {
        id: "b7",
        text: "Tôi hiểu **cộng đồng có quyền khai thác bài của tôi** cho mục đích quảng bá và truyền thông của nhóm.",
      },
    ],
  },
  {
    key: "C",
    title: "Cách đăng để bài không bị bóp tương tác",
    note: "Điểm lan tỏa tính trên tương tác thật trong bảy ngày, nên những điều này ảnh hưởng thẳng tới điểm của chính bạn. Lịch đăng bài do hệ thống tự xếp theo thời điểm bạn nộp bài ở Phase 2 — nộp sớm thì được xếp lịch sớm. Bạn không phải tự đăng ký khung giờ.",
    items: [
      {
        id: "c1",
        text: "Tôi **không đặt link bấm được trong thân bài**. Link sản phẩm tôi để **xuống bình luận đầu tiên**.",
      },
      {
        id: "c2",
        text: "Bài của tôi **kể được quá trình làm** — chỗ tôi vấp và cách tôi xử lý — chứ không phải một dòng khoe kèm link.",
      },
    ],
  },
  {
    key: "D",
    title: "Tài khoản dùng để đăng bài",
    note: "Chỉ được đăng bằng tài khoản không có dấu hiệu dính tới Mắt Bão. Tài khoản có bất kỳ dấu hiệu nào thì BẮT BUỘC đăng ẩn danh, không phải tuỳ chọn. Dấu hiệu gồm: nơi làm việc hoặc chức danh ghi Mắt Bão; tên hiển thị kèm tên công ty; ảnh đại diện hoặc ảnh bìa có logo, đồng phục, backdrop, văn phòng; bài đăng gần đây có ảnh công ty, check-in văn phòng, ảnh sự kiện nội bộ; email hoặc số điện thoại công ty để công khai; đã từng chia sẻ hoặc tương tác công khai với trang hoặc bài tuyển dụng của công ty.",
    items: [
      {
        id: "d1",
        text: "Tôi **đã tự soi trang cá nhân** của tài khoản mình sẽ dùng để đăng, theo đúng danh sách dấu hiệu ở trên.",
      },
      {
        id: "d2",
        text: "Tài khoản của tôi **không còn dấu hiệu nào** dính tới Mắt Bão — **hoặc** tôi sẽ đăng bằng **chế độ ẩn danh của nhóm**.",
      },
      {
        id: "d3",
        text: "Nếu đăng ẩn danh, tôi **giữ ẩn danh xuyên suốt**: bình luận chứa link sản phẩm và mọi câu trả lời của tôi trong bài đều ở chế độ ẩn danh, không chuyển sang tài khoản thật giữa chừng.",
      },
      {
        id: "d4",
        text: "Tôi đăng bằng **tài khoản Facebook thật của mình**. Tôi **không lập tài khoản mới** để đăng — nội quy nhóm chặn tài khoản có dấu hiệu nick ảo. Ban tổ chức không đăng hộ.",
      },
    ],
  },
  {
    key: "E",
    title: "Tính trung thực của điểm lan tỏa",
    items: [
      {
        id: "e1",
        text: "Tôi **không mua lượt thích, không thuê seeding, không lập tài khoản ảo** để tăng tương tác. Vi phạm là bị loại khỏi cuộc thi, không cảnh cáo trước.",
      },
      {
        id: "e2",
        text: "Tôi hiểu **tương tác từ nhân viên Mắt Bão không được tính** vào điểm lan tỏa.",
      },
      {
        id: "e3",
        text: "Tôi chỉ đăng **một bài duy nhất** cho bài dự thi này. Đăng lại hoặc đăng thêm không được tính điểm.",
      },
    ],
  },
  {
    key: "F",
    title: "Xác nhận cuối",
    items: [
      {
        id: "f1",
        text: "Tôi đã đọc hết checklist này và **tự kiểm lại bài đăng của mình một lượt**.",
      },
      {
        id: "f2",
        text: "Tôi hiểu rằng vì đã có checklist rõ ràng, **bài đăng bị từ chối duyệt sẽ bị loại khỏi Phase 3** — không có vòng sửa, và tôi không đăng ký lại được ở đợt sau.",
      },
    ],
  },
];

export const CHECKLIST_ITEM_IDS: string[] = CHECKLIST.flatMap((g) => g.items.map((i) => i.id));
export const CHECKLIST_ITEM_COUNT = CHECKLIST_ITEM_IDS.length;

/** Xác nhận chỉ hợp lệ khi tick ĐỦ mọi dòng của đúng bản đang hiệu lực. */
export function isChecklistComplete(ticked: string[]): boolean {
  const set = new Set(ticked);
  return CHECKLIST_ITEM_IDS.every((id) => set.has(id));
}
