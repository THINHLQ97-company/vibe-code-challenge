import Link from "next/link";
import { Button } from "@/components/dsvh/ui/Button";
import { LogoWideDark, LogoSquare } from "@/components/brand";
import { RUBRIC, PHASE_GROUPS, TOTAL_MAX } from "@/lib/scoring-rubric";
import { KPI_CATEGORY } from "@/lib/kpi";
import {
  MarkSpark,
  MarkWallet,
  MarkKpi,
  MarkSeal,
  MarkShieldAlert,
  MarkDatabase,
  MarkBroadcast,
  MarkBranch,
  MarkTrophy,
  MarkCheck,
  MarkArrowRight,
  MarkChevronDown,
  HairlineDivider,
  TopicFinance,
  TopicSales,
  TopicMarketing,
  TopicWeb,
  TopicOps,
  TopicPeople,
  TopicLegal,
  TopicEdu,
  TopicLife,
  BoardTech,
  BoardOffice,
  DeptSupport,
  DeptDev,
  DeptOps,
  DeptMarketing,
  DeptFinance,
  DeptHR,
  DeptSales,
  PrizeGlow,
} from "@/components/landing-art";
import { HeroBackdrop } from "@/components/hero-backdrop";
import { JourneyTrain } from "@/components/journey-train";
import { GlassCard, Pill, DarkNote, Band, BackToTop } from "@/components/landing-ui";

/**
 * Trang giới thiệu cuộc thi. Nguồn nội dung: `docs/reference/the-le-v3.html`.
 *
 * TOÀN TRANG NỀN TỐI (`canvas`), không còn dải sáng nào. Ảnh nền là WebP có kênh alpha mờ dần về
 * trong suốt ở đáy (85,5% pixel đặc · 3,5% trong suốt hoàn toàn) nên tự hoà vào nền, không cần lớp
 * phủ gradient — đó là cách trang tham chiếu làm và nó cho người vẽ kiểm soát chỗ đậm chỗ nhạt
 * thay vì phó mặc một gradient chung.
 *
 * Bố cục tham chiếu vietnamaichallenge.com (hero ảnh nền → giải thưởng → chủ đề → hành trình →
 * FAQ → CTA), nhưng THU VỀ quy mô nội bộ: bỏ hẳn phần cố vấn, nhà tài trợ, địa điểm thi đấu và
 * chuỗi workshop — cuộc thi này không có những thứ đó, dựng ra chỉ để trang trông hoành tráng là
 * hứa thứ không tồn tại.
 *
 * Sáu mốc dưới đây dùng ĐÚNG nhãn CP1–CP6 của `lib/checkpoints.ts` để trang giới thiệu và khu thí
 * sinh sau khi đăng nhập nói cùng một thứ.
 */

/** Menu trang chủ = điểm neo tới từng mục bên dưới. Đổi `id` ở đây phải đổi cả `id` của `Band`. */
const NAV_ANCHORS = [
  { href: "#giai-thuong", label: "Giải thưởng" },
  { href: "#quyen-loi", label: "Quyền lợi" },
  { href: "#hanh-trinh", label: "Hành trình" },
  { href: "#cham-diem", label: "Cách chấm" },
  { href: "#bang-thi", label: "Bảng thi" },
  { href: "#faq", label: "Hỏi đáp" },
];

const FACTS = [
  { value: "2,5 tháng", label: "toàn bộ chương trình" },
  { value: "2 bảng", label: "Kỹ thuật · Văn phòng" },
  { value: "≤15 ngày", label: "thời gian làm bài bạn tự chọn" },
  { value: "30–40", label: "đề tài được duyệt mỗi tuần" },
];

/** Số liệu lấy nguyên từ mục M của thể lệ. */
const MONTHLY_PRIZES = [
  { rank: "🥇 Nhất bảng", money: "1.000.000đ" },
  { rank: "🥈 Nhì bảng", money: "500.000đ" },
  { rank: "🥉 Ba bảng", money: "300.000đ" },
  { rank: "❤️ Yêu thích", money: "300.000đ" },
];

const FINAL_PRIZES = [
  { rank: "🏆 Quán quân chung", money: "3.000.000đ" },
  { rank: "🥈 Á quân chung", money: "2.000.000đ" },
  { rank: "🥉 Quý quân chung", money: "1.000.000đ" },
];

