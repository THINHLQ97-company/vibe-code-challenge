"use client";
import { useState } from "react";
import type { TokenEntry } from "@/components/dsvh/tokens-data";
import { cn } from "@/lib/utils";

/**
 * MỘT Ô MÀU trong bảng tra token — dùng ở `/dsvh/bang-token`.
 *
 * Vì sao nằm riêng một tệp (13/08/2026): bản đầu tôi dựng nó bên trong `demos.tsx` rồi cho hai mục
 * tài liệu `colors` và `tokens` cùng nhúng qua khoá demo `ColorGrid`. Kết quả là BA trang cùng trả
 * lời câu hỏi "màu nào?" — `bang-token`, `tokens`, `colors` — mà hai trong số đó giống hệt nhau.
 * Chủ dự án bắt đúng: AI đọc tài liệu này sẽ bốc bừa một trong ba rồi trôi dần.
 *
 * Hai mục kia vốn CỐ Ý rỗng để nhường bảng cho `bang-token`; cái đáng sửa là câu trỏ đường viết như
 * một lời từ chối, không phải sự nhường chỗ. Nay bảng nằm đúng MỘT nơi, và ô màu là component dùng
 * chung để nơi ấy không phải dựng tay.
 */
export function ColorSwatch({ token }: { token: TokenEntry }) {
  const [copied, setCopied] = useState(false);
  const utility = `bg-${token.utility}`;

  const copy = () => {
    navigator.clipboard?.writeText(utility).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      },
      () => {},
    );
  };

  return (
    <button
      type="button"
      onClick={copy}
      // Bấm để chép tên utility — việc designer làm nhiều nhất khi mở bảng màu. `text-left` vì đây
      // là một thẻ dữ liệu, không phải nút lệnh; canh giữa chữ sẽ đọc ra như nút bấm.
      className="group w-full overflow-hidden rounded-lg border border-stroke bg-surface text-left transition-colors hover:border-stroke-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30"
      aria-label={`Chép ${utility}`}
    >
      {/* HAI NỬA sáng/tối trong cùng một ô: token đổi màu theo theme là chuyện phải THẤY, không phải
          đọc. Token không có giá trị tối thì tô liền một khối — đúng nghĩa "giữ nguyên hue". */}
      {/* Kẻ chân dải màu: token trắng (`surface` #ffffff) và cả nhóm cream gần như tan vào nền thẻ —
          trong một BẢNG MÀU thì trắng phải nhìn ra được là một màu, không phải một khoảng trống. */}
      <span className="flex h-14 w-full border-b border-stroke" aria-hidden>
        <span className="h-full flex-1" style={{ background: token.light }} />
        {token.dark && <span className="h-full flex-1" style={{ background: token.dark }} />}
      </span>
      <span className="block space-y-0.5 p-2">
        <span className="flex items-center gap-1.5">
          <code className="min-w-0 flex-1 truncate text-caption font-medium text-ink">{token.utility}</code>
          <span className={cn("shrink-0 text-micro", copied ? "text-teal" : "text-ink-3 opacity-0 transition-opacity group-hover:opacity-100")}>
            {copied ? "đã chép" : "chép"}
          </span>
        </span>
        <span className="block truncate text-micro tabular-nums text-ink-3">
          {token.light}
          {token.dark ? ` · tối ${token.dark}` : " · chung 2 theme"}
        </span>
      </span>
    </button>
  );
}
