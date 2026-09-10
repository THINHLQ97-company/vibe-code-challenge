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

const FACTS = [
  { value: "2 bảng", label: "Kỹ thuật · Văn phòng" },
  { value: "4 tháng", label: "nhận 30–40 bài/tuần" },
  { value: "≤15 ngày", label: "hạn nộp bạn tự chọn" },
  { value: "1 sản phẩm", label: "mỗi người, có database thật" },
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
    body: "Đậu là được hoàn 130.000đ tiền đăng ký Google AI Pro qua kỳ lương tháng kế tiếp. Công cụ khác không nằm trong diện hoàn.",
  },
  {
    icon: <MarkKpi size={22} />,
    title: `Tính vào ${KPI_CATEGORY}`,
    body: "Bài thi đạt được ghi nhận vào KPI của bạn ở mục đề xuất cải tiến / sáng kiến — làm thật, tính thật.",
  },
  {
    icon: <MarkSeal size={22} />,
    title: "Chứng nhận & kho Template",
    body: "Chứng nhận tham gia và quà mốc cho người đạt ngưỡng sàn; repo tốt được đưa vào kho Template Vibe Host, có ghi tên tác giả.",
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
    body: "Vibe Host v2 tự gọi AI sửa mã khi deploy lỗi, và mã nguồn được gửi ra nhà cung cấp AI nước ngoài. Dữ liệu khách thật hay tài liệu nội bộ nằm trong mã là đi ra ngoài mà bạn không bấm nút nào.",
  },
  {
    icon: <MarkDatabase size={20} />,
    title: "Sản phẩm bắt buộc có database",
    body: "Không có database chạy thật thì chưa đạt ngưỡng sàn, dù giao diện đẹp tới đâu. Đây là tiêu chí nhị phân, không có điểm một nửa.",
  },
  {
    icon: <MarkBroadcast size={20} />,
    title: "Đăng bài là nghĩa vụ, không phải tuỳ chọn",
    body: "Thiếu bài đăng là chưa hoàn thành, kể cả sản phẩm tốt. Bù lại bạn được đăng ẩn danh — không cần dùng nick Facebook chính.",
  },
  {
    icon: <MarkBranch size={20} />,
    title: "Phải tự dựng mới — không dùng lại repo có sẵn",
    body: "Đây là cuộc thi vibe code, giá trị nằm ở việc bạn tự dựng trong kỳ thi. Bài bị phát hiện dùng lại repo hoặc mẫu có sẵn KHÔNG qua được Phase 2 và không được công bố. BTC đối chiếu lịch sử commit khi chấm mã nguồn.",
  },
];

const FAQ = [
  {
    q: "Không biết code thì có thi được không?",
    a: "Được. Bảng Văn phòng (OP, MK, FI, HR, Kinh doanh) không yêu cầu biết code trước — vibe coding cùng AI đủ để dựng một sản phẩm giải đúng việc bạn hay làm. Hai bảng chấm cùng barem nhưng xếp hạng riêng.",
  },
  {
    q: "Làm đề tài cá nhân có được không?",
    a: "Được. Đề tài mở: việc công ty, việc cá nhân (ví dụ sổ thu chi) hay giải pháp cho SME đều nhận. Chỉ không nhận chủ đề Game.",
  },
  {
    q: "Tôi phải tự trả tiền Vibe Host à?",
    a: "Không. Người tham gia được cấp tài khoản Vibe Host miễn phí trong suốt cuộc thi. Gói cơ bản có 2 suất chạy nền = 1 website + 1 database, vừa đủ yêu cầu bắt buộc.",
  },
  {
    q: "Ngại lộ danh tính khi đăng bài thì sao?",
    a: "Bài đăng lên nhóm được đăng ẩn danh — dùng chế độ ẩn danh của nhóm, tài khoản phụ, hoặc nhờ BTC đăng hộ. Đăng bài là bắt buộc, nhưng lộ mặt thì không.",
  },
  {
    q: "Nộp bài bị trả về là trượt luôn?",
    a: "Không. Cả hai cổng (ngưỡng sàn kỹ thuật và rà soát an toàn) đều cho sửa và nộp lại trong hạn của bạn. BTC phải ghi rõ sai ở đâu — nhận xét chung chung không hợp lệ.",
  },
  {
    q: "Không đồng ý với điểm thì làm gì?",
    a: "Gửi phản biện một vòng duy nhất, trong 48h kể từ khi công bố điểm, bắt buộc kèm bằng chứng kiểm chứng được (link chức năng, commit, video, ảnh màn hình). Kết quả sau phản biện là chung cuộc.",
  },
];

