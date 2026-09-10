import Link from "next/link";
import { Button } from "@/components/dsvh/ui/Button";
import { Card } from "@/components/dsvh/ui/Card";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Note } from "@/components/dsvh/ui/data/Note";
import { LogoWide } from "@/components/brand";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  TrophyIcon,
  ShieldWarningIcon,
} from "@/components/dsvh/icons";

/**
 * Trang giới thiệu cuộc thi — nguồn nội dung: `docs/reference/the-le-v3.html`.
 *
 * Nguyên tắc biên tập: chỉ giữ thứ người sắp dự thi cần để quyết định THAM GIA HAY KHÔNG và biết
 * mình phải làm gì. Cố ý BỎ khỏi trang này: ngân sách chương trình, cơ cấu ban tổ chức, phân vai
 * công bố, quy chuẩn hoá Template, bảng khung giờ đăng bài chi tiết — đó là việc của BTC, đưa lên
 * đây chỉ làm loãng phần thí sinh phải đọc.
 *
 * Sáu mốc dưới đây dùng ĐÚNG nhãn CP1–CP6 của `lib/checkpoints.ts`, để thứ đọc ở trang giới thiệu
 * khớp từng chữ với thứ theo dõi trong khu thí sinh sau khi đăng nhập.
 */

const FACTS = [
  { value: "2 bảng", label: "Kỹ thuật · Văn phòng" },
  { value: "4 tháng", label: "nhận 30–40 bài/tuần" },
  { value: "≤15 ngày", label: "hạn nộp bạn tự chọn" },
  { value: "130.000đ", label: "hoàn phí AI khi đậu" },
];

const BENEFITS = [
  {
    title: "Hoàn phí công cụ AI",
    body: "Đậu là được hoàn 130.000đ tiền đăng ký Google AI Pro qua kỳ lương tháng kế tiếp. Công cụ khác không nằm trong diện hoàn.",
  },
  {
    title: "110% Năng lực AI tháng đó",
    body: "Bài thi đạt được tính luôn là kết quả Năng lực AI của tháng, và bạn được miễn bài kiểm tra Năng lực AI trong 4 tuần.",
  },
  {
    title: "Giải thưởng theo bảng",
    body: "Mỗi tháng mỗi bảng: 1.000.000đ · 500.000đ · 300.000đ, cộng giải Yêu thích 300.000đ. Cuối 4 tháng có Quán quân chung 3.000.000đ.",
  },
];

const CHECKPOINTS = [
  { code: "CP1", label: "Đăng ký dự thi", desc: "Dự kick-off (hoặc xem lại bản ghi) và đăng ký trong tuần." },
  { code: "CP2", label: "Đề tài được duyệt", desc: "Nộp form đề tài kèm tài liệu PRD, chọn hạn nộp ≤15 ngày." },
  { code: "CP3", label: "Nộp Vibe Host + mã nguồn", desc: "Sản phẩm chạy thật, có database, đạt đủ 6 tiêu chí ngưỡng sàn." },
  { code: "CP4", label: "Qua cổng an toàn", desc: "Không vướng 7 điều cấm — máy quét trước, người duyệt bài bị gắn cờ." },
  { code: "CP5", label: "Đăng bài & BGK duyệt", desc: 'Đăng lên nhóm "Vibe Coding chưa?" theo lịch được cấp. Được đăng ẩn danh.' },
  { code: "CP6", label: "Phiếu trải nghiệm", desc: "Nộp phiếu trải nghiệm sản phẩm — bắt buộc với mọi thí sinh." },
];

const FLOOR = [
  "Link mở được và hiện ra nội dung — trang trắng không tính.",
  "Có ít nhất 3 chức năng chạy đúng như mô tả trong form đăng ký.",
  "Database hoạt động thật — đọc/ghi thật, không gắn cứng trong mã.",
  "Mở được trên điện thoại, không vỡ tới mức không dùng được.",
  "Không còn chữ mẫu, nút bấm không làm gì, phần dang dở lộ ra ngoài.",
  "Có nội dung riêng, không phải mẫu có sẵn chỉ đổi tên.",
];

const RUBRIC = [
  { module: "Chất lượng kỹ thuật", point: 40, by: "Máy chấm tự động" },
  { module: "Giá trị ứng dụng", point: 25, by: "AI chấm theo rubric, người đối chiếu" },
  { module: "Lan tỏa cộng đồng", point: 20, by: "Máy đếm tương tác 7 ngày" },
  { module: "Độ hoàn thiện & nội dung riêng", point: 15, by: "Máy + AI đối chiếu" },
];