const BENEFITS = [
  {
    icon: <MarkWallet size={22} />,
    title: "Hoàn phí công cụ AI",
    body: "Thí sinh đậu được hoàn 130.000đ chi phí đăng ký Google AI Pro, chi trả qua kỳ lương tháng kế tiếp. Khoản hoàn phí áp dụng riêng cho công cụ này.",
  },
  {
    icon: <MarkKpi size={22} />,
    title: `Tính vào ${KPI_CATEGORY}`,
    body: "Sản phẩm được duyệt đạt sẽ ghi nhận vào KPI của bạn ở hạng mục đề xuất cải tiến và sáng kiến. Hệ thống nhân sự đọc dữ liệu trực tiếp, bạn không phải khai báo lại.",
  },
  {
    icon: <MarkSeal size={22} />,
    title: "Chứng nhận & kho Template",
    body: "Chứng nhận tham gia và quà mốc dành cho mọi thí sinh vượt ngưỡng sàn. Những sản phẩm chất lượng được tuyển vào kho Template Vibe Host phục vụ người dùng thật, có ghi tên tác giả.",
  },
];

const TOPICS = [
  { icon: <TopicFinance size={20} />, label: "Tài chính cá nhân & doanh nghiệp" },
  { icon: <TopicSales size={20} />, label: "Kinh doanh / bán hàng" },
  { icon: <TopicMarketing size={20} />, label: "Marketing / Sales / CSKH" },
  { icon: <TopicWeb size={20} />, label: "Website / Kỹ thuật" },
  { icon: <TopicOps size={20} />, label: "Quản lý / Vận hành" },
  { icon: <TopicPeople size={20} />, label: "Văn phòng / Nhân sự" },
  { icon: <TopicLegal size={20} />, label: "Pháp lý" },
  { icon: <TopicEdu size={20} />, label: "Giáo dục / học tập" },
  { icon: <TopicLife size={20} />, label: "Cá nhân / đời sống" },
];

const FLOOR = [
  "Link mở được và hiện ra nội dung — trang trắng không tính.",
  "Có ít nhất 3 chức năng chạy đúng như mô tả trong tài liệu PRD.",
  "Database hoạt động thật — đọc/ghi thật, không gắn cứng trong mã.",
  "Mở được trên điện thoại, không vỡ tới mức không dùng được.",
  "Không còn chữ mẫu, nút bấm không làm gì, phần dang dở lộ ra ngoài.",
  "Có nội dung riêng, không phải mẫu có sẵn chỉ đổi tên.",
];

/**
 * Thang điểm hiển thị cho thí sinh, GOM THEO PHASE — đúng thứ tự họ đi qua và đúng cách khu thí
 * sinh lẫn trang chấm của BTC đang hiển thị.
 *
 * Bản trước liệt kê bốn nhóm phẳng không theo phase, xếp theo trọng số giảm dần. Hệ quả: trang
 * giới thiệu và hệ thống nói hai barem khác nhau, thí sinh đọc xong không nối được nhóm điểm nào
 * thuộc vòng nào. Các con số lấy TỪ `lib/scoring-rubric.ts`, không gõ lại ở đây.
 *
 * Cố ý KHÔNG nói mục nào do máy chấm: cơ chế chấm là việc vận hành nội bộ, công bố ra ngoài thì
 * thành cam kết phải giữ đúng từng chữ.
 */
const SCORE_PHASES = PHASE_GROUPS.map((g) => ({
  ...g,
  modules: RUBRIC.filter((m) => m.phase === (g.phase as number)),
}));

