import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { formatDateVN } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Button } from "@/components/dsvh/ui/Button";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Note } from "@/components/dsvh/ui/data/Note";
import { InfoTile } from "@/components/dsvh/ui/data/InfoTile";
import {
  GitBranchIcon,
  RobotIcon,
  CalendarIcon,
  ArrowRightIcon,
  HourglassIcon,
} from "@/components/dsvh/icons";
import { PrdViewer } from "@/components/prd-viewer";
import { RegisterForm } from "./register-form";

const REG_STATUS: Record<string, { tone: "neutral" | "success" | "warning" | "danger"; label: string }> = {
  pending: { tone: "warning", label: "Chờ BTC duyệt" },
  approved: { tone: "success", label: "Đã duyệt" },
  returned: { tone: "danger", label: "Bị trả về" },
};

export const metadata = { title: "Đề tài của tôi" };

/**
 * Khối văn xuôi: nhãn nhỏ, nội dung chiếm trọn bề ngang.
 *
 * "Bài toán giải quyết" và "Người dùng sản phẩm" là hai đoạn dài 3–6 câu. Bản trước nhét chúng
 * vào cùng một lưới hai cột với các dữ kiện một dòng (nhánh, công cụ AI, hạn nộp) — đoạn văn bị
 * ép còn nửa màn và xuống dòng liên tục, trong khi ô bên cạnh chỉ có hai chữ nên chừa lại mảng
 * trống bằng cả màn hình. Tách hẳn hai loại nội dung là xong: dữ kiện ngắn xếp lưới ở trên, văn
 * xuôi một cột trọn bề ngang ở dưới.
 */
function Prose({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-1 text-caption font-medium text-ink-3">{label}</h3>
      <p className="text-body leading-relaxed text-ink">{children}</p>
    </section>
  );
}

export default async function RegisterPage() {
  const session = await getSession();
  const submission = session ? await getCurrentSubmissionForUser(session.userId) : null;

  // Chưa có đề tài, hoặc đề tài bị trả về ⇒ mở form (bản trả về được điền sẵn để sửa).
  if (!submission || submission.registrationStatus === "returned") {
    return (
      <PageShell
        title={submission ? "Sửa & nộp lại đề tài" : "Đăng ký đề tài dự thi"}
        subtitle="BTC duyệt cuốn chiếu theo tuần — duyệt xong mới bắt đầu tính hạn nộp của bạn"
      >
        {submission?.registrationNote && (
          <Alert tone="warning" title="Lý do BTC trả về">
            {submission.registrationNote}
          </Alert>
        )}
        <RegisterForm initial={submission ?? undefined} />
      </PageShell>
    );
  }

  const status = REG_STATUS[submission.registrationStatus];
  const approved = submission.registrationStatus === "approved";
  const deadline = submission.submissionDeadline;
  const overdue = !!deadline && deadline.getTime() < Date.now();

  return (
    <PageShell
      title="Đề tài của tôi"
      subtitle="Đề tài đã nộp — không sửa được sau khi BTC duyệt (theo thể lệ, nhánh đề tài chốt cứng)"
      action={<Badge tone={status.tone}>{status.label}</Badge>}
    >
      {/* Cờ vi phạm đặt TRÊN CÙNG: nó chặn cả vòng sau, nên là thứ đầu tiên phải đọc — để lẫn
          dưới đáy trang như bản trước thì người bị chặn dễ không thấy mình đang bị chặn. */}
      {submission.isPrebuiltRepo && (
        <Alert tone="error" title="BTC phát hiện bài dùng repo/mẫu có sẵn">
          {submission.prebuiltNote ?? "BTC chưa ghi rõ căn cứ — liên hệ ban tổ chức."} Theo thể lệ,
          bài phải được tự dựng mới trong kỳ thi nên bài này chưa qua được Phase 2. Bạn có quyền
          phản biện kèm bằng chứng (lịch sử commit).
        </Alert>
      )}

      {/* Trả lời thẳng câu "giờ tôi phải làm gì" — thứ mà bản trước bỏ trống hoàn toàn, người đọc
          xem xong bảng thông tin rồi vẫn không biết bước kế tiếp nằm ở đâu. */}
      <Card>
        <CardHeader
          title={approved ? "Bước kế tiếp — nộp sản phẩm" : "Bước kế tiếp — chờ BTC duyệt"}
          subtitle={
            approved
              ? "Đề tài đã được duyệt, hạn nộp của bạn đã bắt đầu chạy"
              : "Chưa có việc gì cần bạn làm ở bước này"
          }
          action={
            approved ? (
              <Link href="/dashboard/build">
                <Button variant="solid" size="sm" rightIcon={<ArrowRightIcon size={15} />}>
                  Sang màn nộp bài
                </Button>
              </Link>
            ) : undefined
          }
        />
        {approved ? (
          overdue ? (
            <Note tone="warning">
              Hạn nộp {formatDateVN(deadline!)} đã qua. Bạn vẫn nộp được, nhưng BTC có quyền không
              nhận bài trễ — liên hệ ban tổ chức nếu có lý do chính đáng.
            </Note>
          ) : (
            <Note>
              Dựng sản phẩm trên Vibe Host bằng tài khoản @matbao.com của bạn, rồi dán link sản
              phẩm và link mã nguồn ở màn nộp bài trước {formatDateVN(deadline!)}.
            </Note>
          )
        ) : (
          <Note>
            <HourglassIcon size={15} className="mr-1.5 inline-block align-[-2px] text-ink-3" />
            BTC duyệt cuốn chiếu theo tuần. Hạn nộp chỉ bắt đầu tính từ lúc đề tài được duyệt, nên
            chờ lâu không làm bạn mất thời gian làm bài.
          </Note>
        )}
      </Card>

      {/* Dữ kiện một dòng — xếp lưới, liếc là thấy, không lẫn vào văn xuôi. */}
      <div className="grid gap-3 sm:grid-cols-3">
        <InfoTile icon={GitBranchIcon} label="Nhánh đề tài" value={`Nhánh ${submission.branch}`} />
        <InfoTile icon={RobotIcon} label="Công cụ AI dự định dùng" value={submission.aiTool || "—"} />
        <InfoTile
          icon={CalendarIcon}
          label={approved ? "Hạn nộp" : "Hạn nộp xin"}
          value={
            deadline ? formatDateVN(deadline) : `${submission.requestedDeadlineDays} ngày sau duyệt`
          }
        />
      </div>

      <Card>
        <CardHeader title={submission.productName} subtitle={submission.topicGroup} />
        {/* Chỉ còn hai mục — các trường "Chức năng chính", "Phương án database", "Workflow tự
            động", "Đăng ký Google AI Pro" đã ngưng thu thập ở form đăng ký (10/09/2026), nên
            hiển thị lại chúng chỉ tạo ra một cột toàn dấu "—" và "Không có". */}
        <div className="space-y-4">
          <Prose label="Bài toán giải quyết">{submission.problemDesc}</Prose>
          <Prose label="Người dùng sản phẩm">{submission.targetUsers}</Prose>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Tài liệu PRD đã nộp"
          subtitle="Đây là căn cứ BTC và hệ chấm dùng để chấm điểm ý tưởng ở Phase 1"
        />
        <PrdViewer content={submission.prdContent} fileName={submission.prdFileName} />
      </Card>
    </PageShell>
  );
}
