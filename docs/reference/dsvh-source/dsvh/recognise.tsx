"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Input } from "@/components/dsvh/ui/Input";

type Row = { keyword: string; name: string; slug: string; group: string; purpose: string };

/**
 * BẢN ĐỒ NHẬN DIỆN — tra NGƯỢC: nhìn thấy gì trên màn thì dùng cái gì.
 *
 * Đây là cửa vào mà DSVH thiếu suốt từ đầu. Cả trang tài liệu trước nay chỉ trả lời được câu
 * "component X dùng thế nào" — tức chỉ phục vụ người ĐÃ BIẾT tên. Nhưng việc thật đi theo chiều
 * ngược lại: mở một màn ra, tách thành từng cụm, rồi mới hỏi "cụm này có sẵn chưa". Đo ngày 11/08:
 * gõ "menu ba chấm", "phân trang", "ô tìm kiếm", "dải trạng thái" vào toàn bộ tài liệu thì KHÔNG
 * từ nào ra kết quả — trong khi ba trong bốn thứ đó đã có component từ lâu.
 *
 * Bảng này sinh từ `looksLike` trong manifest, và gate RECOGNISE bảo đảm mỗi từ khoá chỉ thuộc đúng
 * MỘT mục — nên tra ra một cụm thì có đúng một đáp án, không phải hai đáp án để tự chọn.
 */
export function RecogniseMap({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");

  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.keyword.toLowerCase().includes(s) ||
        r.name.toLowerCase().includes(s) ||
        r.purpose.toLowerCase().includes(s),
    );
  }, [rows, q]);

  return (
    <>
      <div className="mb-4 max-w-md">
        <Input
          placeholder="Gõ thứ bạn NHÌN THẤY — vd: menu ba chấm, phân trang, công tắc…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Tra ngược theo thứ nhìn thấy"
        />
      </div>

      {hits.length === 0 ? (
        /* Không tìm thấy KHÔNG phải ngõ cụt — đây là nhánh quan trọng nhất của cả trang, vì đó là
           lúc người ta sắp tự chế một cụm mới. Phải chỉ tiếp đường đi, nếu không họ sẽ chế. */
        <div className="rounded-card border border-stroke bg-surface p-4">
          <p className="text-body font-medium text-ink">Không có mục nào khớp “{q}”</p>
          <p className="mt-1 text-caption text-ink-2">
            Nghĩa là DSVH có thể CHƯA có sẵn cụm này. Đừng tự chế ngay — làm theo thứ tự:
          </p>
          <ol className="mt-2 flex list-inside list-decimal flex-col gap-1 text-caption text-ink-2">
            <li>
              Thử gọi tên cụm đó theo cách khác (thứ bạn <em>nhìn thấy</em>, không phải tên kỹ thuật).
            </li>
            <li>
              Xem <Link href="/dsvh/cong-thuc" className="font-medium text-link hover:text-link-hover hover:underline">Công thức ghép cụm</Link> —
              nhiều cụm không phải một component mà là mấy component ghép lại theo công thức có sẵn.
            </li>
            <li>
              Vẫn không có thì ghi vào{" "}
              <Link href="/dsvh/so-thieu" className="font-medium text-link hover:text-link-hover hover:underline">Sổ thiếu</Link> rồi mới dựng —
              gate REIMPL chặn việc dựng lén trong module.
            </li>
          </ol>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-stroke bg-surface">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stroke-soft">
                <th className="px-4 py-2.5 text-caption font-semibold uppercase tracking-wide text-ink-3">
                  Thấy gì trên màn
                </th>
                <th className="px-4 py-2.5 text-caption font-semibold uppercase tracking-wide text-ink-3">
                  Thì dùng
                </th>
                <th className="hidden px-4 py-2.5 text-caption font-semibold uppercase tracking-wide text-ink-3 lg:table-cell">
                  Làm gì
                </th>
              </tr>
            </thead>
            <tbody>
              {hits.map((r) => (
                <tr key={r.keyword} className="border-b border-stroke-soft last:border-0">
                  <td className="px-4 py-2.5 align-top text-body text-ink">{r.keyword}</td>
                  <td className="px-4 py-2.5 align-top">
                    <Link href={`/dsvh/${r.slug}`} className="text-body font-medium text-link hover:text-link-hover hover:underline">
                      {r.name}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-2.5 align-top text-caption text-ink-2 lg:table-cell">
                    {r.purpose.length > 130 ? r.purpose.slice(0, 130) + "…" : r.purpose}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-caption text-ink-3">
        {hits.length}/{rows.length} từ khoá. Mỗi từ khoá chỉ thuộc ĐÚNG MỘT mục — gate{" "}
        <code className="rounded bg-stroke-soft px-1 py-0.5">RECOGNISE</code> chặn việc hai mục cùng nhận
        một từ, vì đó là dấu hiệu chúng trùng vai.
      </p>
    </>
  );
}
