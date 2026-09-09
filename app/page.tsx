import Link from "next/link";
import { Button } from "@/components/ui/button";

const FACTS = [
  { value: "2 bảng", label: "Kỹ thuật & Văn phòng" },
  { value: "≤15 ngày", label: "hạn nộp/người" },
  { value: "Hoàn phí AI", label: "đậu → qua lương" },
  { value: "110%", label: "Năng lực AI tháng đó" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-caption font-bold uppercase tracking-widest text-teal-strong">
          Mắt Bão · Toàn công ty
        </p>
        <h1 className="mt-3 text-hero font-bold tracking-tight text-ink">
          Cuộc thi <span className="text-orange">Vibe Coding</span> Nội bộ
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-body text-ink-2">
          Tự tay làm ra một sản phẩm và đưa lên Vibe Host — hiểu để tư vấn, bán và hỗ trợ
          khách tốt hơn. Đăng nhập để đăng ký đề tài, theo dõi tiến độ và xem kết quả của bạn.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link href="/login">
            <Button size="lg">Đăng nhập →</Button>
          </Link>
          <p className="text-caption text-ink-3">
            Chưa có tài khoản?{" "}
            <Link href="/signup" className="text-link hover:text-link-hover">
              Đăng ký tài khoản
            </Link>
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {FACTS.map((f) => (
            <div key={f.label} className="rounded-card border border-stroke bg-surface px-4 py-2.5">
              <div className="text-title font-bold text-teal-strong">{f.value}</div>
              <div className="text-caption text-ink-2">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
