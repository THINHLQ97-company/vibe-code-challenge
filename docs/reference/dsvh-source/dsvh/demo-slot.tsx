"use client";

import { docsDemos, dsDemos } from "@/components/dsvh/demos";
import { Badge } from "@/components/dsvh/ui/Badge";

/**
 * CẦU NỐI sang phía client cho phần demo.
 *
 * Từ 11/08 các trang `/dsvh/**` là component MÁY CHỦ (đọc thẳng manifest, không tốn JS cho thứ chỉ
 * để đọc). Nhưng `demos.tsx` mang `"use client"`, nên khi máy chủ import `dsDemos` nó chỉ nhận được
 * THAM CHIẾU tới module client chứ không phải cái bảng tra thật — `dsDemos[name]` trả về undefined,
 * và trang lặng lẽ báo "chưa có demo" cho cả 73 component.
 *
 * Hỏng kiểu này không có lỗi biên dịch và không có cảnh báo: `tsc` thấy đúng kiểu, trang vẫn dựng,
 * chỉ nội dung là sai. Bắt được bằng cách MỞ ẢNH chụp trang Table và thấy dòng "chưa có demo" ngay
 * dưới một component chắc chắn có demo.
 *
 * Việc tra bảng vì thế phải xảy ra Ở PHÍA CLIENT — đó là toàn bộ lý do file này tồn tại.
 */

export function DemoSlot({ name }: { name: string }) {
  const D = dsDemos[name];
  if (!D)
    return (
      <section className="mb-5 rounded-card border border-stroke bg-surface p-4">
        <Badge tone="outline" size="sm">
          chưa có demo
        </Badge>
        <p className="mt-2 text-caption text-ink-3">
          Component có thật trong code (gate MANIFEST đã đối chiếu file và export), chỉ chưa dựng minh hoạ ở
          trang này.
        </p>
      </section>
    );
  return (
    <section className="mb-5 rounded-card border border-stroke bg-surface">
      <p className="border-b border-stroke-soft px-5 py-2.5 text-caption font-semibold uppercase tracking-wide text-ink-3">
        Chạy thật
      </p>
      <div className="bg-surface-2 p-5">
        <D />
      </div>
    </section>
  );
}

/** Minh hoạ nhúng trong một mục tài liệu nền (`blocks` kiểu `demo`). */
export function DocDemoSlot({ demoKey }: { demoKey: string }) {
  const D = docsDemos[demoKey];
  return (
    <div className="rounded-lg border border-stroke-soft bg-surface-2 p-4">
      {D ? <D /> : <p className="text-caption text-ink-3">(minh hoạ &ldquo;{demoKey}&rdquo; chưa dựng lại)</p>}
    </div>
  );
}

/** Đếm số component có demo — cũng phải đếm ở client, vì cùng lý do trên. */
export function DemoCountBadge({ names }: { names: string[] }) {
  const n = names.filter((x) => dsDemos[x]).length;
  return (
    <Badge tone="neutral" size="sm">
      {n}/{names.length} component có demo
    </Badge>
  );
}
