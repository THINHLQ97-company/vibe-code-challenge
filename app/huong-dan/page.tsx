import Link from "next/link";
import { Button } from "@/components/dsvh/ui/Button";
import { LogoWideDark } from "@/components/brand";
import { HeroBackdrop } from "@/components/hero-backdrop";
import { GlassCard, Pill, DarkNote, ImageSlot } from "@/components/landing-ui";
import { KPI_CATEGORY } from "@/lib/kpi";
import {
  MarkArrowRight,
  MarkCheck,
  MarkSpark,
  MarkShieldAlert,
  StepRegister,
  StepApproved,
  StepDeploy,
  StepSecurity,
  StepSurvey,
  MarkBroadcast,
} from "@/components/landing-art";

export const metadata = {
  title: { absolute: "Hướng dẫn dự thi · Vibe Code Challenge" },
  description:
    "Hướng dẫn từng bước cho thí sinh Vibe Code Challenge: viết PRD, chọn công cụ AI, vibe code, đưa sản phẩm lên Vibe Host và nộp bài theo từng phase.",
};

/** Công cụ AI dùng để vibe code — thứ tự theo mức khuyến nghị của ban tổ chức. */
const AI_TOOLS = [
  {
    name: "Google One AI Pro",
    tag: "Khuyến nghị",
    highlight: true,
    price: "≈122.000đ/tháng · hoàn phí 130.000đ khi đậu",
    body: "Gói duy nhất nằm trong diện hoàn phí của chương trình. Bao gồm Gemini bản trả phí cùng bộ công cụ đi kèm, đủ dùng cho toàn bộ quá trình dựng sản phẩm. Hướng dẫn tạo tài khoản được trình bày tại buổi kick-off.",
  },
  {
    name: "Tài khoản Claude",
    tag: "Phù hợp viết mã dài",
    price: "Chi phí do thí sinh tự chi trả",
    body: "Mạnh ở việc đọc hiểu cả kho mã và giữ mạch trong những phiên làm việc dài. Bản Claude Code chạy thẳng trong terminal, phù hợp khi bạn đã quen thao tác dòng lệnh.",
  },
  {
    name: "Tài khoản ChatGPT có Codex",
    tag: "Phù hợp dựng nhanh",
    price: "Chi phí do thí sinh tự chi trả",
    body: "Codex nhận yêu cầu bằng ngôn ngữ thường và trả về mã chạy được, thuận tiện cho giai đoạn dựng khung sản phẩm ban đầu.",
  },
];

const PRD_SECTIONS = [
  { h: "Bài toán", d: "Ai đang gặp, gặp bao nhiêu lần mỗi tuần, hiện xử lý ra sao và mất bao lâu." },
  { h: "Người dùng", d: "Sản phẩm phục vụ ai, ước lượng bao nhiêu người có cùng nhu cầu." },
  { h: "Phạm vi", d: "Ba đến năm chức năng chính. Nêu rõ những gì KHÔNG làm trong kỳ thi này." },
  { h: "Luồng chính", d: "Người dùng thao tác gì, nhận lại kết quả gì — mô tả theo trình tự." },
  { h: "Dữ liệu", d: "Những bảng dữ liệu cần lưu và vai trò của từng bảng trong sản phẩm." },
  { h: "Tiêu chí hoàn thành", d: "Dấu hiệu nào cho thấy sản phẩm đã làm xong việc của nó." },
];

