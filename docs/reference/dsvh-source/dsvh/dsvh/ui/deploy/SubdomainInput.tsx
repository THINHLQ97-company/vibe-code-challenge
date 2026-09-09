"use client";

import { useTranslation } from "react-i18next";
import { useId, useRef, useState, type ReactNode, type Ref } from "react";
import { Spinner } from "@/components/dsvh/ui/nav/Spinner";
import { CheckCircleIcon, ErrorIcon, WarningIcon } from "@/components/dsvh/icons";

/**
 * SubdomainInput — nhập subdomain + suffix cố định (.dev.matbao.ai) + trạng thái
 * kiểm tra trùng. Tự lọc ký tự hợp lệ (a-z 0-9 -). Trạng thái do parent set sau
 * khi gọi API check (debounce ở parent).
 */
/**
 * `check_failed` KHÁC `taken`: không phải "tên này hỏng" mà là "chưa hỏi được máy chủ". Nói nhầm
 * thành lỗi thì người dùng đi đổi một cái tên vốn không có vấn đề gì. Trước bản này `/deploy` phải
 * tự dựng lấy trạng thái đó bên ngoài component — và đó chính là lý do cả ô nhập ở đó bị dựng tay.
 */
export type SubdomainStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "check_failed";

export interface SubdomainInputProps {
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  status?: SubdomainStatus;
  /**
   * Đè chữ mặc định của `status` (vd `taken`/`reserved` do SERVER trả lý do CỤ THỂ — "trùng tên
   * website khác", "tên dành riêng cho hệ thống" — cụ thể hơn hẳn câu tĩnh "Đã có người dùng").
   * Không set thì dùng câu mặc định tra theo `MSG_KEY` (đã đa ngữ).
   */
  message?: string;
  label?: string;
  placeholder?: string;
  /**
   * Nút phụ đặt NGAY CẠNH ô nhập, trong cùng hàng (vd nút sinh tên ngẫu nhiên). Có slot này vì
   * component có nhãn ở TRÊN và dòng trạng thái ở DƯỚI: nơi gọi đặt nút bên ngoài rồi `items-end`
   * thì nút canh theo đáy của CẢ KHỐI (gồm dòng trạng thái) chứ không phải theo hàng nhập, lệch
   * đúng bằng chiều cao dòng trạng thái — và nó còn NHẢY mỗi lần trạng thái hiện/ẩn. (Nơi gọi ở
   * `/templates` từng phải bù bằng `mb-[1px]`, một con số ma chỉ đúng ở một trạng thái.)
   */
  action?: ReactNode;
  /**
   * Nút đặt NGAY SAU dòng trạng thái (vd "Thử lại" khi `check_failed`). Khác `action` ở chỗ nó
   * thuộc về CÂU THÔNG BÁO, nên phải đi cùng câu đó — đứng ở hàng nhập thì người đọc không nối
   * được nút với lý do.
   */
  messageAction?: ReactNode;
  /** Để nơi gọi kéo con trỏ về ô này khi bấm "Đi tiếp" mà subdomain chưa hợp lệ. */
  inputRef?: Ref<HTMLInputElement>;
  id?: string;
  className?: string;
}

/**
 * Bỏ dấu tiếng Việt: NFD tách chữ ra khỏi dấu, rồi xoá riêng phần dấu. `đ`/`Đ` không phải chữ có
 * dấu tổ hợp nên NFD không tách được — phải thay tay.
 */
