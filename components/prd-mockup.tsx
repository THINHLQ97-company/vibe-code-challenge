/**
 * Mô phỏng bước VIẾT PRD: bên trái bạn kể bài toán cho AI, bên phải là tài liệu PRD nó dựng ra.
 *
 * Vẽ bằng HTML + token màu chứ không dùng ảnh chụp thật: ảnh chụp màn hình sẽ lộ tên máy, đường
 * dẫn thư mục, có khi cả tên khách hàng — đúng thứ thể lệ cấm mang ra ngoài. Bản mô phỏng chỉ cần
 * nói được một ý: bạn mô tả bằng tiếng Việt thường ngày, AI trả về tài liệu có cấu trúc.
 *
 * Không dùng `font-mono` (luật #12 DSVH: một font duy nhất).
 */

/** Một dòng chữ giả trong tài liệu — thanh màu thay cho chữ, để mắt đọc ra "đây là văn bản". */
function TextLine({ w, dim = false }: { w: number | string; dim?: boolean }) {
  return (
    <span
      className={`block h-1.5 rounded-full ${dim ? "bg-cream/12" : "bg-cream/20"}`}
      style={{ width: typeof w === "number" ? `${w}%` : w }}
    />
  );
}

export function PrdMockup() {
  return (
    <div className="overflow-hidden rounded-card border border-cream/12 bg-canvas/70">
      <div className="flex items-center gap-2 border-b border-cream/10 px-3.5 py-2.5">
        <span className="size-2.5 rounded-full bg-red/70" />
        <span className="size-2.5 rounded-full bg-amber/70" />
        <span className="size-2.5 rounded-full bg-teal/70" />
        <span className="ml-2 text-meta text-cream/45">Viết PRD cùng AI</span>
      </div>

      <div className="grid md:grid-cols-2">
        {/* Trái — bạn kể bài toán */}
        <div className="border-b border-cream/10 p-3.5 md:border-b-0 md:border-r">
          <p className="text-micro font-semibold uppercase tracking-wide text-cream/35">
            Bạn mô tả bài toán
          </p>

          <div className="mt-3 space-y-2.5">
            <div className="ml-5 rounded-xl rounded-br-sm border border-orange/30 bg-orange/12 px-3 py-2">
              <p className="text-meta leading-relaxed text-cream/85">
                Tôi làm ở phòng Vận hành. Mỗi tuần tôi phải dò lại file Excel thiết bị dùng chung để
                biết máy nào tới hạn bảo trì, mất khoảng hai tiếng và hay sót.
              </p>
            </div>

            <div className="mr-5 rounded-xl rounded-bl-sm border border-cream/12 bg-cream/[0.05] px-3 py-2">
              <p className="text-meta leading-relaxed text-cream/70">
                Tôi sẽ dựng PRD gồm sáu phần: bài toán, người dùng, phạm vi, luồng chính, dữ liệu và
                tiêu chí hoàn thành. Bạn xác nhận giúp: sản phẩm này chỉ dùng nội bộ phòng Vận hành
                phải không?
              </p>
            </div>

            <div className="ml-5 rounded-xl rounded-br-sm border border-orange/30 bg-orange/12 px-3 py-2">
              <p className="text-meta leading-relaxed text-cream/85">
                Đúng rồi. Khoảng 8 người dùng, dữ liệu để mình tự tạo giả hết.
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-lg border border-cream/12 bg-canvas/60 px-2.5 py-2">
            <span className="h-1.5 flex-1 rounded-full bg-cream/15" />
            <span className="rounded-md bg-orange/25 px-2 py-1 text-micro font-semibold text-orange-bright">
              Gửi
            </span>
          </div>
        </div>

        {/* Phải — tài liệu PRD dựng ra */}
        <div className="p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-micro font-semibold uppercase tracking-wide text-cream/35">
              Tài liệu PRD sinh ra
            </p>
            <span className="rounded-full border border-teal/40 bg-teal/12 px-2 py-0.5 text-micro font-semibold text-teal">
              .md
            </span>
          </div>

          <div className="mt-3 space-y-3 rounded-lg border border-cream/10 bg-canvas/60 p-3">
            <p className="text-caption font-bold text-cream">Sổ theo dõi thiết bị văn phòng</p>

            {[
              { h: "1. Bài toán", lines: [96, 78] },
              { h: "2. Người dùng", lines: [70] },
              { h: "3. Phạm vi", lines: [88, 62] },
              { h: "4. Luồng chính", lines: [92] },
              { h: "5. Dữ liệu", lines: [74] },
              { h: "6. Tiêu chí hoàn thành", lines: [66] },
            ].map((sec, i) => (
              <div key={sec.h} className="space-y-1.5">
                <p className="text-meta font-semibold text-orange-bright">{sec.h}</p>
                {sec.lines.map((w, j) => (
                  <TextLine key={j} w={w} dim={i > 3} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