export default function HuongDanPage() {
  return (
    <main className="landing-scale relative isolate min-h-screen overflow-hidden bg-canvas">
      <HeroBackdrop image="/home-bg.webp" position="top" scrim />

      <div className="relative">
        <header className="sticky top-0 z-30 border-b border-cream/10 bg-canvas/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
            <Link href="/" aria-label="Vibe Code Challenge — về trang chủ">
              <LogoWideDark height={30} />
            </Link>
            <nav aria-label="Mục lục hướng dẫn" className="hidden items-center gap-1 lg:flex">
              {STEPS.map((s, i) => (
                <Link
                  key={s.id}
                  href={`#${s.id}`}
                  className="rounded-lg px-2.5 py-1.5 text-caption font-medium text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
                >
                  Bước {i + 1}
                </Link>
              ))}
              <Link
                href="/"
                className="ml-1 rounded-lg border border-cream/20 px-2.5 py-1.5 text-caption font-medium text-cream transition-colors hover:bg-cream/10"
              >
                Về trang chủ
              </Link>
            </nav>
            <Link href="/login">
              <Button variant="solid" size="sm" rightIcon={<MarkArrowRight size={15} />}>
                Đăng nhập
              </Button>
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-5 pb-10 pt-10 sm:px-6 sm:pt-14">
          <Pill tone="accent">
            <MarkSpark size={14} />
            Dành cho thí sinh
          </Pill>
          <h1 className="mt-4 max-w-3xl text-hero font-bold leading-tight tracking-tight text-cream">
            Hướng dẫn dự thi từ đầu đến cuối
          </h1>
          <p className="mt-4 max-w-3xl text-body text-cream/70">
            Bảy bước dưới đây đi theo đúng trình tự bạn sẽ trải qua, từ lúc chuẩn bị tài liệu đến
            khi nhận kết quả. Mỗi bước nêu rõ bạn cần làm gì, ban tổ chức làm gì, và điều gì quyết
            định việc bạn đi tiếp được hay phải quay lại chỉnh sửa.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link href="/signup">
              <Button variant="solid" size="lg" rightIcon={<MarkArrowRight size={16} />}>
                Tạo tài khoản dự thi
              </Button>
            </Link>
            <Link href="/#giai-thuong">
              <Button
                variant="ghost"
                size="lg"
                className="border-cream/25 bg-transparent text-cream hover:border-cream/45 hover:bg-cream/10 hover:text-cream"
              >
                Xem giải thưởng
              </Button>
            </Link>
          </div>
        </section>

        {STEPS.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            className="mx-auto max-w-6xl scroll-mt-20 px-5 py-9 sm:px-6"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange/12 text-orange-bright">
                {s.icon}
              </span>
              <div>
                <p className="text-meta font-bold uppercase tracking-wider text-orange-bright">
                  Bước {i + 1}
                </p>
                <h2 className="text-page font-bold tracking-tight text-cream">{s.title}</h2>
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-body text-cream/70">{s.lead}</p>

            <div className="mt-5">{s.content}</div>
          </section>
        ))}

        <section className="mx-auto max-w-6xl px-5 pb-16 pt-4 sm:px-6">
          <GlassCard className="p-8 text-center">
            <h2 className="text-page font-bold tracking-tight text-cream">
              Đã nắm luồng thi, bắt đầu thôi
            </h2>
            <p className="mx-auto mt-2.5 max-w-xl text-body text-cream/65">
              Đăng ký sớm là có thêm thời gian, vì đồng hồ làm bài chỉ chạy từ lúc đề tài của bạn
              được duyệt.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <Link href="/signup">
                <Button variant="solid" size="lg" rightIcon={<MarkArrowRight size={16} />}>
                  Tạo tài khoản
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="lg"
                  className="border-cream/25 bg-transparent text-cream hover:border-cream/45 hover:bg-cream/10 hover:text-cream"
                >
                  Tôi đã có tài khoản
                </Button>
              </Link>
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}

/* ── Nội dung bảy bước ───────────────────────────────────────────────────────────────────── */

