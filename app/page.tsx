import Link from "next/link";
import { Button } from "@/components/dsvh/ui/Button";
import { LogoWideDark } from "@/components/brand";
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
  StepRegister,
  StepApproved,
  StepDeploy,
  StepSecurity,
  StepSurvey,
  BoardTech,
  BoardOffice,
} from "@/components/landing-art";
import { HeroBackdrop } from "@/components/hero-backdrop";
import { GlassCard, Pill, DarkNote, Band } from "@/components/landing-ui";

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

/**
 * Nhãn "CP1…CP6" là ký hiệu nội bộ của BTC — người chưa dự thi đọc không ra nghĩa. Trang giới
 * thiệu chỉ đánh số bước 1–6; ký hiệu CP vẫn giữ nguyên trong khu thí sinh, nơi nó khớp với thể lệ.
 */
const CHECKPOINTS = [
  { icon: <StepRegister size={20} />, label: "Đăng ký dự thi", desc: "Dự kick-off (hoặc xem lại bản ghi) và đăng ký trong tuần." },
  { icon: <StepApproved size={20} />, label: "Đề tài được duyệt", desc: "Nộp form đề tài kèm tài liệu PRD, chọn hạn nộp ≤15 ngày." },
  { icon: <StepDeploy size={20} />, label: "Nộp Vibe Host + mã nguồn", desc: "Sản phẩm chạy thật, có database, đạt đủ 6 tiêu chí ngưỡng sàn." },
  { icon: <StepSecurity size={20} />, label: "Qua cổng an toàn", desc: "Không vướng 7 điều cấm — máy quét trước, người duyệt bài bị gắn cờ." },
  { icon: <MarkBroadcast size={20} />, label: "Đăng bài & BGK duyệt", desc: 'Đăng lên nhóm "Vibe Coding chưa?" theo lịch được cấp. Được đăng ẩn danh.' },
  { icon: <StepSurvey size={20} />, label: "Phiếu trải nghiệm", desc: "Nộp phiếu trải nghiệm sản phẩm — bắt buộc với mọi thí sinh." },
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
    a: "Thí sinh được cấp tài khoản Vibe Host miễn phí trong suốt chương trình, với gói cơ bản gồm hai suất chạy nền — đủ cho một website và một cơ sở dữ liệu theo đúng yêu cầu bắt buộc. Về công cụ AI, bạn tự do lựa chọn; riêng khoản đăng ký Google AI Pro sẽ được hoàn lại qua kỳ lương kế tiếp nếu bạn đậu.",
  },
  {
    q: "Tôi ngại công khai danh tính khi đăng bài chia sẻ.",
    a: "Đăng bài lên nhóm cộng đồng là nghĩa vụ bắt buộc, nhưng danh tính thì không. Bạn có thể sử dụng chế độ ẩn danh của nhóm, một tài khoản phụ, hoặc gửi nội dung để ban tổ chức đăng hộ. Điểm lan tỏa được chấm trên chính bài đăng đó, không phụ thuộc việc ai đứng tên.",
  },
  {
    q: "Bài bị trả về ở vòng kiểm tra thì có bị loại không?",
    a: "Không. Cả hai cổng kiểm tra — ngưỡng sàn kỹ thuật và rà soát an toàn — đều cho phép chỉnh sửa và nộp lại trong thời hạn của bạn. Ban tổ chức có trách nhiệm nêu rõ sản phẩm chưa đạt ở điểm nào; nhận xét chung chung không được xem là hợp lệ. Cơ chế này nhằm biến một lần chưa đạt thành một lần học được điều gì đó.",
  },
  {
    q: "Nếu tôi không đồng tình với kết quả chấm?",
    a: "Bạn có quyền gửi phản biện một lần duy nhất, trong vòng 48 giờ kể từ thời điểm công bố điểm, kèm bằng chứng có thể kiểm chứng như đường dẫn tới chức năng đang chạy, lịch sử commit, video hoặc ảnh màn hình. Hội đồng đối chiếu bằng chứng với sản phẩm và phản hồi trong 48 giờ. Kết quả sau phản biện là chung cuộc.",
  },
  {
    q: "Điểm số được tính vào KPI như thế nào?",
    a: `Sản phẩm được hội đồng duyệt đạt sẽ được ghi nhận vào ${KPI_CATEGORY} trong hệ thống KPI của bạn. Hệ thống nhân sự đọc trực tiếp dữ liệu từ nền tảng này, bạn không cần khai báo lại.`,
  },
  {
    q: "Tôi cần chuẩn bị gì trước khi đăng ký?",
    a: "Một bài toán cụ thể bạn muốn giải, hình dung về ba đến năm chức năng chính của sản phẩm, phương án dữ liệu sẽ lưu, và một tài liệu PRD mô tả các nội dung đó. Trang Hướng dẫn trình bày chi tiết từng bước, kèm gợi ý cách viết PRD và danh sách công cụ AI phù hợp.",
  },
];