export default function LandingPage() {
  return (
    <main className="landing-scale relative isolate min-h-screen overflow-hidden bg-canvas">
      {/* MỘT ảnh nền cho cả trang, neo đỉnh và mờ dần xuống — thay vì mỗi dải một lớp nền. */}
      <HeroBackdrop image="/home-bg.webp" position="top" scrim />

      <div className="relative">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-6">
          <LogoWideDark height={34} />
          <Link href="/login">
            <Button variant="solid" size="sm" rightIcon={<MarkArrowRight size={15} />}>
              Đăng nhập
            </Button>
          </Link>
        </header>

        {/* ── HERO ───────────────────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 pb-12 pt-8 text-center sm:px-6 sm:pt-14">
          <Pill tone="accent">
            <MarkSpark size={14} />
            Mắt Bão · Toàn công ty · Thi cá nhân
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
        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
          <div className="text-center">
            <p className="flex items-center justify-center gap-2 text-caption font-semibold uppercase tracking-wide text-cream/50">
              <MarkTrophy size={16} className="text-orange-bright" />
              Tổng giá trị đến tay người dự thi
            </p>
            <p className="mt-2 bg-gradient-to-r from-orange-bright via-orange to-orange-bright bg-clip-text text-hero font-bold tracking-tight text-transparent">
              Hơn 50 triệu đồng
            </p>
            <p className="mx-auto mt-2.5 max-w-2xl text-body text-cream/65">
              Gồm 22,8 triệu tiền giải, 26–33 triệu hoàn phí công cụ AI qua lương, và khoảng 6 triệu
              quà mốc cho người đạt ngưỡng sàn.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <PrizeCard
              title="Giải tháng"
              meta="Trao riêng từng bảng · 4 đợt"
              desc="Cuối mỗi tháng chốt bảng xếp hạng của bảng Kỹ thuật và bảng Văn phòng, mỗi bảng trao đủ bộ giải dưới đây."
              prizes={MONTHLY_PRIZES}
            />
            <PrizeCard
              title="Giải chung cuối kỳ"
              meta="Giữa hai bảng · sau 4 tháng"
              desc="Kết thúc chương trình, hội đồng chọn quán quân chung giữa hai bảng thi."
              prizes={FINAL_PRIZES}
              footer="Cơ cấu và mức giải theo thể lệ đã công bố, có thể điều chỉnh khi chốt chính thức."
            />
          </div>
        </section>

        {/* ── QUYỀN LỢI ──────────────────────────────────────────────────────────────────── */}
        <Band
          eyebrow="Quyền lợi"
          title="Đậu thì được gì"
          subtitle={'"Đậu" = hoàn thành đủ 6 mốc bắt buộc, qua cổng an toàn và được BGK duyệt đạt.'}
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
          eyebrow="Đề tài"
          title="Chín nhóm chủ đề"
          subtitle="Chọn một nhóm khi đăng ký. Đề tài trùng nhau vẫn được duyệt — thể lệ không cấm. Không nhận chủ đề Game."
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
          eyebrow="Sáu mốc bắt buộc"
          title="Hành trình của bạn"
          subtitle="Đủ CP1–CP6 mới được công nhận đậu. Sau khi đăng nhập, khu thí sinh theo dõi đúng sáu mốc này."
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
          eyebrow="Cách chấm"
          title="Đậu được chấm thế nào"
          subtitle="Trước hết phải qua ngưỡng sàn (đạt / không đạt), qua rồi mới vào thang điểm 100."
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
          eyebrow="Đọc kỹ"
          title="Bốn chỗ dễ trượt nhất"
          subtitle="Đây là nguyên nhân trượt phổ biến, không phải chuyện kỹ thuật khó."
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
          eyebrow="Hai bảng thi"
          title="Bạn thi ở bảng nào"
          subtitle="Hệ thống tự xếp bảng theo phòng ban bạn khai lúc đăng ký — không phải chọn. Cùng barem, cùng ngưỡng sàn, cùng cổng an toàn; tách bảng chỉ để so tài với người cùng xuất phát điểm."
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
              Giải tháng và giải Yêu thích trao riêng cho từng bảng. Cuối 4 tháng mới chọn thêm
              Quán quân chung giữa hai bảng.
            </DarkNote>
          </div>
        </Band>

        {/* ── FAQ ────────────────────────────────────────────────────────────────────────── */}
        <Band
          eyebrow="Giải đáp"
          title="Câu hỏi thường gặp"
          subtitle="Sáu câu được hỏi nhiều nhất khi mở đăng ký."
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
              Đăng nhập bằng email công ty để nộp đề tài kèm tài liệu PRD. BTC duyệt cuốn chiếu theo
              tuần — duyệt xong mới bắt đầu tính hạn nộp của bạn, nên đăng ký sớm là có nhiều thời
              gian hơn.
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