const STEPS = [
  {
    id: "buoc-1-chuan-bi",
    icon: <StepRegister size={22} />,
    title: "Chuẩn bị công cụ AI",
    lead: "Trước khi viết dòng mô tả đầu tiên, bạn cần một tài khoản công cụ AI. Đây là thứ sẽ thay bạn viết mã trong suốt kỳ thi, nên chọn xong là bắt tay làm được ngay.",
    content: (
      <div className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-3">
          {AI_TOOLS.map((t) => (
            <GlassCard
              key={t.name}
              className={`p-4 ${t.highlight ? "border-orange/40 bg-orange/[0.09]" : ""}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-title font-semibold text-cream">{t.name}</h3>
                <Pill tone={t.highlight ? "accent" : "neutral"}>{t.tag}</Pill>
              </div>
              <p className="mt-1.5 text-caption font-medium text-cream/75">{t.price}</p>
              <p className="mt-2 text-caption text-cream/60">{t.body}</p>
            </GlassCard>
          ))}
        </div>
        <DarkNote tone="warning">
          Chỉ khoản đăng ký Google One AI Pro nằm trong diện hoàn phí khi bạn đậu. Các công cụ khác
          vẫn được dùng tự do nhưng do bạn tự chi trả.
        </DarkNote>
        <ImageSlot
          alt="Màn hình đăng ký tài khoản Google One AI Pro"
          ratio="16/9"
          note="Ảnh chụp trang đăng ký Google One AI Pro, làm nổi gói và mức giá để thí sinh đối chiếu."
        />
      </div>
    ),
  },
  {
    id: "buoc-2-prd",
    icon: <StepApproved size={22} />,
    title: "Viết tài liệu PRD",
    lead: "PRD (Product Requirements Document) là bản mô tả sản phẩm bạn định làm: giải bài toán gì, cho ai, gồm những chức năng nào. Đây là tài liệu bắt buộc khi đăng ký và cũng là căn cứ duy nhất để chấm điểm ý tưởng ở Phase 1.",
    content: (
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard className="p-5">
            <h3 className="text-title font-semibold text-cream">Một PRD cần có gì</h3>
            <p className="mt-1 text-caption text-cream/55">
              Sáu phần dưới đây là đủ. Không cần dài — cần cụ thể.
            </p>
            <ul className="mt-3.5 space-y-2.5">
              {PRD_SECTIONS.map((x) => (
                <li key={x.h} className="flex gap-2.5">
                  <MarkCheck size={16} className="mt-0.5 shrink-0 text-teal" />
                  <span className="text-caption text-cream/70">
                    <span className="font-semibold text-cream">{x.h}. </span>
                    {x.d}
                  </span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-title font-semibold text-cream">Nhờ AI viết cùng bạn</h3>
            <p className="mt-1 text-caption text-cream/55">
              Cách nhanh nhất là kể bài toán cho AI rồi để nó dựng khung PRD, bạn sửa lại cho đúng
              thực tế. Mở công cụ AI và bắt đầu bằng một đoạn như sau:
            </p>
            <blockquote className="mt-3 rounded-lg border border-cream/12 bg-canvas/60 p-3.5 text-caption leading-relaxed text-cream/75">
              &ldquo;Tôi làm ở phòng [tên phòng]. Mỗi tuần tôi phải [mô tả công việc lặp lại], hiện
              đang xử lý bằng [cách làm hiện tại] và mất khoảng [thời gian]. Hãy giúp tôi viết một
              tài liệu PRD cho sản phẩm giải bài toán này, gồm sáu phần: bài toán, người dùng, phạm
              vi, luồng chính, dữ liệu cần lưu, tiêu chí hoàn thành. Sản phẩm phải có cơ sở dữ liệu
              thật và toàn bộ dữ liệu là dữ liệu giả. Xuất ra định dạng markdown.&rdquo;
            </blockquote>
            <DarkNote>
              Đọc lại và sửa cho khớp thực tế công việc của bạn trước khi nộp. Hội đồng chấm mức độ
              cụ thể của bài toán, không chấm độ dài tài liệu.
            </DarkNote>
          </GlassCard>
        </div>

        <ImageSlot
          alt="Phiên trò chuyện với AI để dựng tài liệu PRD"
          ratio="16/9"
          note="Ảnh chụp một phiên chat với AI: bên trái là câu mô tả bài toán, bên phải là tài liệu PRD được sinh ra."
        />

        <DarkNote tone="warning">
          Hệ thống chỉ nhận PRD ở dạng chữ thuần (.md hoặc .txt), tối thiểu 200 ký tự. Không nhận
          .docx hay .pdf, vì hệ chấm điểm phải đọc được nội dung mới chấm tự động được Phase 1.
        </DarkNote>
      </div>
    ),
  },
  {
    id: "buoc-3-dang-ky",
    icon: <StepRegister size={22} />,
    title: "Nộp đăng ký đề tài",
    lead: "Đăng nhập bằng email công ty, điền form đề tài và đính kèm PRD. Ban tổ chức duyệt cuốn chiếu theo tuần với hạn mức 30–40 đề tài, nên nộp sớm là được xét sớm.",
    content: (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <GlassCard className="p-4">
            <h3 className="text-body font-semibold text-cream">Form đăng ký hỏi những gì</h3>
            <ul className="mt-2.5 space-y-1.5 text-caption text-cream/65">
              <li>· Tên sản phẩm, nhánh đề tài và nhóm chủ đề</li>
              <li>· Bài toán, người dùng và tối thiểu ba chức năng chính</li>
              <li>· Tài liệu PRD — tải file .md hoặc dán thẳng nội dung</li>
              <li>· Phương án cơ sở dữ liệu và công cụ AI bạn dùng</li>
              <li>· Thời gian làm bài bạn xin, tối đa 15 ngày</li>
              <li>· Bốn cam kết bắt buộc, thiếu một mục là không gửi được</li>
            </ul>
          </GlassCard>
          <GlassCard className="p-4">
            <h3 className="text-body font-semibold text-cream">Ban tổ chức xét theo tiêu chí nào</h3>
            <ul className="mt-2.5 space-y-1.5 text-caption text-cream/65">
              <li>· Bài toán có thật, không phải tình huống giả định</li>
              <li>· Phạm vi làm được trong thời gian bạn xin</li>
              <li>· Ba chức năng đủ cụ thể để chấm đạt hoặc không đạt</li>
              <li>· Có phương án cơ sở dữ liệu rõ ràng</li>
              <li>· Không thuộc nhóm trò chơi, không chạm bảy điều cấm</li>
            </ul>
          </GlassCard>
        </div>
        <ImageSlot
          alt="Form đăng ký đề tài trong khu vực thí sinh"
          ratio="16/10"
          note="Ảnh chụp form đăng ký đề tài, thấy rõ ô tải tài liệu PRD và khối cam kết bắt buộc."
        />
        <DarkNote>
          Đề tài bị trả về sẽ kèm lý do cụ thể; bạn chỉnh sửa rồi nộp lại. Thời gian làm bài chỉ bắt
          đầu tính từ thời điểm đề tài được duyệt.
        </DarkNote>
      </div>
    ),
  },
  {
    id: "buoc-4-vibe-code",
    icon: <MarkSpark size={22} />,
    title: "Vibe code sản phẩm",
    lead: "Vibe coding là cách làm sản phẩm bằng cách mô tả điều bạn muốn cho AI bằng ngôn ngữ thường ngày, thay vì tự viết từng dòng mã. Bạn giữ vai người ra đề và người nghiệm thu; AI lo phần dựng.",
    content: (
      <div className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-3">
          {[
            {
              h: "Bắt đầu từ PRD",
              d: "Đưa nguyên tài liệu PRD cho AI và yêu cầu dựng khung dự án: chọn công nghệ, tạo cấu trúc thư mục, dựng cơ sở dữ liệu theo phần dữ liệu bạn đã mô tả.",
            },
            {
              h: "Làm từng chức năng một",
              d: "Yêu cầu AI hoàn thiện dứt điểm một chức năng, tự mở lên bấm thử, rồi mới sang chức năng kế tiếp. Yêu cầu cả ba chức năng cùng lúc thường cho ra ba thứ dở dang.",
            },
            {
              h: "Kiểm bằng mắt mình",
              d: "Sau mỗi vòng, tự kiểm: dữ liệu có lưu lại sau khi tải lại trang không, mở trên điện thoại có vỡ không, còn nút nào bấm vào không xảy ra gì không.",
            },
          ].map((x) => (
            <GlassCard key={x.h} className="p-4">
              <h3 className="text-body font-semibold text-cream">{x.h}</h3>
              <p className="mt-1.5 text-caption text-cream/60">{x.d}</p>
            </GlassCard>
          ))}
        </div>
        <ImageSlot
          alt="Quá trình vibe code một chức năng"
          ratio="16/9"
          note="Ảnh chụp màn hình chia đôi: bên trái là yêu cầu gửi cho AI, bên phải là sản phẩm đang chạy với chức năng vừa dựng."
        />
        <DarkNote tone="warning">
          Toàn bộ dữ liệu trong sản phẩm phải là dữ liệu giả do bạn tự tạo. Vibe Host tự gọi AI sửa
          mã khi triển khai thất bại và gửi mã nguồn ra nhà cung cấp bên ngoài, nên dữ liệu thật nằm
          trong mã có thể ra khỏi công ty mà bạn không hay biết.
        </DarkNote>
      </div>
    ),
  },
  {
    id: "buoc-5-vibe-host",
    icon: <StepDeploy size={22} />,
    title: "Đưa sản phẩm lên Vibe Host",
    lead: "Sản phẩm phải chạy được trên một đường dẫn công khai thì hội đồng mới chấm được. Bạn được cấp tài khoản Vibe Host miễn phí trong suốt chương trình.",
    content: (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <GlassCard className="p-4">
            <h3 className="text-body font-semibold text-cream">Trình tự đưa lên</h3>
            <ol className="mt-2.5 space-y-1.5 text-caption text-cream/65">
              <li>1. Đăng nhập vibehost.matbao.ai bằng tài khoản được cấp</li>
              <li>2. Tạo dự án mới và kết nối kho mã nguồn của bạn</li>
              <li>3. Khai báo cơ sở dữ liệu — gói cơ bản có sẵn một suất</li>
              <li>4. Triển khai, chờ trạng thái báo thành công</li>
              <li>5. Mở đường dẫn và tự kiểm lại một lượt trước khi nộp</li>
            </ol>
          </GlassCard>
          <GlassCard className="p-4">
            <h3 className="text-body font-semibold text-cream">Chuẩn bị kho mã nguồn</h3>
            <p className="mt-2 text-caption text-cream/65">
              Đặt kho mã ở chế độ riêng tư, sau đó thêm tài khoản{" "}
              <code className="rounded bg-cream/10 px-1.5 py-0.5 text-cream">matbao-vibe-bot</code>{" "}
              làm cộng tác viên với quyền chỉ đọc. Hệ thống dùng tài khoản này để xác minh bạn thật
              sự sở hữu kho mã, không dùng vào việc gì khác.
            </p>
            <DarkNote>
              Chưa thêm cộng tác viên thì bước xác minh sẽ báo lỗi, và bài chưa được tính là đã nộp.
            </DarkNote>
          </GlassCard>
        </div>
        <ImageSlot
          alt="Bảng điều khiển Vibe Host sau khi triển khai thành công"
          ratio="16/9"
          note="Ảnh chụp Vibe Host: dự án ở trạng thái đã triển khai, thấy rõ đường dẫn sản phẩm và suất cơ sở dữ liệu."
        />
      </div>
    ),
  },
  {
    id: "buoc-6-nop-bai",
    icon: <StepSecurity size={22} />,
    title: "Nộp bài và qua các vòng chấm",
    lead: "Chương trình chấm theo ba phase nối tiếp. Mỗi phase có đầu vào riêng và chỉ mở ra khi phase trước đã xong.",
    content: (
      <div className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-3">
          {[
            {
              p: "Phase 1",
              h: "Chấm ý tưởng",
              d: "Căn cứ là tài liệu PRD bạn nộp lúc đăng ký. Kết quả là điểm Giá trị ứng dụng, thang 25.",
            },
            {
              p: "Phase 2",
              h: "Chấm sản phẩm và mã nguồn",
              d: "Bạn nộp đường dẫn Vibe Host cùng kho mã nguồn. Hội đồng chấm Chất lượng kỹ thuật (40) và Độ hoàn thiện (15), đồng thời rà soát bảy điều cấm. Duyệt đạt ở phase này là mốc bài được ghi nhận vào KPI.",
            },
            {
              p: "Phase 3",
              h: "Lan tỏa cộng đồng",
              d: "Sau khi chỉnh sửa theo phản hồi, bạn đăng bài chia sẻ lên nhóm cộng đồng. Tương tác trong bảy ngày quy ra điểm lan tỏa, thang 20.",
            },
          ].map((x) => (
            <GlassCard key={x.p} className="p-4">
              <Pill tone="accent">{x.p}</Pill>
              <h3 className="mt-2.5 text-body font-semibold text-cream">{x.h}</h3>
              <p className="mt-1.5 text-caption text-cream/60">{x.d}</p>
            </GlassCard>
          ))}
        </div>
        <ImageSlot
          alt="Khu vực thí sinh hiển thị tiến độ qua các phase"
          ratio="16/10"
          note="Ảnh chụp trang tổng quan của thí sinh, thấy rõ sáu mốc bắt buộc và trạng thái hiện tại."
        />
        <DarkNote>
          Duyệt đạt Phase 2 là mốc sản phẩm của bạn được ghi nhận vào {KPI_CATEGORY}. Hệ thống nhân
          sự đọc dữ liệu trực tiếp từ nền tảng này.
        </DarkNote>
      </div>
    ),
  },
  {
    id: "buoc-7-hoan-tat",
    icon: <StepSurvey size={22} />,
    title: "Hoàn tất và nhận kết quả",
    lead: "Hai việc cuối cùng thường bị bỏ quên, và thiếu một trong hai là chưa được công nhận đậu dù điểm số cao.",
    content: (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <GlassCard className="p-4">
            <span className="grid size-10 place-items-center rounded-lg bg-orange/12 text-orange-bright">
              <MarkBroadcast size={20} />
            </span>
            <h3 className="mt-3 text-body font-semibold text-cream">Bài đăng được ban giám khảo duyệt</h3>
            <p className="mt-1.5 text-caption text-cream/60">
              Dán đường dẫn bài đăng vào hệ thống và chờ ban giám khảo kiểm tra nội dung. Cửa sổ đếm
              tương tác bảy ngày chỉ bắt đầu chạy sau khi bài được duyệt.
            </p>
          </GlassCard>
          <GlassCard className="p-4">
            <span className="grid size-10 place-items-center rounded-lg bg-orange/12 text-orange-bright">
              <StepSurvey size={20} />
            </span>
            <h3 className="mt-3 text-body font-semibold text-cream">Phiếu trải nghiệm sản phẩm</h3>
            <p className="mt-1.5 text-caption text-cream/60">
              Bắt buộc với mọi thí sinh. Nên nộp ngay khi vừa làm xong sản phẩm, lúc bạn còn nhớ rõ
              chỗ nào của Vibe Host khiến mình mất thời gian nhất.
            </p>
          </GlassCard>
        </div>
        <GlassCard className="p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-amber/12 text-amber">
              <MarkShieldAlert size={18} />
            </span>
            <div>
              <h3 className="text-body font-semibold text-cream">Quyền phản biện của bạn</h3>
              <p className="mt-1.5 text-caption text-cream/65">
                Sau khi điểm được công bố, bạn có 48 giờ để gửi phản biện một lần duy nhất, kèm bằng
                chứng có thể kiểm chứng. Hội đồng đối chiếu bằng chứng với sản phẩm và phản hồi
                trong 48 giờ; kết quả sau phản biện là chung cuộc.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    ),
  },
];
