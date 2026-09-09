import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  showShimmer = false,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  /** Opt-in: dải shimmer indeterminate + fill tăng mượt (dùng cho tiến trình deploy). Mặc định TẮT — không đổi các nơi dùng Progress khác. */
  showShimmer?: boolean
}) {
  const pct = value || 0
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 bg-primary",
          // showShimmer → tăng mượt (transform, 500ms ease-out) thay vì nhảy; mặc định giữ transition-all cũ.
          showShimmer ? "transition-transform duration-500 ease-out" : "transition-all"
        )}
        style={{ transform: `translateX(-${100 - pct}%)` }}
      />
      {showShimmer && pct > 0 && pct < 100 && (
        // Dải sáng chạy trái→phải, CLIP trong vùng đã fill (width=pct%). motion-reduce → ẩn hẳn.
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden motion-reduce:hidden"
          style={{ width: `${pct}%` }}
        >
          <span className="absolute inset-y-0 left-0 w-1/2 animate-[deploy-shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        </span>
      )}
    </ProgressPrimitive.Root>
  )
}

export { Progress }
