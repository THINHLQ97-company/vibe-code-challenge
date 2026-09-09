import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { PageHeader } from "@/components/dsvh/ui/layout/PageHeader";

/**
 * KHUNG của một trang — đệm ngoài, nhịp dọc, và tiêu đề trang.
 *
 * Vì sao phải là component chứ không để mỗi trang tự gõ: trước bản này khuôn dựng trang là một quy
 * ước CHÉP TAY — `<div className="space-y-6 p-4 md:p-5 lg:p-6">` lặp ở 23 file, không có gì canh.
 * Hai trang mới nhất về từ nhánh khác (`/agent-tokens`, `/stack/[id]`) đều quên đệm ngoài, nên tiêu
 * đề dính sát mép khung trắng. Không phải người viết ẩu: cái đúng không nằm ở đâu để mà tra, và
 * `/dsvh` sinh từ manifest nên cũng không mô tả nổi "một trang trông như thế nào".
 *
 * Đệm co theo breakpoint (16 → 20 → 24px) và nhịp dọc 24px là hai con số của TOÀN APP — đổi ở đây
 * là đổi mọi trang, đúng thứ một design system phải làm được.
 *
 * Truyền `title` thì tự dựng `PageHeader`; không truyền thì chỉ còn cái khung (dùng cho trang tự lo
 * phần đầu, vd luồng nhiều bước có thanh tiến trình riêng).
 */
export function PageShell({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  /** Nút/bộ lọc/thanh bước đứng đối diện tiêu đề, cùng một hàng. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    /* `space-y-6` chứ KHÔNG phải `flex flex-col gap-6`: 17 trang sắp chuyển sang đây đang dùng
       đúng `space-y-6`, nên giữ y hệt thì việc chuyển là ZERO-VISUAL — chứng minh được bằng cách
       đo đệm/nhịp trước và sau. Đổi sang flex sẽ biến mọi con thành flex item, và những con có
       `h-full`/chiều cao phần trăm sẽ hành xử khác đi ở 17 chỗ cùng lúc.
       `cn()` (twMerge) để nơi gọi đè được nhịp khi trang thật sự cần khác (vd `space-y-4`). */
    <div className={cn("space-y-6 p-4 md:p-5 lg:p-6", className)}>
      {title ? <PageHeader title={title} subtitle={subtitle ?? ""} action={action} /> : null}
      {children}
    </div>
  );
}