const PITFALLS = [
  {
    icon: <MarkShieldAlert size={20} />,
    title: "Dữ liệu phải là dữ liệu giả — tuyệt đối",
    body: "Vibe Host phiên bản 2 tự động gọi AI sửa mã mỗi khi triển khai thất bại, và mã nguồn khi đó được gửi tới nhà cung cấp AI nước ngoài. Bất kỳ dữ liệu khách hàng thật hay tài liệu nội bộ nào nằm trong mã đều có thể ra khỏi công ty mà bạn không hề bấm nút nào. Đây là lý do quy định dùng dữ liệu giả là tuyệt đối, không có ngoại lệ.",
  },
  {
    icon: <MarkDatabase size={20} />,
    title: "Sản phẩm bắt buộc có database",
    body: "Sản phẩm phải đọc và ghi dữ liệu thật, không phải dữ liệu gắn cứng trong mã. Đây là tiêu chí đạt hoặc không đạt: thiếu cơ sở dữ liệu là chưa vượt ngưỡng sàn, bất kể giao diện hoàn chỉnh đến đâu.",
  },
  {
    icon: <MarkBroadcast size={20} />,
    title: "Đăng bài là nghĩa vụ, không phải tuỳ chọn",
    body: "Bài chia sẻ trên nhóm cộng đồng là một trong sáu mốc bắt buộc. Sản phẩm tốt đến đâu mà thiếu bước này vẫn chưa hoàn thành nghĩa vụ. Đổi lại, bạn được quyền đăng ẩn danh nên không phải cân nhắc chuyện lộ danh tính.",
  },
  {
    icon: <MarkBranch size={20} />,
    title: "Phải tự dựng mới — không dùng lại repo có sẵn",
    body: "Giá trị của chương trình nằm ở quá trình bạn tự dựng sản phẩm trong thời gian dự thi. Ban tổ chức đối chiếu lịch sử commit khi chấm mã nguồn; bài bị phát hiện sử dụng lại kho mã hoặc mẫu có sẵn sẽ không vượt qua Phase 2 và không được công bố kết quả.",
  },
];

const FAQ = [
  {
    q: "Tôi không có nền tảng lập trình, có thể tham gia không?",
    a: "Hoàn toàn có thể, và đó chính là lý do chương trình chia hai bảng thi. Bảng Văn phòng dành cho các khối Vận hành, Marketing, Tài chính, Nhân sự và Kinh doanh, không đòi hỏi kinh nghiệm viết mã. Vibe coding cùng công cụ AI cho phép bạn mô tả bài toán bằng ngôn ngữ thường ngày và nhận về một sản phẩm chạy được. Hai bảng áp dụng cùng barem và cùng ngưỡng sàn, chỉ xếp hạng riêng để bạn so tài với những người cùng xuất phát điểm.",
  },
  {
    q: "Đề tài có bắt buộc phải phục vụ công việc tại công ty không?",
    a: "Không. Ban tổ chức mở rộng phạm vi đề tài: một quy trình nội bộ bạn muốn rút gọn, một việc cá nhân bạn lặp lại hằng tuần, hay một giải pháp cho doanh nghiệp nhỏ bên ngoài đều được chấp nhận. Điều kiện duy nhất là bài toán phải có thật và sản phẩm phải giải được nó. Chương trình không nhận đề tài thuộc nhóm trò chơi.",
  },
  {
    q: "Chi phí hạ tầng và công cụ AI do ai chi trả?",
    a: "Bạn tự vào vibehost.matbao.ai đăng ký tài khoản — hệ thống chỉ nhận email công ty @matbao.com. Gói cơ bản gồm hai suất chạy nền, đủ cho một website và một cơ sở dữ liệu theo đúng yêu cầu bắt buộc. Về công cụ AI, bạn tự do lựa chọn; riêng khoản đăng ký Google AI Pro sẽ được hoàn lại qua kỳ lương kế tiếp nếu bạn đậu.",
  },
  {
    q: "Tôi ngại công khai danh tính khi đăng bài chia sẻ.",
    a: "Đăng bài lên nhóm cộng đồng là nghĩa vụ bắt buộc, nhưng danh tính thì không. Bạn có thể sử dụng chế độ ẩn danh của nhóm hoặc một tài khoản phụ. Điểm lan tỏa được chấm trên chính bài đăng đó, không phụ thuộc việc ai đứng tên.",
  },
  {
    q: "Bài bị trả về ở vòng kiểm tra thì có bị loại không?",
    a: "Không bị loại. Cả hai cổng kiểm tra — ngưỡng sàn kỹ thuật và rà soát an toàn — đều cho phép chỉnh sửa và nộp lại trong thời hạn của bạn. Lưu ý: điểm đã chấm được ghi nhận ngay tại thời điểm bạn nộp bài; ban giám khảo chỉ ra chỗ chưa đạt để bạn sửa và bước vào vòng kế tiếp. Nhận xét kiểu chung chung không được xem là hợp lệ.",
  },
  {
    q: "Nếu tôi không đồng tình với kết quả chấm?",
    a: "Bạn có quyền gửi phản biện một lần duy nhất, trong vòng 48 giờ kể từ thời điểm công bố điểm, kèm bằng chứng có thể kiểm chứng như đường dẫn tới chức năng đang chạy, lịch sử commit, video hoặc ảnh màn hình. Hội đồng đối chiếu bằng chứng với sản phẩm và phản hồi trong 48 giờ. Kết quả sau phản biện là chung cuộc.",
  },
  {
    q: "Điểm số được tính vào KPI như thế nào?",
    a: `Sản phẩm được hội đồng duyệt đạt sẽ được ghi nhận vào ${KPI_CATEGORY} trong hệ thống KPI của bạn. Điểm cuối cùng được gửi về Trưởng bộ phận của bạn để ra quyết định. Hệ thống nhân sự đọc trực tiếp dữ liệu từ nền tảng này, bạn không cần khai báo lại.`,
  },
  {
    q: "Tôi cần chuẩn bị gì trước khi đăng ký?",
    a: "Một bài toán cụ thể bạn muốn giải, hình dung về ba đến năm chức năng chính của sản phẩm, phương án dữ liệu sẽ lưu, và một tài liệu PRD mô tả các nội dung đó. Trang Hướng dẫn trình bày chi tiết từng bước, kèm gợi ý cách viết PRD và danh sách công cụ AI phù hợp.",
  },
];