export default function LandingPage() {
  return (
    <main className="landing-scale relative isolate min-h-screen overflow-hidden bg-canvas">
      {/* MỘT ảnh nền cho cả trang, neo đỉnh và mờ dần xuống — thay vì mỗi dải một lớp nền. */}
      <HeroBackdrop image="/home-bg.webp" position="top" scrim />

      <div className="relative">
        {/* Thanh đầu DÍNH: menu là các điểm neo tới từng mục trên chính trang này, cộng một lối
            sang trang Hướng dẫn. `backdrop-blur` + nền canvas mờ để chữ vẫn đọc được khi cuộn qua
            vùng sáng của ảnh nền. */}
        <header className="sticky top-0 z-30 border-b border-cream/10 bg-canvas/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
            <Link href="/" aria-label="Vibe Code Challenge — về đầu trang">
              <LogoWideDark height={30} />
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
        <section className="mx-auto max-w-6xl px-5 pb-12 pt-8 text-center sm:px-6 sm:pt-14">
          <Pill tone="accent">
            <MarkSpark size={14} />
            Mắt Bão · Toàn công ty · Thi cá nhân
          </Pill>
          <h1 className="mx-auto mt-5 max-w-3xl text-hero font-bold leading-tight tracking-tight text-cream">
            Mỗi người một sản phẩm,
            <br />
            vận hành thật trên <span className="text-orange-bright">Vibe Host</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-body text-cream/70">
            Cuộc thi vibe coding nội bộ dành cho toàn thể nhân sự Mắt Bão. Bạn tự chọn một bài
            toán có thật, dựng thành sản phẩm chạy được với cơ sở dữ liệu thật, rồi đưa lên Vibe
            Host. Đề tài mở cho mọi phòng ban — không yêu cầu kinh nghiệm lập trình.
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
        <section id="giai-thuong" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12 sm:px-6">
          <div className="text-center">
            <p className="flex items-center justify-center gap-2 text-caption font-semibold uppercase tracking-wide text-cream/50">
              <MarkTrophy size={16} className="text-orange-bright" />
              Tổng giá trị đến tay người dự thi
            </p>
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
          subtitle="Sáu mốc dưới đây là bắt buộc với mọi thí sinh. Sau khi đăng nhập, khu vực thí sinh hiển thị đúng sáu mốc này kèm trạng thái hiện tại của bạn, để bạn luôn biết mình đang ở đâu và việc kế tiếp là gì."
        >
          {/* Lưới 3 cột thay cho danh sách dọc: sáu mốc xếp dọc kéo trang dài thêm gần 500px mà
              không nói thêm điều gì. */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CHECKPOINTS.map((c, i) => (
              <GlassCard key={c.label} className="relative overflow-hidden p-5">
                {/* Số bước đặt to, mờ, ở góc — đọc được thứ tự từ xa mà không tranh chỗ với tiêu đề. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-1 -top-2 text-[64px] font-bold leading-none text-cream/[0.07]"
                >
                  {i + 1}
                </span>
                <span className="relative grid size-11 place-items-center rounded-xl bg-orange/12 text-orange-bright">
                  {c.icon}
                </span>
                <div className="relative mt-3.5 flex items-center gap-2">
                  <span className="text-meta font-bold uppercase tracking-wider text-orange-bright">
                    Bước {i + 1}
                  </span>
                </div>
                <h3 className="relative mt-1 text-title font-semibold text-cream">{c.label}</h3>
                <p className="relative mt-1.5 text-caption text-cream/60">{c.desc}</p>
              </GlassCard>
            ))}
          </div>
        </Band>

        {/* ── CHẤM ĐIỂM ──────────────────────────────────────────────────────────────────── */}
        <Band
          id="cham-diem"
          eyebrow="Cách chấm"
          title="Đậu được chấm thế nào"
          subtitle="Sản phẩm phải vượt ngưỡng sàn kỹ thuật trước — đây là bộ tiêu chí đạt hoặc không đạt, không có điểm trung gian. Vượt qua rồi mới được đưa vào thang điểm 100 để xếp hạng."
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
              <h3 className="text-body font-semibold text-cream">Thang điểm 100</h3>
              <p className="mt-0.5 text-caption text-cream/50">
                Máy chấm là chính; hội đồng xác nhận trước khi công bố.
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-caption">
                  <thead>
                    <tr className="border-b border-cream/12 text-left text-cream/50">
                      <th className="pb-2 font-medium">Module</th>
                      <th className="pb-2 text-right font-medium">Điểm</th>
                      <th className="pb-2 pl-3 font-medium">Chấm bằng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RUBRIC.map((r) => (
                      <tr key={r.module} className="border-b border-cream/8 last:border-0">
                        <td className="py-2 pr-3 text-cream/85">{r.module}</td>
                        <td className="py-2 text-right font-semibold tabular-nums text-orange-bright">
                          {r.point}
                        </td>
                        <td className="py-2 pl-3 text-cream/55">{r.by}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3">
                <DarkNote>
                  Có điểm rồi bạn được phản biện một vòng duy nhất, trong 48h, bắt buộc kèm bằng
                  chứng kiểm chứng được.
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
              departments={["TS — Hỗ trợ Kỹ thuật", "DE — Lập trình / Dev"]}
              expectation="Nền tảng tốt nên kỳ vọng khai thác sâu database và workflow tự động của Vibe Host."
            />
            <BoardCard
              icon={<BoardOffice size={22} />}
              name="Bảng Văn phòng"
              tagline="Khối văn phòng & kinh doanh"
              departments={[
                "OP — Vận hành",
                "MK — Marketing",
                "FI — Tài chính / Kế toán",
                "HR — Nhân sự",
                "Kinh doanh — Sales",
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
          <div className="grid gap-2 lg:grid-cols-2">
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
            <LogoWideDark height={34} className="mx-auto" />
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
  departments: string[];
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
        <ul className="mt-2.5 flex flex-wrap gap-2">
          {departments.map((d) => (
            <li
              key={d}
              className="rounded-lg border border-cream/12 bg-cream/[0.06] px-2.5 py-1.5 text-caption text-cream/80"
            >
              {d}
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
              i === 0 ? "border border-orange/40 bg-orange/12" : "border border-transparent bg-cream/[0.06]"
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
