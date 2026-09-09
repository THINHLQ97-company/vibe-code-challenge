import * as React from "react"

import { cn } from "@/lib/utils"

// Base TRUNG TÍNH (shadcn default): cao theo nội dung từ min-h-16, KHÔNG kẹp chiều cao —
// để consumer tự quyết (rows=N, min-h-*, field-sizing-fixed cho editor có gutter…).
// `autoSize` = OPT-IN cho ô nhỏ 1 dòng tự cao dần tới 74px rồi cuộn (kiểu chat/prompt);
// chỉ bật ở đúng ô cần, KHÔNG áp cứng cho mọi textarea (tránh cắt editor HTML/env/mô tả).
function Textarea({
  className,
  autoSize = false,
  ...props
}: React.ComponentProps<"textarea"> & { autoSize?: boolean }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[1px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
        autoSize && "min-h-[36px] max-h-[74px] resize-none overflow-y-auto",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
