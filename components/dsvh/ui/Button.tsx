import { type VariantProps } from "tailwind-variants";
import { tv } from "../tv";
import { cloneElement, forwardRef, isValidElement } from "react";
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/dsvh/ui/nav/Spinner";

/**
 * Canonical DSVH button.
 * Utility-first variants so the intent is legible to humans and AI alike.
 * Colors reference semantic tokens only (xem src/styles/dsvh-tokens.css).
 *
 * Cách dùng icon:
 *  - icon + text: <Button leftIcon={<Icon/>}>Text</Button> / rightIcon={<Icon/>}
 *  - icon-only:   <Button size="icon" aria-label="…"><Icon/></Button>
 *  - loading:     <Button loading>Đang lưu…</Button> (tự hiện spinner + disable)
 */
export const button = tv({
  base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30",
  variants: {
    variant: {
      /* `orange-strong` chứ không `orange` (sửa 20/08/2026). Đo bằng `ds:probe`: TRẮNG trên
         `#de4400` ra 4.26:1 — trượt AA 4.5 cho chữ 14px/600. 14px semibold KHÔNG tính là "chữ
         lớn": ngưỡng nới chỉ áp cho 18.66px đậm hoặc 24px thường. Trắng trên `#cf3e00` đo được
         4.85:1. Cam thương hiệu `--color-orange` GIỮ NGUYÊN cho viền, icon, đường chart và mọi
         chỗ không mang chữ trắng — chỉ mảng đặc có chữ trắng mới lùi một bậc. */
      solid: "bg-orange-strong text-white hover:opacity-90",
      /**
       * `text-surface` chứ không `text-white` (13/08/2026) — nút này là KHỐI LẬT MÀU: nền dùng token
       * chữ (`ink`) nên tự đảo theo theme. Chữ ghim trắng thì theme tối cho 1.14:1, nút tàng hình.
       * Cặp `ink`/`surface` đảo cùng nhịp: 17.53:1 sáng · 15.10:1 tối. Gate INVERTPAIR gác luật này.
       */
      dark: "bg-ink text-surface hover:opacity-90",
      /**
       * HÀNH ĐỘNG KHÔNG HOÀN TÁC — xoá, huỷ, đình chỉ.
       *
       * Thêm 08/08, đợt 1 của việc bỏ shadcn: `ui/button` có `destructive` và 10 chỗ đang dùng, còn
       * DSVH thì KHÔNG có đích để đổi sang — nên mọi nút xoá đều buộc phải ở lại shadcn. Đây là một
       * khoảng thiếu thật, không phải chuyện đặt tên: đỏ cho việc không hoàn tác là ngôn ngữ màu
       * chuẩn của cả hệ (xem `status.ts`), thiếu nó thì hoặc dùng nút cam (nói sai) hoặc đè
       * `className="bg-red"` từng chỗ (một hex sống riêng ở mười nơi).
       * Màu lấy từ token `red` — cùng nguồn với `statusStyles.error`, không phải một sắc đỏ riêng.
       */
      danger: "bg-red text-white hover:opacity-90",
      ghost:
        "border border-stroke bg-surface text-ink-2 hover:border-stroke-hover hover:bg-stroke-soft hover:text-ink",
      soft: "bg-stroke-soft text-ink hover:bg-surface-hover",
      /**
       * TRONG SUỐT tới khi rê chuột — không viền, không nền.
       *
       * DSVH trước bản này KHÔNG có biến thể nào như vậy: cái tên `ghost` ở trên thực chất là
       * `outline` của shadcn (có `border` + `bg-surface`). Nên mọi chỗ cần một nút chìm hẳn vào nền
       * — nút icon nhỏ, "Quay lại Trang chủ" đứng cạnh CTA — đều phải mượn `ui/button` của shadcn.
       * Bắt được khi port /deploy 06/08: 6 nút `variant="ghost"` của shadcn không có đích để đổi.
       *
       * KHÔNG đổi tên `ghost` thành `outline` cho khớp shadcn: `ghost` đang dùng ở hàng trăm chỗ,
       * đổi tên là một lượt sửa lớn mà không thêm giá trị nào cho người dùng cuối.
       */
      quiet: "bg-transparent text-ink-2 hover:bg-stroke-soft hover:text-ink",
      cream:
        "border border-cream-300 bg-cream-100 text-cream-ink hover:bg-cream-200",
      /**
       * Đường dẫn dạng CHỮ — không viền, không nền, không đệm. Dùng cho "xem tất cả", "tìm hiểu
       * thêm", hành động phụ nằm trong luồng đọc.
       *
       * Trước bản này DSVH KHÔNG có variant nào như vậy (đã ghi trong `dsGaps`), nên nơi gọi phải
       * lấy `ghost` rồi gỡ tay `px-0 hover:bg-transparent`. Cách đó chỉ gỡ được ĐỆM — `ghost` vẫn
       * mang `border border-stroke bg-surface`, nên cái "link" hiện ra là một hộp có viền ôm sát
       * chữ. Đúng lỗi "Xem tất cả phiên đăng nhập bị lỗi shape" bắt được 06/08.
       */
      /**
       * Biến thể tên là `link` thì phải mang MÀU LIÊN KẾT (13/08/2026). Trước đó nó tô `text-orange`
       * — cùng màu với nút hành động chính — nên một dòng chữ "Starter ↗" mở hộp đổi gói trông y hệt
       * nút "Triển khai ngay". Cam là màu HÀNH ĐỘNG; xanh dương là "thứ này dẫn đi đâu đó".
       */
      link: "text-link underline-offset-4 hover:text-link-hover hover:underline",
    },
    size: {
      sm: "h-8 px-3 text-caption",
      md: "h-9 px-4 text-body",
      lg: "h-11 px-5 text-body",
      // `text-body` KHÔNG thừa dù nút icon thường chỉ chứa SVG (cỡ SVG do prop `size` của icon
      // quyết định, class này không đụng tới). Nó bịt một lỗ: đây là size DUY NHẤT trước đây không
      // khai cỡ chữ, nên nút icon có chứa CHỮ sẽ thừa hưởng cỡ của thẻ cha — ra ngoài thang 8 bậc
      // và đổi theo từng chỗ đặt. Bắt được thật 06/08: nút đổi ngôn ngữ ("EN"/"VI") trong header
      // render ở 16px vì kế thừa, trong khi mọi nút cùng hàng đều nằm trong thang.
      icon: "size-9 p-0 text-body",
      /**
       * Nút icon DÀY HƠN cho HÀNG BẢNG — 32px thay vì 36px.
       *
       * Thêm 08/08 khi chuyển `/admin/customers` sang DSVH: cột "Hành động" có ba nút icon trên mỗi
       * hàng, ở 36px chúng đội chiều cao hàng lên và bảng 10 dòng dài thêm gần một màn. shadcn có
       * sẵn `icon-sm` (size-8) và hai màn quản lý tài khoản đang dùng — DSVH thiếu bậc này nên mọi
       * lượt chuyển sang đây đều phải đè bằng `className="size-8"`, tức một con số gõ tay lặp ở
       * từng chỗ. Khai thành bậc thì nó là quyết định của hệ, không phải của người sửa file.
       */
      "icon-sm": "size-8 p-0 text-caption",
    },
  },
  compoundVariants: [
    /**
     * `link` phải gỡ chiều cao + đệm mà `size` vừa đặt. Không thể để trong chính variant `link`:
     * `tailwind-variants` ghép theo THỨ TỰ KHAI BÁO (base → variant → size), nên `size` đứng sau
     * và thắng — `h-9 px-4` của size md sẽ đè `h-auto p-0`. `compoundVariants` chạy SAU cùng nên
     * mới đè được. `active:scale-100` cũng vậy: nhún khi bấm hợp với nút, không hợp với một dòng chữ.
     */
    { variant: "link", class: "h-auto gap-1 p-0 active:scale-100" },
  ],
  defaultVariants: { variant: "solid", size: "md" },
});

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button> & {
    children?: ReactNode;
    /** Icon bên trái text (tự cách bằng gap). */
    leftIcon?: ReactNode;
    /** Icon bên phải text. */
    rightIcon?: ReactNode;
    /** Hiện spinner + disable (giữ nguyên bề rộng nút). */
    loading?: boolean;
    /**
     * Mặc `children` (một phần tử duy nhất) LÀM phần tử gốc thay cho `<button>`, chỉ truyền class
     * xuống. Dùng khi thứ được bấm thật ra là một ĐƯỜNG DẪN: `<Button asChild><a href…>`.
     *
     * Vì sao cần: một liên kết mở tab mới phải là `<a href>` thật — người dùng cần chuột giữa, chuột
     * phải "mở tab mới", và trình đọc màn hình phải nghe "liên kết" chứ không phải "nút". Bọc `<a>`
     * bên trong `<button>` thì HTML không hợp lệ; còn dùng `<button onClick={window.open}>` là vứt
     * bỏ hết những hành vi trên. Trước bản này DSVH không có đường nào làm việc đó nên nơi gọi phải
     * mượn `ui/button` của shadcn (bắt được khi port /deploy 06/08 — 2 chỗ mở website vừa dựng).
     *
     * `loading`/`leftIcon`/`rightIcon` KHÔNG áp dụng ở chế độ này: phần tử gốc là của nơi gọi.
     */
    asChild?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    className,
    children,
    leftIcon,
    rightIcon,
    loading = false,
    disabled,
    asChild = false,
    "aria-busy": ariaBusy,
    ...props
  },
  ref,
) {
  const classes = button({ variant, size, className });

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, { className: cn(classes, child.props.className) });
  }

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      aria-busy={ariaBusy ?? (loading || undefined)}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