export default function LandingPage() {
  return (
    <main id="top" className="landing-scale relative isolate min-h-screen overflow-x-clip bg-canvas">
      {/* MỘT ảnh nền cho cả trang, neo đỉnh và mờ dần xuống — thay vì mỗi dải một lớp nền. */}
      <HeroBackdrop image="/home-bg.webp" position="top" scrim />

      <div className="relative">
        {/* Thanh đầu DÍNH: menu là các điểm neo tới từng mục trên chính trang này, cộng một lối
            sang trang Hướng dẫn. `backdrop-blur` + nền canvas mờ để chữ vẫn đọc được khi cuộn qua
            vùng sáng của ảnh nền.

            Thẻ `main` bọc ngoài phải dùng `overflow-x-clip`, KHÔNG được dùng `overflow-hidden`:
            `overflow-hidden` biến `main` thành một vùng cuộn riêng, và `position: sticky` thì dính
            vào vùng cuộn gần nhất — tức thanh này dính vào `main` rồi trôi theo trang, nhìn y như
            không hề dính. `overflow-x-clip` cắt tràn ngang y hệt nhưng KHÔNG tạo vùng cuộn, nên
            thanh dính lại vào khung nhìn như mong đợi. */}
        <header className="sticky top-0 z-30 border-b border-cream/10 bg-canvas/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
            <Link href="/" aria-label="Vibe Code Challenge — về đầu trang">
              <LogoWideDark height={40} />
            </Link>

            <nav aria-label="Mục lục trang" className="hidden items-center gap-1 lg:flex">
              {NAV_ANCHORS.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="rounded-lg px-2.5 py-1.5 text-caption font-medium text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
                >
                  {a.label}
                </Link>
              ))}
              <Link
                href="/huong-dan"
                className="ml-1 rounded-lg border border-cream/20 px-2.5 py-1.5 text-caption font-medium text-cream transition-colors hover:bg-cream/10"
              >
                Hướng dẫn
              </Link>
            </nav>

            <Link href="/login">
              <Button variant="solid" size="sm" rightIcon={<MarkArrowRight size={15} />}>
                Đăng nhập
              </Button>
            </Link>
          </div>
        </header>

        {/* ── HERO ───────────────────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 pb-7 pt-8 text-center sm:px-6 sm:pt-14">
          <Pill tone="accent">
            <MarkSpark size={14} />
            Cuộc thi Vibe Code nội bộ Mắt Bão
          </Pill>
          <h1 className="mx-auto mt-5 max-w-3xl text-hero font-bold leading-tight tracking-tight text-cream">
            Tự tay làm ra một sản phẩm.
            <br />
            Đưa lên <span className="text-orange-bright">Vibe Host</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-body text-cream/70">
            Chỉ khi tự làm mới đủ hiểu để tư vấn, bán và hỗ trợ khách. Mỗi người một sản phẩm có
            database chạy thật — đề tài mở, không cần biết code trước.
          </p>

          <div className="mt-7 flex flex-col items-center gap-3">
            <Link href="/login">
              <Button variant="solid" size="lg" rightIcon={<MarkArrowRight size={17} />}>
                Đăng nhập để dự thi
              </Button>
            </Link>
            <p className="text-caption text-cream/55">
              Chưa có tài khoản?{" "}
              <Link href="/signup" className="font-medium text-cream hover:underline">
                Đăng ký bằng email @matbao.com
              </Link>
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {FACTS.map((f) => (
              <GlassCard key={f.label} className="px-4 py-3">
                <div className="text-title font-bold text-cream">{f.value}</div>
                <div className="mt-0.5 text-caption text-cream/55">{f.label}</div>
              </GlassCard>
            ))}
          </div>
        </section>

        <HairlineDivider />

        {/* ── GIẢI THƯỞNG ────────────────────────────────────────────────────────────────── */}
        {/* Dải giải thưởng có quầng sáng RIÊNG, đậm hơn phần còn lại — đây là điểm nhấn của trang. */}
        <section id="giai-thuong" className="relative isolate scroll-mt-20 overflow-hidden">
          <PrizeGlow />
          <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-7 sm:px-6">
          <div className="text-center">
            {/* Cúp đặt TRƯỚC nhãn và con số: mắt đi từ hình xuống chữ, và bản thân ảnh đã có quầng
                sáng riêng nên nó gánh luôn vai trò điểm nhấn — quầng CSS phía sau chỉ còn phụ hoạ.

                Ảnh gốc có 304px (27% chiều cao) TRONG SUỐT HOÀN TOÀN ở mép trên — nó tự đẩy cúp
                xuống và tạo một khoảng trống lớn không ai giải thích được. Đã cắt theo vùng THẤY
                ĐƯỢC (alpha ≥ 8) chứ không phải alpha > 0: viền alpha 1–7 mắt không nhìn ra nhưng
                vẫn chiếm chỗ. Tỉ lệ sau khi cắt là 760/412. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/trophy-glow.webp"
              alt=""
              aria-hidden
              width={380}
              height={206}
              className="mx-auto -mb-1 w-[240px] max-w-full sm:w-[320px] lg:w-[380px]"
            />
            <p className="flex items-center justify-center gap-2 text-caption font-semibold uppercase tracking-wide text-cream/50">
              <MarkTrophy size={16} className="text-orange-bright" />
              Tổng giá trị đến tay người dự thi
            </p>
            {/* Chữ để NÉT, không bọc hào quang. Bản trước đặt một bản chữ mờ 18px phía sau: ở cỡ
                44px nó thành vệt cam loang quanh từng chữ, đọc như chữ bị nhoè chứ không như ánh
                sáng. Phần toả sáng để cho lớp nền lo, chữ chỉ giữ dải màu. */}
            <p className="mt-2 bg-gradient-to-r from-orange-bright via-orange to-orange-bright bg-clip-text text-hero font-bold tracking-tight text-transparent">
              Hơn 45 triệu đồng
            </p>
            <p className="mx-auto mt-2.5 max-w-2xl text-body text-cream/65">
              Bao gồm giải thưởng tiền mặt theo tháng và giải chung cuối chương trình, khoản hoàn
              phí công cụ AI chi trả qua lương cho toàn bộ thí sinh đậu, cùng quà mốc dành cho
              người vượt ngưỡng sàn kỹ thuật.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <PrizeCard
              title="Giải tháng"
              meta="Trao riêng từng bảng"
              desc="Kết thúc mỗi tháng, ban tổ chức chốt bảng xếp hạng của từng bảng thi và trao đủ bộ giải dưới đây cho mỗi bảng."
              prizes={MONTHLY_PRIZES}
            />
            <PrizeCard
              title="Giải chung cuối kỳ"
              meta="Giữa hai bảng thi"
              desc="Khép lại 2,5 tháng tranh tài, hội đồng chọn ra những sản phẩm xuất sắc nhất trong toàn chương trình, không phân biệt bảng thi."
              prizes={FINAL_PRIZES}
              footer="Cơ cấu và mức giải căn cứ thể lệ đã công bố; số đợt giải tháng phụ thuộc lịch chương trình và sẽ được ban tổ chức chốt chính thức."
            />
          </div>
          </div>
        </section>

        {/* ── QUYỀN LỢI ──────────────────────────────────────────────────────────────────── */}
        <Band
          id="quyen-loi"
          eyebrow="Quyền lợi"
          title="Đậu thì được gì"
          subtitle="Một thí sinh được công nhận đậu khi hoàn thành đủ sáu mốc bắt buộc, vượt qua cổng rà soát an toàn và được hội đồng giám khảo duyệt đạt."
        >
          <div className="grid gap-3 md:grid-cols-3">
            {BENEFITS.map((b) => (
              <GlassCard key={b.title} className="p-4">
                <span className="grid size-10 place-items-center rounded-lg bg-orange/12 text-orange-bright">
                  {b.icon}
                </span>
                <h3 className="mt-3 text-body font-semibold text-cream">{b.title}</h3>
                <p className="mt-1 text-caption text-cream/60">{b.body}</p>
              </GlassCard>
            ))}
          </div>
        </Band>

        {/* ── CHỦ ĐỀ ─────────────────────────────────────────────────────────────────────── */}
        <Band
          id="de-tai"
          eyebrow="Đề tài"
          title="Chín nhóm chủ đề"
          subtitle="Bạn chọn một nhóm khi nộp đăng ký. Đề tài trùng nhau giữa các thí sinh vẫn được duyệt bình thường; ban tổ chức chỉ theo dõi phân bổ để cân bằng ngân hàng đề tài. Chương trình không nhận đề tài thuộc nhóm trò chơi."
        >
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {TOPICS.map((t) => (
              <GlassCard key={t.label} className="flex items-center gap-3 p-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-orange/12 text-orange-bright">
                  {t.icon}
                </span>
                <span className="text-body text-cream/85">{t.label}</span>
              </GlassCard>
            ))}
          </div>
        </Band>

        {/* ── HÀNH TRÌNH ─────────────────────────────────────────────────────────────────── */}
        <Band
          id="hanh-trinh"
          eyebrow="Sáu mốc bắt buộc"
          title="Hành trình của bạn"
          subtitle="Sáu mốc dưới đây là bắt buộc với mọi thí sinh. Bấm vào từng toa hoặc dùng mũi tên để xem chi tiết mốc đó: bạn phải làm gì, ban tổ chức làm gì, và điều gì quyết định bạn được đi tiếp."
        >
          <JourneyTrain />
        </Band>

        {/* ── CHẤM ĐIỂM ──────────────────────────────────────────────────────────────────── */}
        <Band
          id="cham-diem"
          eyebrow="Cách chấm"
          title="Đậu được chấm thế nào"
          subtitle="Sản phẩm phải vượt ngưỡng sàn kỹ thuật trước — đây là bộ tiêu chí đạt hoặc không đạt, không có điểm trung gian. Vượt qua rồi mới được đưa vào thang điểm 100 chia theo bốn nhóm nội dung dưới đây."
        >
          <div className="grid gap-3 lg:grid-cols-2">
            <GlassCard className="p-4">
              <h3 className="text-body font-semibold text-cream">Ngưỡng sàn — 6 tiêu chí</h3>
              <p className="mt-0.5 text-caption text-cream/50">
                Nhị phân: đạt hoặc không. Chưa đạt thì được sửa và nộp lại, không loại ai.
              </p>
              <ul className="mt-3 space-y-2">
                {FLOOR.map((f) => (
                  <li key={f} className="flex gap-2 text-caption text-cream/70">
                    <MarkCheck size={16} className="mt-0.5 shrink-0 text-teal" />
                    {f}
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="p-4">
              <h3 className="text-body font-semibold text-cream">Thang điểm {TOTAL_MAX}</h3>
              <p className="mt-0.5 text-caption text-cream/50">
                Cộng dồn qua ba vòng, mỗi vòng chấm xong là cộng vào tổng.
              </p>
              <ul className="mt-3.5 space-y-3">
                {SCORE_PHASES.map((g) => (
                  <li key={g.phase}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-caption font-medium text-cream/90">
                        <span className="mr-1.5 rounded bg-cream/10 px-1.5 py-0.5 text-meta font-semibold text-cream/70">
                          Vòng {g.phase}
                        </span>
                        {g.label}
                      </span>
                      <span className="shrink-0 text-body font-bold tabular-nums text-orange-bright">
                        {g.total}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-cream/10">
                      <div
                        className="h-full rounded-full bg-orange/70"
                        style={{ width: `${(g.total / TOTAL_MAX) * 100}%` }}
                      />
                    </div>
                    {/* Vòng 1 và 3 chỉ có một hạng mục nên nêu lại tên là thừa; vòng 2 gồm hai
                        hạng mục tách bạch, phải liệt kê ra mới biết 55 điểm chia thế nào. */}
                    {g.modules.length > 1 ? (
                      <ul className="mt-1 space-y-0.5">
                        {g.modules.map((m) => (
                          <li
                            key={m.key}
                            className="flex items-baseline justify-between gap-3 text-meta text-cream/50"
                          >
                            <span>· {m.label} — {m.publicNote}</span>
                            <span className="shrink-0 tabular-nums text-cream/70">{m.max}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-meta text-cream/50">
                        {g.modules[0]?.publicNote ?? g.summary}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <DarkNote>
                  Sau khi có điểm, bạn được phản biện một vòng duy nhất trong 48 giờ, kèm bằng chứng
                  có thể kiểm chứng.
                </DarkNote>
              </div>
            </GlassCard>
          </div>
        </Band>

        {/* ── DỄ TRƯỢT ───────────────────────────────────────────────────────────────────── */}
        <Band
          id="doc-ky"
          eyebrow="Đọc kỹ"
          title="Bốn chỗ dễ trượt nhất"
          subtitle="Qua các kỳ tổ chức, phần lớn trường hợp chưa đạt không đến từ khó khăn kỹ thuật mà từ bốn điều dưới đây. Đọc kỹ trước khi bắt tay vào làm sẽ tiết kiệm cho bạn một vòng chỉnh sửa."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {PITFALLS.map((p) => (
              <GlassCard key={p.title} className="p-4">
                <div className="flex gap-2.5">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-amber/12 text-amber">
                    {p.icon}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-body font-semibold text-cream">{p.title}</h3>
                    <p className="mt-1 text-caption text-cream/60">{p.body}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </Band>

        {/* ── BẢNG THI ───────────────────────────────────────────────────────────────────── */}
        <Band
          id="bang-thi"
          eyebrow="Hai bảng thi"
          title="Bạn thi ở bảng nào"
          subtitle="Hệ thống tự động xếp bảng dựa trên phòng ban bạn khai khi đăng ký, bạn không cần chọn. Hai bảng áp dụng chung barem, chung ngưỡng sàn và chung cổng rà soát an toàn; việc tách bảng chỉ nhằm bảo đảm bạn so tài với những người có cùng xuất phát điểm."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <BoardCard
              icon={<BoardTech size={22} />}
              name="Bảng Kỹ thuật"
              tagline="Khối làm kỹ thuật"
              departments={[
                { icon: <DeptSupport size={18} />, code: "TS", name: "Hỗ trợ Kỹ thuật" },
                { icon: <DeptDev size={18} />, code: "DE", name: "Lập trình / Dev" },
              ]}
              expectation="Nền tảng tốt nên kỳ vọng khai thác sâu database và workflow tự động của Vibe Host."
            />
            <BoardCard
              icon={<BoardOffice size={22} />}
              name="Bảng Văn phòng"
              tagline="Khối văn phòng & kinh doanh"
              departments={[
                { icon: <DeptOps size={18} />, code: "OP", name: "Vận hành" },
                { icon: <DeptMarketing size={18} />, code: "MK", name: "Marketing" },
                { icon: <DeptFinance size={18} />, code: "FI", name: "Tài chính / Kế toán" },
                { icon: <DeptHR size={18} />, code: "HR", name: "Nhân sự" },
                { icon: <DeptSales size={18} />, code: "BZ", name: "Kinh doanh" },
              ]}
              expectation="Không cần biết code trước. Vibe coding cùng AI đủ để dựng sản phẩm giải đúng việc bạn hay làm."
            />
          </div>
          <div className="mt-3">
            <DarkNote>
              Giải tháng và giải Yêu thích được trao riêng cho từng bảng thi. Giải chung cuộc chỉ
              xét một lần vào cuối chương trình, giữa những sản phẩm xuất sắc nhất của cả hai bảng.
            </DarkNote>
          </div>
        </Band>

        {/* ── FAQ ────────────────────────────────────────────────────────────────────────── */}
        <Band
          id="faq"
          eyebrow="Giải đáp"
          title="Câu hỏi thường gặp"
          subtitle="Những thắc mắc ban tổ chức nhận được nhiều nhất trong đợt mở đăng ký."
        >
          <div className="mx-auto max-w-4xl space-y-2">
            {FAQ.map((f) => (
              /* `<details>` chứ không dựng accordion bằng JS: đóng mở là hành vi sẵn có của trình
                 duyệt, chạy cả khi JS chưa tải và trình đọc màn hình hiểu đúng ngay. */
              <details
                key={f.q}
                className="group rounded-card border border-cream/12 bg-cream/[0.045] px-4 py-3 backdrop-blur-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-body font-medium text-cream">
                  {f.q}
                  <MarkChevronDown
                    size={16}
                    className="shrink-0 text-cream/50 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-2 text-caption text-cream/65">{f.a}</p>
              </details>
            ))}
          </div>
        </Band>

        {/* ── CTA CUỐI ───────────────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-6 sm:px-6">
          <GlassCard className="p-8 text-center">
            <LogoSquare size={64} className="mx-auto" />
            <h2 className="mx-auto mt-5 max-w-xl text-page font-bold tracking-tight text-cream">
              Sẵn sàng đăng ký đề tài?
            </h2>
            <p className="mx-auto mt-2.5 max-w-xl text-body text-cream/65">
              Đăng nhập bằng email công ty để nộp đề tài kèm tài liệu PRD. Ban tổ chức duyệt cuốn
              chiếu theo tuần, và thời gian làm bài chỉ bắt đầu tính từ lúc đề tài của bạn được
              duyệt — đăng ký sớm đồng nghĩa với việc bạn có nhiều thời gian chuẩn bị hơn.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <Link href="/login">
                <Button variant="solid" size="lg" rightIcon={<MarkArrowRight size={16} />}>
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/signup">
                {/* `ghost` của DSVH mang sẵn `bg-surface` (TRẮNG) vì nó dựng cho nền sáng — đặt
                    nguyên lên đây là nút trắng trên nền tối. Phải đè cả nền, viền lẫn chữ, không
                    chỉ thêm viền. */}
                <Button
                  variant="ghost"
                  size="lg"
                  className="border-cream/25 bg-transparent text-cream hover:border-cream/45 hover:bg-cream/10 hover:text-cream"
                >
                  Tạo tài khoản
                </Button>
              </Link>
            </div>
          </GlassCard>
        </section>
      </div>
      <BackToTop />
    </main>
  );
}

/** Thẻ một bảng thi — tách rõ tên bảng, các phòng thuộc bảng, và kỳ vọng của bảng đó. */
function BoardCard({
  icon,
  name,
  tagline,
  departments,
  expectation,
}: {
  icon: React.ReactNode;
  name: string;
  tagline: string;
  departments: { icon: React.ReactNode; code: string; name: string }[];
  expectation: string;
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start gap-3.5">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-orange/12 text-orange-bright">
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="text-title font-semibold text-cream">{name}</h3>
          <p className="mt-0.5 text-caption text-cream/50">{tagline}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-cream/10 pt-4">
        <p className="text-meta font-semibold uppercase tracking-wide text-cream/45">
          Phòng ban thuộc bảng
        </p>
        <ul className="mt-2.5 grid gap-2 sm:grid-cols-2">
          {departments.map((d) => (
            <li
              key={d.code}
              className="flex items-center gap-2.5 rounded-lg border border-cream/12 bg-cream/[0.06] px-2.5 py-2"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-orange/12 text-orange-bright">
                {d.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-caption font-semibold text-cream">{d.code}</span>
                <span className="block truncate text-meta text-cream/55">{d.name}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-caption text-cream/60">{expectation}</p>
    </GlassCard>
  );
}

/**
 * Thẻ giải thưởng. Giải cao nhất tô đậm hơn (viền và nền cam) — nhìn phát biết đâu là đỉnh, thay
 * vì bốn dòng đều nhau bắt người đọc tự so số.
 */
function PrizeCard({
  title,
  meta,
  desc,
  prizes,
  footer,
}: {
  title: string;
  meta: string;
  desc: string;
  prizes: { rank: string; money: string }[];
  footer?: string;
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-title font-semibold text-cream">{title}</h3>
        <Pill>{meta}</Pill>
      </div>
      <p className="mt-1.5 text-caption text-cream/60">{desc}</p>
      <ul className="mt-4 space-y-1.5">
        {prizes.map((p, i) => (
          <li
            key={p.rank}
            className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${
              i === 0
              ? "border border-orange/45 bg-orange/[0.14]"
              : "border border-transparent bg-cream/[0.06]"
            }`}
          >
            <span className={i === 0 ? "text-body font-medium text-cream" : "text-body text-cream/80"}>
              {p.rank}
            </span>
            <span
              className={`font-bold tabular-nums ${
                i === 0 ? "text-title text-orange-bright" : "text-body text-cream"
              }`}
            >
              {p.money}
            </span>
          </li>
        ))}
      </ul>
      {footer && <p className="mt-4 text-meta text-cream/45">{footer}</p>}
    </GlassCard>
  );
}