function boDau(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/** Có ký tự ngoài ASCII in được = bộ gõ tiếng Việt đang bật (hoặc người dùng dán chữ có dấu). */
const CHUA_ASCII = /[^ -~]/;

/**
 * Lọc về đúng bộ ký tự của tên miền — nhưng BỎ DẤU TRƯỚC KHI XOÁ.
 *
 * ── LỖI ĐÃ SỬA (17/08/2026, Hoàng Minh Khôi báo) ────────────────────────────────────────────────
 *
 * Bản trước là một dòng: `value.toLowerCase().replace(/[^a-z0-9-]/g, "")` — tức XOÁ THẲNG mọi ký
 * tự ngoài bảng. Với người đang bật Unikey/Telex thì đó là im lặng nuốt phím:
 *
 *   gõ "Axys" → Telex đọc "ax" thành "ã", "ys" thành "ý" → ô nhận "ãý"
 *   → `replace` xoá cả hai vì không nằm trong [a-z0-9-] → ô RỖNG
 *
 * Người dùng bấm bốn phím, màn hình không hiện gì, và cũng không có câu nào nói vì sao. Họ kết
 * luận ô nhập hỏng — đúng như phiếu báo lỗi ghi.
 *
 * Nay bỏ dấu trước: "ãý" → "ay". Chữ vẫn không đúng ý người gõ (không cách nào đoán ngược được
 * "axys" từ "ãý" mà không tự viết lại cả bộ gõ Telex), nhưng có hai điều khác hẳn: màn hình CÓ
 * phản hồi cho mỗi phím, và ô tự nói ra rằng bộ gõ tiếng Việt đang bật — xem `imeHint`.
 */
function locTenMien(raw: string) {
  return boDau(raw).toLowerCase().replace(/[^a-z0-9-]/g, "");
}

// Chỉ TONE là hằng — chữ tra i18n lúc chạy. Trước đây cả câu nằm cứng ở đây bằng tiếng Việt, nên
// người bật bản tiếng Anh vẫn đọc thấy "Còn trống — dùng được". Prop `message` vẫn đè được như cũ:
// lý do CỤ THỂ do máy chủ trả (trùng tên, tên dành riêng) luôn quý hơn câu tĩnh tra theo trạng thái.
const TONE: Record<Exclude<SubdomainStatus, "idle">, string> = {
  checking: "text-ink-3",
  available: "text-teal",
  taken: "text-red",
  invalid: "text-red",
  check_failed: "text-amber",
};

const MSG_KEY: Record<Exclude<SubdomainStatus, "idle">, string> = {
  checking: "ds.subdomain_checking",
  available: "ds.subdomain_available",
  taken: "ds.subdomain_taken",
  invalid: "ds.subdomain_invalid",
  check_failed: "ds.subdomain_check_failed",
};

export function SubdomainInput({
  value,
  onChange,
  suffix = ".dev.matbao.ai",
  status = "idle",
  message,
  label = "Subdomain",
  placeholder = "myapp",
  action,
  messageAction,
  inputRef,
  id,
  className = "",
}: SubdomainInputProps) {
  const { t } = useTranslation();
  const genId = useId();
  const inputId = id || genId;
  const bad = status === "taken" || status === "invalid";

  /**
   * Bộ gõ tiếng Việt đang bật → nói ra. Đây là nửa thứ hai của bản vá 17/08: chỉ bỏ dấu thôi thì ô
   * vẫn "tự đổi chữ của người ta" mà không giải thích, và họ sẽ thử lại đúng cách gõ đó lần nữa.
   */
  const [goTiengViet, setGoTiengViet] = useState(false);

  /**
   * Trong lúc bộ gõ đang GHÉP chữ (IME thật: macOS, Windows IME, một số bản Unikey) thì để yên —
   * viết đè `value` giữa chừng làm hỏng chuỗi đang ghép. Xong mới lọc.
   *
   * Unikey trên Windows thường KHÔNG phát sự kiện ghép mà gửi thẳng phím + backspace, nên nhánh này
   * không phải lúc nào cũng chạy; nó là lớp phòng cho các bộ gõ có ghép thật, còn lớp thật sự cứu
   * được ca của Unikey là `locTenMien` + lời nhắc bên dưới.
   */
  const dangGhep = useRef(false);

  const nhan = (raw: string) => {
    setGoTiengViet(CHUA_ASCII.test(raw));
    onChange(locTenMien(raw));
  };

  return (
    <div className={`flex w-full flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-caption font-medium text-ink-2">
          {label}
        </label>
      )}
      {/* Hàng nhập + nút phụ: nút nằm cùng hàng với ô nhập, KHÔNG chịu ảnh hưởng của nhãn trên
          hay dòng trạng thái dưới. */}
      <div className="flex items-center gap-2">
      <div
        className={`flex min-w-0 flex-1 items-center rounded-lg border bg-surface pr-2.5 transition-colors focus-within:ring-2 focus-within:ring-orange/30 ${
          bad ? "border-red" : "border-stroke focus-within:border-orange"
        }`}
      >
        <input
          ref={inputRef}
          id={inputId}
          value={value}
          onChange={(e) => {
            if (dangGhep.current) return;
            nhan(e.target.value);
          }}
          onCompositionStart={() => {
            dangGhep.current = true;
          }}
          onCompositionEnd={(e) => {
            dangGhep.current = false;
            nhan(e.currentTarget.value);
          }}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          /* `inputMode="url"` gợi ý bàn phím ASCII trên di động — không tắt được Unikey trên máy
             bàn, nhưng bớt được đúng ca này ở điện thoại. */
          inputMode="url"
          aria-invalid={bad || undefined}
          aria-describedby={`${inputId}-status`}
          className="h-9 min-w-0 flex-1 rounded-l-lg bg-transparent px-3 text-body text-ink outline-none placeholder:text-ink-3"
        />
        <span className="shrink-0 select-none text-caption text-ink-3">{suffix}</span>
        <span className="ml-2 grid size-5 shrink-0 place-items-center">
          {status === "checking" && <Spinner size="sm" />}
          {status === "available" && <CheckCircleIcon size={18} className="text-teal" />}
          {status === "check_failed" && <WarningIcon size={18} className="text-amber" />}
          {bad && <ErrorIcon size={18} className="text-red" />}
        </span>
      </div>
        {action}
      </div>
      {/* `aria-live` nằm ở khối LUÔN TỒN TẠI, không phải ở câu chỉ hiện khi có trạng thái: trình
          đọc màn hình chỉ đọc thay đổi bên trong một vùng nó đã thấy từ đầu — gắn vào phần tử vừa
          mới sinh ra thì nó im lặng. */}
      <div id={`${inputId}-status`} aria-live="polite" className="empty:hidden">
        {/* Lời nhắc bộ gõ đứng TRƯỚC dòng trạng thái, và hai thứ cùng hiện được.
            Trước hết vì nó giải thích chính cái vừa xảy ra dưới ngón tay người dùng; sau nữa vì
            dòng trạng thái lúc đó thường nói sai chuyện: gõ "Axys" ra "ay" thì trạng thái báo "tên
            quá ngắn" — đúng theo dữ liệu, nhưng trả lời một câu hỏi mà người dùng không hỏi.
            Tone AMBER chứ không đỏ (luật #7): người dùng không làm gì sai, chỉ là máy họ đang bật
            một thứ mà ô này không nhận. */}
        {goTiengViet && (
          <p className="flex items-start gap-1.5 text-meta text-amber-strong dark:text-amber">
            <WarningIcon size={14} className="mt-px shrink-0" aria-hidden />
            {/* Câu này phải đúng cho CẢ HAI ca, vì ô không phân biệt được chúng:
                  · gõ "Axys" lúc bật Telex → ra "ay", KHÔNG phải thứ người ta muốn → cần tắt bộ gõ;
                  · dán "Đường-Học" → ra "duong-hoc", hợp lệ và còn trống → không cần làm gì thêm.
                Bản đầu viết thẳng "Tắt bộ gõ rồi nhập lại" nên ở ca thứ hai nó bảo người dùng đi
                sửa một thứ vốn đã đúng. Nay nói VIỆC ĐÃ XẢY RA trước, còn cách sửa thì kèm điều
                kiện — người đọc tự đối chiếu với ô nhập trước mắt. */}
            <span>
              Đã tự bỏ dấu tiếng Việt — tên miền chỉ nhận a–z, 0–9 và dấu gạch ngang. Nếu chữ hiện ra
              không giống thứ bạn gõ, hãy tắt bộ gõ (Unikey/Telex) rồi nhập lại.
            </span>
          </p>
        )}
        {status !== "idle" && (
          <p className={`flex flex-wrap items-center gap-2 text-meta ${TONE[status]}`}>
            <span>{message ?? t(MSG_KEY[status])}</span>
            {messageAction}
          </p>
        )}
      </div>
    </div>
  );
}
