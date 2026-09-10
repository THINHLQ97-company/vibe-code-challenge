import type { ReactNode } from "react";
import {
  StepRegister,
  StepApproved,
  StepDeploy,
  StepSecurity,
  StepSurvey,
  MarkBroadcast,
} from "@/components/landing-art";

/**
 * Nội dung SÁU MỐC, tách khỏi component để trang chủ và trang hướng dẫn dùng chung một bản.
 *
 * Mỗi mốc trả lời đúng hai câu mà thí sinh hỏi khi đứng ở đó: mình phải làm gì, và điều gì quyết
 * định được đi tiếp. Cột "ban tổ chức làm gì" đã bỏ (10/09/2026) — thí sinh mở trang này để biết
 * PHẦN VIỆC CỦA MÌNH; quy trình nội bộ của ban tổ chức không phải thứ họ cần đọc để làm bài.
 *
 * `carriage` quyết định toa nào của đoàn tàu: đầu tàu mở màn, bốn toa giữa, đuôi tàu khép lại.
 */
export type JourneyStep = {
  code: string;
  title: string;
  lead: string;
  icon: ReactNode;
  carriage: "head" | "middle" | "last";
  you: string[];
  gate: string;
  /** Điều gì xảy ra nếu chưa đạt — không phải mốc nào cũng có. */
  fallback?: string;
};

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    code: "CP1",
    title: "Đăng ký dự thi",
    lead: "Bước khởi động: có tài khoản trên hệ thống và nắm được luật chơi trước khi chọn đề tài.",
    icon: <StepRegister size={20} />,
    carriage: "head",
    you: [
      "Dự buổi kick-off, hoặc xem lại bản ghi nếu bận.",
      "Đăng nhập bằng tài khoản Microsoft của công ty @matbao.com — hệ thống tự xếp bạn vào bảng thi theo phòng ban.",
      "Nghĩ trước một bài toán có thật bạn gặp hằng tuần, đó sẽ là đề tài.",
    ],
    gate: "Có tài khoản và nộp được form đăng ký trong tuần.",
  },
  {
    code: "CP2",
    title: "Đề tài được duyệt",
    lead: "Ban tổ chức xét đề tài của bạn có làm được trong thời gian bạn xin hay không. Duyệt xong, đồng hồ làm bài mới bắt đầu chạy.",
    icon: <StepApproved size={20} />,
    carriage: "middle",
    you: [
      "Viết tài liệu PRD mô tả sản phẩm: bài toán, người dùng, phạm vi, luồng chính, dữ liệu, tiêu chí hoàn thành.",
      "Điền form đăng ký và đính tài liệu PRD ở dạng .md.",
      "Chọn thời gian làm bài, tối đa 15 ngày.",
    ],
    gate: "Đề tài được duyệt — từ giây phút đó thời gian làm bài của bạn bắt đầu đếm.",
    fallback:
      "Bị trả về thì vẫn nộp lại được, nhưng điểm đã chấm được ghi nhận ngay tại thời điểm bạn nộp bài. Ban giám khảo chỉ ra chỗ chưa đạt để bạn sửa và bước vào vòng kế tiếp.",
  },
  {
    code: "CP3",
    title: "Nộp Vibe Host + mã nguồn",
    lead: "Sản phẩm phải chạy được trên một đường dẫn công khai và mã nguồn phải xác minh được là của bạn.",
    icon: <StepDeploy size={20} />,
    carriage: "middle",
    you: [
      "Vibe code sản phẩm cùng công cụ AI, làm dứt điểm từng chức năng một.",
      "Triển khai lên Vibe Host bằng tài khoản được cấp miễn phí, khai một suất cơ sở dữ liệu.",
      "Đặt GitHub ở chế độ private và thêm ban tổ chức vào quyền xem.",
      "Dán hai đường dẫn — sản phẩm upload lên Vibe Host và mã nguồn trên GitHub — vào tài khoản thi.",
    ],
    gate: "Xác minh mã nguồn thành công và sản phẩm đạt đủ sáu tiêu chí ngưỡng sàn.",
    fallback:
      "Bị trả về thì vẫn nộp lại được, nhưng điểm đã chấm được ghi nhận ngay tại thời điểm bạn nộp bài. Ban giám khảo chỉ ra chỗ chưa đạt để bạn sửa và bước vào vòng kế tiếp.",
  },
  {
    code: "CP4",
    title: "Qua cổng an toàn",
    lead: "Cổng gác bảy điều cấm. Đây là bước bảo vệ chính bạn và công ty, không phải thủ tục hình thức.",
    icon: <StepSecurity size={20} />,
    carriage: "middle",
    you: [
      "Tự rà trước khi nộp: toàn bộ dữ liệu phải là dữ liệu giả do bạn tự tạo.",
      "Không để khoá API, mật khẩu hay chuỗi kết nối nằm trong mã nguồn.",
      "Không dùng logo, tên miền, hình ảnh thương hiệu Mắt Bão, không để lộ nơi bạn làm việc.",
    ],
    gate: "Không vướng điều cấm nào trong bảy điều.",
    fallback:
      "Vibe Host tự gọi AI sửa mã khi triển khai lỗi và gửi mã ra nhà cung cấp bên ngoài — nên dữ liệu thật lọt vào mã là ra khỏi công ty mà bạn không hay biết.",
  },
  {
    code: "CP5",
    title: "Đăng bài & BGK duyệt",
    lead: "Chia sẻ lại quá trình làm cho cộng đồng. Bắt buộc có bài, nhưng không bắt buộc lộ danh tính.",
    icon: <MarkBroadcast size={20} />,
    carriage: "middle",
    you: [
      'Đăng bài lên nhóm "Vibe Coding chưa?" theo lịch được cấp.',
      "Được đăng ẩn danh: dùng chế độ ẩn danh của nhóm hoặc một tài khoản phụ.",
      "Bài phải kể được quá trình làm — chỗ vấp và cách xử lý — không phải một dòng khoe kèm link.",
      "Dán đường dẫn bài đăng vào hệ thống.",
    ],
    gate: "Bài đăng được ban giám khảo duyệt.",
  },
  {
    code: "CP6",
    title: "Phiếu trải nghiệm",
    lead: "Mốc cuối, thường bị bỏ quên nhất. Thiếu phiếu là chưa được công nhận đậu dù điểm cao.",
    icon: <StepSurvey size={20} />,
    carriage: "last",
    you: [
      "Nộp phiếu trải nghiệm sản phẩm — bắt buộc với mọi thí sinh.",
      "Nên nộp ngay khi vừa làm xong, lúc bạn còn nhớ rõ chỗ nào của Vibe Host làm mình mất thời gian.",
    ],
    gate: "Đủ cả sáu mốc — bạn được công nhận đậu và vào bảng xếp hạng.",
  },
];
