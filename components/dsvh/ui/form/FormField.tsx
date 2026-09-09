"use client";

import type { ReactNode } from "react";
import { HintTip } from "@/components/dsvh/ui/overlay/HintTip";
import { Label } from "./Label";

export interface FormFieldProps {
  label?: string;
  /** Dòng chữ hiện SẴN dưới ô nhập — cho câu ngắn, luôn đáng đọc. Câu dài dùng `tip`. */
  hint?: string;
  /**
   * Câu BỔ TRỢ — nằm trong tooltip cạnh NHÃN, không chiếm dòng nào (thêm 26/08/2026).
   *
   * Chủ dự án: "những cái dòng phụ có tooltip cho tôi để trong đó, không để dài ra như vậy làm vỡ
   * bố cục UI". Đo trên /admin/nodes tab Cấu hình: chín câu hướng dẫn dài 50–282 ký tự, mỗi câu
   * chiếm hai đến ba dòng. Trong lưới hai cột, ô nào cũng cao bằng ô cao nhất cùng hàng — nên một
   * câu ba dòng ở cột phải đẩy cả hàng giãn ra, và cột trái (không có câu nào) thành một khoảng
   * trắng dài. Bố cục vỡ không phải vì chữ xấu mà vì chiều cao hàng bị một ô quyết định.
   *
   * Ranh giới với `hint` là CHỖ ĐỨNG, không phải nội dung — cùng luật `CardHeader` đã chốt 20/08:
   * câu người đọc cần thấy MỖI LẦN ⇒ `hint`; câu đọc một lần là hiểu ⇒ `tip`.
   */
  tip?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}

export function FormField({
  label,
  hint,
  tip,
  error,
  required = false,
  children,
  className = "",
  htmlFor,
}: FormFieldProps) {
  return (
    <div className={`flex w-full flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex items-center gap-1.5">
          <Label htmlFor={htmlFor} required={required}>
            {label}
          </Label>
          {tip ? <HintTip content={tip} /> : null}
        </div>
      )}
      {children}
      {error ? (
        <p className="text-caption text-orange-strong dark:text-orange">{error}</p>
      ) : hint ? (
        <p className="text-caption text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}
