import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { formatDateVN } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { InfoRow } from "@/components/dsvh/ui/data/InfoRow";
import { PrdViewer } from "@/components/prd-viewer";
import { RegisterForm } from "./register-form";

const REG_STATUS: Record<string, { tone: "neutral" | "success" | "warning" | "danger"; label: string }> = {
  pending: { tone: "warning", label: "Chờ BTC duyệt" },
  approved: { tone: "success", label: "Đã duyệt" },
  returned: { tone: "danger", label: "Bị trả về" },
};

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
  const features = Array.isArray(submission.features) ? submission.features : [];

  return (
    <PageShell
      title="Đề tài của tôi"
      subtitle="Đề tài đã nộp — không sửa được sau khi BTC duyệt (theo thể lệ, nhánh đề tài chốt cứng)"
      action={<Badge tone={status.tone}>{status.label}</Badge>}
    >
      <Card>
        <CardHeader title={submission.productName} subtitle={submission.topicGroup} />
        <dl className="divide-y divide-stroke">
          <InfoRow label="Nhánh đề tài" value={`Nhánh ${submission.branch}`} />
          <InfoRow label="Bài toán giải quyết" value={submission.problemDesc} wrap />
          <InfoRow label="Người dùng sản phẩm" value={submission.targetUsers} wrap />
          <InfoRow
            label="Chức năng chính"
            value={features.length ? features.join(" · ") : "—"}
            wrap
          />
          <InfoRow label="Phương án database" value={submission.databasePlan} wrap />
          <InfoRow
            label="Workflow tự động"
            value={submission.hasWorkflow ? (submission.workflowDesc ?? "Có") : "Không có"}
            wrap
          />
          <InfoRow label="Cách đưa lên Vibe Host" value={submission.deployMethod} />
          <InfoRow label="Công cụ AI dự định dùng" value={submission.aiTool ?? "—"} />
          <InfoRow
            label="Đăng ký Google AI Pro"
            value={submission.googleAiPro ? "Có — được hoàn phí khi đậu" : "Không"}
          />
          <InfoRow
            label="Hạn nộp"
            value={
              submission.submissionDeadline
                ? formatDateVN(submission.submissionDeadline)
                : `${submission.requestedDeadlineDays} ngày kể từ khi duyệt`
            }
          />
        </dl>
      </Card>

      <Card>
        <CardHeader
          title="Tài liệu PRD đã nộp"
          subtitle="Đây là căn cứ BTC và hệ chấm dùng để chấm điểm ý tưởng ở Phase 1"
        />
        <PrdViewer content={submission.prdContent} fileName={submission.prdFileName} />
      </Card>

      {submission.isPrebuiltRepo && (
        <Alert tone="warning" title="Deploy từ repo có sẵn — thang điểm kỹ thuật riêng">
          Bài dùng lại repo/mẫu có sẵn được chấm trần 20/40 điểm ở mục Chất lượng kỹ thuật; các mục
          còn lại giữ nguyên.
        </Alert>
      )}
    </PageShell>
  );
}
