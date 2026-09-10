import Link from "next/link";
import { Button } from "@/components/dsvh/ui/Button";
import { Card } from "@/components/dsvh/ui/Card";
import { Badge } from "@/components/dsvh/ui/Badge";
import {
  LunorMark,
  ArrowRightIcon,
  DatabaseIcon,
  RocketIcon,
  MegaphoneIcon,
  TrophyIcon,
} from "@/components/dsvh/icons";

const FACTS = [
  { value: "2 bảng", label: "Kỹ thuật & Văn phòng" },
  { value: "≤15 ngày", label: "hạn nộp mỗi người" },
  { value: "Hoàn phí AI", label: "đậu thì nhận qua lương" },
  { value: "110%", label: "Năng lực AI tháng đó" },
];

const STEPS = [
  {
    icon: <RocketIcon size={20} />,
    title: "Đăng ký đề tài",
    desc: "Mô tả bài toán, chức năng, phương án database và đính tài liệu PRD. BTC duyệt cuốn chiếu theo tuần.",
  },
  {
    icon: <DatabaseIcon size={20} />,
    title: "Làm & nộp sản phẩm",
    desc: "Tự đăng ký Vibe Host, deploy sản phẩm có database thật rồi nộp link kèm mã nguồn.",
  },
  {
    icon: <MegaphoneIcon size={20} />,
    title: "Chia sẻ & lan tỏa",
    desc: "Đăng bài ẩn danh lên nhóm cộng đồng, tương tác 7 ngày quy ra điểm lan tỏa.",
  },
  {
    icon: <TrophyIcon size={20} />,
    title: "Nhận kết quả",
    desc: "BTC xác nhận điểm rồi công bố; xem thứ hạng theo bảng thi của bạn.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface-2">
      <header className="border-b border-stroke bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <LunorMark size={30} />
            <span className="text-body font-semibold text-ink">Vibe Code Challenge</span>
          </div>
          <Link href="/login">
            <Button variant="solid" size="sm" rightIcon={<ArrowRightIcon size={15} />}>
              Đăng nhập
            </Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-14 text-center">
        <Badge tone="accent">Mắt Bão · Toàn công ty</Badge>
        <h1 className="mx-auto mt-4 max-w-2xl text-hero font-bold leading-tight tracking-tight text-ink">
          Cuộc thi <span className="text-orange">Vibe Coding</span> nội bộ
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-body text-ink-2">
          Tự tay làm ra một sản phẩm và đưa lên Vibe Host — hiểu sản phẩm từ bên trong để tư vấn,
          bán và hỗ trợ khách tốt hơn. Đăng nhập để đăng ký đề tài và theo dõi tiến độ của bạn.
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

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FACTS.map((f) => (
            <Card key={f.label} className="px-4 py-3 text-center">
              <div className="text-title font-bold text-orange">{f.value}</div>
              <div className="mt-0.5 text-caption text-ink-2">{f.label}</div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <h2 className="mb-4 text-title font-semibold text-ink">Bốn bước tham gia</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Card key={s.title} className="p-4">
              <div className="flex items-center gap-2.5">
                {/* Luật #8: chấm icon TRANG TRÍ để xám, không tô cam — cam để dành cho nút chính. */}
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-stroke-soft text-ink-2">
                  {s.icon}
                </span>
                <span className="text-meta font-semibold uppercase tracking-wide text-ink-3">
                  Bước {i + 1}
                </span>
              </div>
              <h3 className="mt-3 text-body font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-caption text-ink-2">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