const PITFALLS = [
  {
    title: "Dữ liệu phải là dữ liệu giả — tuyệt đối",
    body: "Vibe Host v2 tự gọi AI sửa mã khi deploy lỗi, và mã nguồn được gửi ra nhà cung cấp AI nước ngoài. Dữ liệu khách thật hay tài liệu nội bộ nằm trong mã là đi ra ngoài mà bạn không bấm nút nào.",
  },
  {
    title: "Sản phẩm bắt buộc có database",
    body: "Không có database chạy thật thì chưa đạt ngưỡng sàn, dù giao diện đẹp tới đâu. Đây là tiêu chí nhị phân, không có điểm một nửa.",
  },
  {
    title: "Đăng bài là nghĩa vụ, không phải tuỳ chọn",
    body: "Thiếu bài đăng là chưa hoàn thành, kể cả sản phẩm tốt. Bù lại bạn được đăng ẩn danh — không cần dùng nick Facebook chính.",
  },
  {
    title: "Phải tự dựng mới — không dùng lại repo có sẵn",
    body: "Đây là cuộc thi vibe code, giá trị nằm ở việc bạn tự dựng trong kỳ thi. Bài bị phát hiện dùng lại repo hoặc mẫu có sẵn KHÔNG qua được Phase 2 và không được công bố. BTC đối chiếu lịch sử commit khi chấm mã nguồn.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface-2">
      <header className="border-b border-stroke bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <LogoWide height={30} />
          <Link href="/login">
            <Button variant="solid" size="sm" rightIcon={<ArrowRightIcon size={15} />}>
              Đăng nhập
            </Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-12 text-center">
        <Badge tone="accent">Mắt Bão · Toàn công ty · Thi cá nhân</Badge>
        <h1 className="mx-auto mt-4 max-w-2xl text-hero font-bold leading-tight tracking-tight text-ink">
          Cuộc thi <span className="text-orange">Vibe Coding</span> nội bộ
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-body text-ink-2">
          Mỗi người tự làm một sản phẩm có database thật và đưa lên Vibe Host. Đề tài mở: việc công
          ty, việc cá nhân hay giải pháp cho SME đều được — chỉ không nhận chủ đề Game.
        </p>

        <div className="mt-7 flex flex-col items-center gap-2.5">
          <Link href="/login">
            <Button variant="solid" size="lg" rightIcon={<ArrowRightIcon size={17} />}>
              Đăng nhập để dự thi
            </Button>
          </Link>
          <p className="text-caption text-ink-3">
            Chưa có tài khoản?{" "}
            <Link href="/signup" className="text-link hover:text-link-hover">
              Đăng ký bằng email @matbao.com
            </Link>
          </p>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FACTS.map((f) => (
            <Card key={f.label} className="px-4 py-3 text-center">
              <div className="text-title font-bold text-orange">{f.value}</div>
              <div className="mt-0.5 text-caption text-ink-2">{f.label}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Quyền lợi đặt NGAY sau hero: đây là thứ quyết định người ta có bấm đăng ký hay không. */}
      <Section
        title="Đậu thì được gì"
        subtitle='"Đậu" = hoàn thành đủ 6 mốc bắt buộc, qua cổng an toàn và được BGK duyệt đạt.'
      >
        <div className="grid gap-3 md:grid-cols-3">
          {BENEFITS.map((b) => (
            <Card key={b.title} className="p-4">
              <span className="grid size-9 place-items-center rounded-lg bg-stroke-soft text-ink-2">
                <TrophyIcon size={18} />
              </span>
              <h3 className="mt-3 text-body font-semibold text-ink">{b.title}</h3>
              <p className="mt-1 text-caption text-ink-2">{b.body}</p>
            </Card>
          ))}
        </div>
        <Note className="mt-3">
          Ngoài ra: chứng nhận tham gia và quà mốc cho người đạt ngưỡng sàn; repo tốt được đưa vào
          kho Template Vibe Host, có ghi tên tác giả.
        </Note>
      </Section>

      <Section
        title="Sáu mốc bạn phải hoàn thành"
        subtitle="Đủ CP1–CP6 mới được công nhận đậu. Sau khi đăng nhập, khu thí sinh theo dõi đúng sáu mốc này."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CHECKPOINTS.map((c) => (
            <Card key={c.code} className="p-4">
              <div className="flex items-center gap-2">
                <Badge tone="neutral">{c.code}</Badge>
                <span className="text-body font-semibold text-ink">{c.label}</span>
              </div>
              <p className="mt-1.5 text-caption text-ink-2">{c.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Đậu được chấm thế nào"
        subtitle="Trước hết phải qua ngưỡng sàn (đạt / không đạt), qua rồi mới vào thang điểm 100."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Card className="p-4">
            <h3 className="text-body font-semibold text-ink">Ngưỡng sàn — 6 tiêu chí</h3>
            <p className="mt-0.5 text-caption text-ink-3">
              Nhị phân: đạt hoặc không. Chưa đạt thì được sửa và nộp lại, không loại ai.
            </p>
            <ul className="mt-3 space-y-2">
              {FLOOR.map((f) => (
                <li key={f} className="flex gap-2 text-caption text-ink-2">
                  <CheckCircleIcon size={15} className="mt-0.5 shrink-0 text-teal" />
                  {f}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <h3 className="text-body font-semibold text-ink">Thang điểm 100</h3>
            <p className="mt-0.5 text-caption text-ink-3">
              Máy chấm là chính; hội đồng xác nhận trước khi công bố.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-caption">
                <thead>
                  <tr className="border-b border-stroke text-left text-ink-3">
                    <th className="pb-2 font-medium">Module</th>
                    <th className="pb-2 text-right font-medium">Điểm</th>
                    <th className="pb-2 pl-3 font-medium">Chấm bằng</th>
                  </tr>
                </thead>
                <tbody>
                  {RUBRIC.map((r) => (
                    <tr key={r.module} className="border-b border-stroke last:border-0">
                      <td className="py-2 pr-3 text-ink">{r.module}</td>
                      <td className="py-2 text-right font-semibold tabular-nums text-ink">
                        {r.point}
                      </td>
                      <td className="py-2 pl-3 text-ink-2">{r.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Note className="mt-3">
              Có điểm rồi bạn được phản biện một vòng duy nhất, trong 48h, bắt buộc kèm bằng chứng
              kiểm chứng được (link chức năng, commit, video, ảnh màn hình).
            </Note>
          </Card>
        </div>
      </Section>

      <Section
        title="Bốn chỗ dễ trượt nhất"
        subtitle="Đọc kỹ bốn mục này trước khi bắt tay làm — đây là nguyên nhân trượt phổ biến, không phải chuyện kỹ thuật khó."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {PITFALLS.map((p) => (
            <Card key={p.title} className="p-4">
              <div className="flex gap-2.5">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-stroke-soft text-ink-2">
                  <ShieldWarningIcon size={16} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-body font-semibold text-ink">{p.title}</h3>
                  <p className="mt-1 text-caption text-ink-2">{p.body}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Bạn thi ở bảng nào"
        subtitle="Hệ thống tự xếp bảng theo phòng ban bạn khai lúc đăng ký. Cùng barem, cùng ngưỡng sàn — tách bảng để so tài với người cùng xuất phát điểm."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Card className="p-4">
            <Badge tone="neutral">Bảng Kỹ thuật</Badge>
            <p className="mt-2 text-body font-semibold text-ink">TS · DE</p>
            <p className="mt-1 text-caption text-ink-2">
              Hỗ trợ Kỹ thuật và Lập trình. Kỳ vọng khai thác sâu database và workflow tự động của
              Vibe Host.
            </p>
          </Card>
          <Card className="p-4">
            <Badge tone="neutral">Bảng Văn phòng</Badge>
            <p className="mt-2 text-body font-semibold text-ink">OP · MK · FI · HR · Kinh doanh</p>
            <p className="mt-1 text-caption text-ink-2">
              Không cần biết code trước. Vibe coding cùng AI đủ để dựng một sản phẩm giải đúng việc
              bạn hay làm.
            </p>
          </Card>
        </div>
      </Section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <Card className="p-6 text-center">
          <h2 className="text-title font-semibold text-ink">Sẵn sàng đăng ký đề tài?</h2>
          <p className="mx-auto mt-1.5 max-w-xl text-caption text-ink-2">
            Đăng nhập bằng email công ty để nộp đề tài kèm tài liệu PRD. BTC duyệt cuốn chiếu theo
            tuần — duyệt xong mới bắt đầu tính hạn nộp của bạn, nên đăng ký sớm là có nhiều thời
            gian hơn.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <Link href="/login">
              <Button variant="solid" rightIcon={<ArrowRightIcon size={16} />}>
                Đăng nhập
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="ghost">Tạo tài khoản</Button>
            </Link>
          </div>
        </Card>
      </section>
    </main>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-12">
      <h2 className="text-title font-semibold text-ink">{title}</h2>
      <p className="mb-4 mt-1 max-w-3xl text-caption text-ink-2">{subtitle}</p>
      {children}
    </section>
  );
}
