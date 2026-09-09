import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Luật #21 (DSVH.html): thang chữ tự đặt PHẢI khai cho tailwind-merge ở CẢ HAI đường
 * gộp class — `tv()` (components/dsvh/tv.ts) và `cn()` ở đây. Không khai thì
 * tailwind-merge không nhận `text-body` là cỡ chữ, đoán nhầm sang nhóm MÀU CHỮ và
 * class cỡ chữ đứng sau sẽ ĐÈ MẤT class màu (nút CTA cam ra chữ đen).
 * `rounded-card` dính đúng cơ chế đó ở nhóm bo góc.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["micro", "meta", "caption", "body", "title", "page", "kpi", "hero"] }],
      rounded: [{ rounded: ["card"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
