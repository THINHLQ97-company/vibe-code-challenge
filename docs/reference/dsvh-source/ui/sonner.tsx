"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useTheme } from "@/providers/theme-provider"
import { CheckCircleIcon, InfoIcon, WarningIcon, ErrorIcon } from "@/components/dsvh/icons"
import { Spinner } from "@/components/dsvh/ui/nav/Spinner"

// Toast dùng nguyên `sonner` (đổi hẳn sang ToastProvider riêng của DSVH sẽ phải sửa
// mọi chỗ gọi toast.success/error trong toàn app — ngoài phạm vi 1 trang). Chỉ đổi
// DA: icon Phosphor + token DSVH qua toastOptions.classNames (statusStyles.softPill
// cho info/success/warning, loud đỏ+vàng cho error — đúng luật status.ts), và đọc
// theme thật từ ThemeProvider của app (trước đây import nhầm "next-themes", không
// tồn tại provider nào bọc nên theme không bao giờ đồng bộ đúng sáng/tối thật).
const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      icons={{
        success: <CheckCircleIcon size={16} />,
        info: <InfoIcon size={16} />,
        warning: <WarningIcon size={16} />,
        error: <ErrorIcon size={16} />,
        loading: <Spinner size="sm" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-start gap-3 rounded-xl border p-4 text-[14px] shadow-lg bg-surface border-stroke text-ink",
          title: "font-semibold leading-5 text-ink",
          description: "mt-0.5 leading-relaxed text-ink-2",
          actionButton: "rounded-lg bg-orange px-3 py-1.5 text-[13px] font-semibold text-white",
          cancelButton: "rounded-lg border border-stroke px-3 py-1.5 text-[13px] text-ink-2",
          closeButton: "border-stroke bg-surface text-ink-2 hover:bg-stroke-soft",
          icon: "shrink-0",
          // Nền phải ĐẶC (color-mix ra màu solid), không phải bg-teal/10 thẳng —
          // token opacity kiểu đó chỉ hợp khi có 1 lớp nền đặc NẰM DƯỚI nó (như
          // Badge/Card ngồi trên bg-surface sẵn có). Toast là lớp `fixed` nổi
          // trên cùng, tự nó là nền — dùng opacity trực tiếp làm nó trong suốt,
          // lộ cả header phía sau ra (bắt được thật, không phải DSVH gốc sai mà
          // do copy nhầm ngữ cảnh dùng token: Badge nằm SẴN trên nền đặc, Toast thì không).
          success: "!bg-[color-mix(in_oklab,var(--color-teal)_10%,var(--color-surface))] !border-teal/30 [&_[data-icon]]:!text-teal",
          info: "!bg-surface-2 !border-stroke [&_[data-icon]]:!text-ink-2",
          warning: "!bg-[color-mix(in_oklab,var(--color-amber)_15%,var(--color-surface))] !border-amber/40 [&_[data-icon]]:!text-amber-strong",
          error: "!bg-red !border-red-strong !text-yellow [&_[data-title]]:!text-yellow [&_[data-description]]:!text-yellow/90 [&_[data-icon]]:!text-yellow",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
