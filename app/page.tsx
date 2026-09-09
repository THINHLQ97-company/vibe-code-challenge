import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
        <p className="text-sm font-bold uppercase tracking-widest text-success">
          Mắt Bão · Toàn công ty
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          Cuộc thi <span className="text-primary">Vibe Coding</span> Nội bộ
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Tự tay làm ra một sản phẩm và đưa lên Vibe Host — hiểu để tư vấn, bán và hỗ trợ
          khách tốt hơn. Đăng nhập để đăng ký đề tài, theo dõi tiến độ và xem kết quả của bạn.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link href="/login">
            <Button size="lg" className="gap-1.5">
              Đăng nhập <ArrowRight size={16} />
            </Button>
          </Link>
          <p className="text-sm text-subtle">
            Chưa có tài khoản?{" "}
            <Link href="/signup" className="text-primary hover:text-primary-hover">
              Đăng ký tài khoản
            </Link>
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {FACTS.map((f) => (
            <div key={f.label} className="rounded-card border border-border bg-card px-4 py-2.5">
              <div className="text-lg font-bold text-success">{f.value}</div>
              <div className="text-sm text-muted-foreground">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
