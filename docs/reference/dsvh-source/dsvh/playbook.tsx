import Link from "next/link";

import { dsComponents, dsGates, dsRecipes } from "@/components/dsvh/manifest";
import { dsDocs } from "@/components/dsvh/docs-data";

/**
 * QUY TRÌNH DỰNG MỘT MÀN — bước 0 của DSVH, đặt ngay trang đầu.
 *
 * Vì sao đây phải là thứ gặp trước tiên: DSVH vốn tổ chức như một DANH MỤC (component xếp theo
 * loại), mà danh mục chỉ trả lời được câu "X là gì". Việc thật lại đi theo chiều khác — mở một màn
 * ra, tách thành từng cụm, rồi mới hỏi "cụm này có sẵn chưa, chưa có thì ghép từ đâu". Không có
 * bước 0 thì người dựng màn bắt đầu bằng việc CHẾ, và tra tài liệu chỉ để kiểm tra lại sau.
 *
 * Tài liệu `page-anatomy` (mang đúng tiêu đề "bắt buộc đọc trước khi dựng trang mới") vốn đã tồn
 * tại — nhưng bị chôn làm 1 trong 23 mục tài liệu nền, không ai gặp. Có tài liệu mà không ai thấy
 * thì cũng như không có; đó chính là lý do phần này được kéo lên đây.
 */

const STEPS = [
  {
    n: 1,
    title: "Đọc cả màn TRƯỚC, đừng sửa từng chỗ",
    body: "Mở màn cần làm, đọc hết từ trên xuống. Ghi ra từng CỤM theo Ý ĐỊNH (khối này để làm gì), không theo pixel. Sửa lẻ từng chỗ là cách một màn dần dần thành mười kiểu.",
    to: null as null | { href: string; label: string },
  },
  {
    n: 2,
    title: "Tra NGƯỢC từng cụm",
    body: "Với mỗi cụm, gõ đúng thứ bạn NHÌN THẤY vào bảng tra ngược — “menu ba chấm”, “dải trạng thái”, “ô tìm kiếm”. Mỗi từ khoá chỉ thuộc đúng một mục, nên ra đáp án là ra đáp án duy nhất.",
    to: { href: "/dsvh/tra-nguoc", label: "Bảng tra ngược" },
  },
  {
    n: 3,
    title: "Ra HAI đáp án thì đọc ranh giới",
    body: "StatCard hay StatTile? Select hay Combobox? Mỗi cặp trùng vai đều có mục “Dễ nhầm với” ghi rõ dùng bên nào khi nào — khai hai chiều nên vào từ phía nào cũng thấy.",
    to: null,
  },
  {
    n: 4,
    title: "KHÔNG ra đáp án thì xem công thức ghép cụm",
    body: "Phần lớn thứ trên một màn thật là CỤM ghép từ nhiều component, không phải một component đơn lẻ. Công thức nói ghép từ đâu, theo thứ tự nào, và luật riêng của cụm đó.",
    to: { href: "/dsvh/cong-thuc", label: "Công thức ghép cụm" },
  },
  {
    n: 5,
    title: "Vẫn không có thì GHI VÀO SỔ THIẾU rồi mới dựng",
    body: "Dựng mới là ba việc chứ không phải một: viết component → khai vào manifest → thêm demo. Ghi vào sổ thiếu trước để nhu cầu đó không biến mất, và để người sau không dựng bản thứ hai.",
    to: { href: "/dsvh/so-thieu", label: "Sổ thiếu" },
  },
  {
    n: 6,
    title: "Ghép bằng token, rồi để gate kiểm",
    body: "Mọi màu và cỡ chữ lấy từ token — không hex, không SVG tay, 8 bậc chữ có tên. Chạy npm run ds:check trước khi commit; không đạt thì quay lại bước 4.",
    to: { href: "/dsvh/phep-kiem", label: "Danh sách phép kiểm" },
  },
];

export function Playbook() {
  const anatomy = dsDocs.find((d) => d.id === "page-anatomy");
  return (
    <section className="mb-8 rounded-card border border-stroke bg-surface p-5">
      <h2 className="mb-1 text-title font-semibold text-ink">Dựng một màn thì làm theo thứ tự này</h2>
      <p className="mb-5 max-w-3xl text-caption text-ink-3">
        Sáu bước, đọc từ trên xuống. Bỏ qua bước 1–2 là nguồn gốc của gần hết những lần một màn mới
        trông khác các màn cũ — không phải vì ai ẩu, mà vì bắt đầu bằng việc chế thì tra tài liệu chỉ
        còn là kiểm tra lại sau.
      </p>

      <ol className="flex flex-col gap-2.5">
        {STEPS.map((s) => (
          <li key={s.n} className="flex gap-3 rounded-lg border border-stroke-soft bg-surface-2 p-3.5">
            {/* Chấm số giữ TRUNG TÍNH (luật #8): nó đánh dấu vị trí trong luồng, không mang nghĩa
                trạng thái. */}
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-stroke-soft text-caption font-semibold text-ink-2">
              {s.n}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body font-semibold text-ink">{s.title}</p>
              <p className="mt-0.5 text-caption leading-relaxed text-ink-2">{s.body}</p>
              {s.to ? (
                <Link
                  href={s.to.href}
                  className="mt-1.5 inline-block text-caption font-medium text-link hover:text-link-hover hover:underline"
                >
                  {s.to.label} →
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 grid gap-2 border-t border-stroke-soft pt-4 sm:grid-cols-3">
        {[
          { n: dsComponents.length, t: "component tra được", href: "/dsvh/tra-nguoc" },
          { n: dsRecipes.length, t: "công thức ghép cụm", href: "/dsvh/cong-thuc" },
          { n: dsGates.length, t: "phép kiểm chặn ở commit", href: "/dsvh/phep-kiem" },
        ].map((x) => (
          <Link key={x.t} href={x.href} className="rounded-lg border border-stroke p-3 hover:border-orange">
            <p className="text-title font-semibold text-ink">{x.n}</p>
            <p className="text-caption text-ink-3">{x.t}</p>
          </Link>
        ))}
      </div>

      {anatomy ? (
        <p className="mt-3 text-caption text-ink-2">
          Dựng một TRANG MỚI (không phải sửa trang có sẵn) thì đọc thêm{" "}
          <Link href={`/dsvh/${anatomy.id}`} className="font-medium text-link hover:text-link-hover hover:underline">
            {anatomy.title}
          </Link>{" "}
          — bản vẽ khung ngoài, nhịp dọc và thứ tự khối của một trang.
        </p>
      ) : null}
    </section>
  );
}
