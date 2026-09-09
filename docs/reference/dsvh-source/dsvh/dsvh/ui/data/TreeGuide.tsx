import type { ReactNode } from "react";

/**
 * TreeGuide — nét nối THƯ MỤC CON của một dòng con, vẽ trước tên nó.
 *
 * Vì sao cần một primitive riêng thay vì thụt lề bằng `pl-8`: thụt lề chỉ nói "dòng này lùi vào",
 * nó KHÔNG nói dòng lùi vào đó thuộc về ai, cũng không nói đây là phần tử cuối hay còn nữa. Trong
 * một bảng dài, mắt phải tự bắc cầu ngược lên trên để đoán — mà "thuộc về nhau" là quan hệ THỊ
 * GIÁC, phải vẽ ra thì mới đọc được. Nét nối trả lời cả ba câu cùng lúc: thuộc ai (đường dọc chạy
 * lên), là con (khuỷu rẽ ngang), còn nữa hay hết (đường dọc chạy tiếp hay dừng giữa chừng).
 *
 * Trang trí thuần → `aria-hidden`. Quan hệ cha–con phải được nói bằng NGỮ NGHĨA ở nơi gọi
 * (`aria-level`/`aria-owns`, hoặc chữ trong nội dung), không phải bằng mấy đường kẻ này.
 *
 * Dùng token `stroke` (đường kẻ trung tính), không dùng màu nhấn: nét nối là cấu trúc, không phải
 * trạng thái. Xem luật #8.
 */
export function TreeGuide({
  last = false,
  depth = 1,
  className = "",
}: {
  /** Phần tử CUỐI trong nhánh → đường dọc dừng ở khuỷu, không chạy tiếp xuống. */
  last?: boolean;
  /** Số cấp lùi vào (1 = con trực tiếp). Mỗi cấp thêm một đường dọc để nhánh trên không đứt. */
  depth?: number;
  className?: string;
}) {
  return (
    <span aria-hidden className={`flex shrink-0 self-stretch ${className}`}>
      {/* Các cấp CHA ở phía trên: chỉ có đường dọc chạy suốt, không có khuỷu. Thiếu chúng thì cây
          lồng hai cấp trở lên sẽ đứt đoạn ở giữa. */}
      {Array.from({ length: Math.max(0, depth - 1) }).map((_, i) => (
        <span key={i} className="relative w-5">
          <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-stroke" />
        </span>
      ))}
      {/* Cấp của chính dòng này: đường dọc (nửa trên, hoặc suốt nếu còn anh em phía dưới) + khuỷu. */}
      <span className="relative w-5">
        <span
          className={`absolute left-1/2 top-0 w-px -translate-x-1/2 bg-stroke ${last ? "h-1/2" : "h-full"}`}
        />
        <span className="absolute left-1/2 top-1/2 h-px w-1/2 bg-stroke" />
      </span>
    </span>
  );
}

/**
 * TreeRow — một dòng trong cây: nét nối + nội dung, canh giữa theo chiều dọc.
 *
 * Có mặt để nơi gọi không phải tự nhớ bộ `flex items-stretch` + `self-stretch` — thiếu `items-stretch`
 * thì `TreeGuide` co lại bằng chiều cao chữ và đường dọc không chạm được dòng kế tiếp, cây đứt
 * thành từng khúc rời.
 */
export function TreeRow({
  last = false,
  depth = 1,
  children,
  className = "",
}: {
  last?: boolean;
  depth?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-stretch ${className}`}>
      <TreeGuide last={last} depth={depth} />
      <div className="flex min-w-0 flex-1 items-center gap-2 py-1.5">{children}</div>
    </div>
  );
}
