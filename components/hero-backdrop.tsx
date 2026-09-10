import { DarkBandArt } from "@/components/landing-art";

/**
 * Lớp nền cho các dải TỐI. Xếp chồng ba tầng, từ dưới lên:
 *
 *   1. `bg-canvas`      — màu nền thật, luôn có mặt kể cả khi ảnh chưa tải hoặc chưa tồn tại.
 *   2. `DarkBandArt`    — quầng sáng + lưới chấm vẽ bằng SVG, co giãn theo mọi bề ngang.
 *   3. ảnh nền (nếu có) — WebP.
 *
 * ── VÌ SAO ẢNH NÊN CÓ KÊNH ALPHA MỜ DẦN ────────────────────────────────────────────────────
 * Cách cũ: ảnh đặc + một lớp phủ gradient CSS đè lên để chữ đọc được. Lớp phủ đó dìm luôn phần
 * tranh, và mỗi lần đổi ảnh lại phải chỉnh tay độ đậm cho vừa.
 *
 * Cách này: ảnh tự mờ dần về TRONG SUỐT ở rìa (đúng cách trang tham chiếu làm — đo được 3,5%
 * pixel alpha=0 và ~11% mờ một phần). Ảnh hoà thẳng vào `canvas` bên dưới, không cần lớp phủ, và
 * người vẽ kiểm soát được chỗ nào đậm chỗ nào nhạt thay vì phó mặc cho một gradient chung.
 *
 * `fade` giữ lại lớp phủ cho ảnh ĐẶC (chưa có bản alpha) — bỏ đi khi ảnh mới về.
 */
export function HeroBackdrop({
  image,
  scrim = false,
  position = "center",
}: {
  /** Đường dẫn ảnh trong `public/`. Bỏ trống thì chỉ còn màu nền + quầng sáng SVG. */
  image?: string;
  /**
   * Lớp phủ giúp chữ đọc được. Bật khi ảnh có vùng SÁNG nằm dưới chữ — kể cả ảnh đã có alpha:
   * alpha chỉ lo chuyện hoà nền ở rìa, không lo tương phản ở giữa.
   */
  scrim?: boolean;
  position?: "top" | "center";
}) {
  return (
    <>
      <DarkBandArt />
      {image && (
        /**
         * Ảnh VÀ lớp phủ nằm chung MỘT khung có tỉ lệ đúng bằng ảnh gốc (1675×2048).
         *
         * Bản trước đặt lớp phủ lên `inset-0` của cả trang: các mốc phần trăm khi đó tính trên
         * ~5000px chiều cao trang, nên ở chỗ tiêu đề hero (y≈300px) gradient mới chạy được 6% và
         * chỉ phủ ~10% — đo lại ra 2,20:1, vẫn trượt. Neo vào khung ảnh thì mốc phần trăm khớp
         * đúng với chỗ đã đo.
         */
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 aspect-[1675/2048]">
          <div
            className={`absolute inset-0 bg-[length:100%_auto] bg-no-repeat ${
              position === "top" ? "bg-top" : "bg-center"
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
          {scrim && (
            /**
             * Độ đậm lấy từ SỐ ĐO trên chính ảnh này (dựng ở bề ngang 1440, đã chồng alpha lên
             * `canvas`). Alpha tối thiểu để chữ `cream` đạt AA 4,5:1, theo vị trí trong khung ảnh:
             *
             *   12% (nhãn đầu)   0%   ← chỗ này ảnh vốn đã tối, phủ vào là phí phần tranh đẹp nhất
             *   18% (tiêu đề)    58%
             *   24–45%           66%
             *   62%              56%
             *   85%              48%
             */
            <div
              className="absolute inset-0"
              style={{
                background: [
                  "linear-gradient(to bottom",
                  "color-mix(in srgb, var(--color-canvas) 8%, transparent) 0%",
                  "color-mix(in srgb, var(--color-canvas) 26%, transparent) 10%",
                  "color-mix(in srgb, var(--color-canvas) 76%, transparent) 15%",
                  "color-mix(in srgb, var(--color-canvas) 82%, transparent) 26%",
                  "color-mix(in srgb, var(--color-canvas) 80%, transparent) 48%",
                  "color-mix(in srgb, var(--color-canvas) 66%, transparent) 64%",
                  "color-mix(in srgb, var(--color-canvas) 56%, transparent) 86%",
                  "color-mix(in srgb, var(--color-canvas) 46%, transparent) 100%)",
                ].join(", "),
              }}
            />
          )}
        </div>
      )}
    </>
  );
}
