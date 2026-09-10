/**
 * Mô phỏng màn hình vibe code — cửa sổ soạn thảo bên trái, khung trò chuyện với AI bên phải.
 *
 * Vẽ bằng HTML + token màu chứ không dùng ảnh chụp: ảnh chụp màn hình thật sẽ lộ tên máy, đường
 * dẫn thư mục, có khi cả tên khách hàng — đúng thứ thể lệ cấm mang ra ngoài. Bản mô phỏng này chỉ
 * cần nói cho thí sinh biết "phía trái là mã, phía phải là chỗ bạn nói chuyện với AI".
 *
 * Không dùng `font-mono` (luật #12 DSVH: một font duy nhất) — các dòng mã ở đây là hình khối trang
 * trí, không phải mã thật để đọc, nên vẽ bằng thanh màu thay vì chữ.
 */

/** Một dòng mã giả: thụt đầu dòng + vài đoạn màu. */
function CodeLine({ indent = 0, parts }: { indent?: number; parts: [number, string][] }) {
  return (
    <div className="flex items-center gap-1.5" style={{ paddingLeft: indent * 12 }}>
      {parts.map(([w, cls], i) => (
        <span key={i} className={`h-1.5 rounded-full ${cls}`} style={{ width: w }} />
      ))}
    </div>
  );
}

export function VscodeMockup() {
  return (
    <div className="overflow-hidden rounded-card border border-cream/12 bg-canvas/70">
      {/* Thanh cửa sổ */}
      <div className="flex items-center gap-2 border-b border-cream/10 px-3.5 py-2.5">
        <span className="size-2.5 rounded-full bg-red/70" />
        <span className="size-2.5 rounded-full bg-amber/70" />
        <span className="size-2.5 rounded-full bg-teal/70" />
        <span className="ml-2 text-meta text-cream/45">so-theo-doi-thiet-bi — trình soạn thảo</span>
      </div>

      <div className="grid md:grid-cols-[1.15fr_1fr]">
        {/* Bên trái: cây thư mục + mã */}
        <div className="flex border-b border-cream/10 md:border-b-0 md:border-r">
          <div className="hidden w-32 shrink-0 border-r border-cream/10 p-3 sm:block">
            <p className="text-micro font-semibold uppercase tracking-wide text-cream/35">Dự án</p>
            <ul className="mt-2 space-y-1.5 text-meta text-cream/55">
              <li className="rounded px-1.5 py-0.5 text-cream/85">app/</li>
              <li className="rounded bg-orange/15 px-1.5 py-0.5 text-orange-bright">page.tsx</li>
              <li className="px-1.5 py-0.5">db.ts</li>
              <li className="px-1.5 py-0.5">README.md</li>
            </ul>
          </div>
          <div className="flex-1 space-y-2 p-3.5">
            <CodeLine parts={[[34, "bg-magenta/55"], [56, "bg-cream/30"], [22, "bg-teal/45"]]} />
            <CodeLine indent={1} parts={[[46, "bg-cream/25"], [70, "bg-orange/40"]]} />
            <CodeLine indent={1} parts={[[30, "bg-teal/45"], [88, "bg-cream/25"]]} />
            <CodeLine indent={2} parts={[[62, "bg-cream/20"], [26, "bg-magenta/45"]]} />
            <CodeLine indent={1} parts={[[40, "bg-cream/25"]]} />
            <CodeLine parts={[[24, "bg-magenta/55"], [64, "bg-cream/30"]]} />
            <CodeLine indent={1} parts={[[52, "bg-orange/40"], [34, "bg-cream/25"]]} />
            <CodeLine indent={1} parts={[[78, "bg-cream/20"]]} />
          </div>
        </div>

        {/* Bên phải: trò chuyện với AI */}
        <div className="p-3.5">
          <p className="text-micro font-semibold uppercase tracking-wide text-cream/35">
            Trò chuyện với AI
          </p>

          <div className="mt-3 space-y-2.5">
            <div className="ml-6 rounded-xl rounded-br-sm border border-orange/30 bg-orange/12 px-3 py-2">
              <p className="text-meta leading-relaxed text-cream/85">
                Thêm màn hình danh sách thiết bị, mỗi dòng có tên, phòng đặt và ngày bảo trì gần
                nhất. Lấy dữ liệu từ bảng thiet_bi.
              </p>
            </div>

            <div className="mr-6 rounded-xl rounded-bl-sm border border-cream/12 bg-cream/[0.05] px-3 py-2">
              <p className="text-meta leading-relaxed text-cream/70">
                Đã tạo màn hình danh sách và truy vấn dữ liệu. Bạn mở thử ở địa chỉ xem trước, nếu
                đúng ý thì tôi làm tiếp phần nhắc lịch bảo trì.
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-teal" />
                <span className="text-micro text-teal">Đã cập nhật 2 tệp</span>
              </div>
            </div>

            <div className="ml-6 rounded-xl rounded-br-sm border border-orange/30 bg-orange/12 px-3 py-2">
              <p className="text-meta leading-relaxed text-cream/85">
                Đúng rồi. Làm tiếp phần nhắc lịch.
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
      </div>
    </div>
  );
}
