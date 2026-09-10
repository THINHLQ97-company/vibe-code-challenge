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

export const metadata = { title: "Đề tài của tôi" };

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
        {/* Hai cột, nhãn trên giá trị dưới. Mặc định `row` của InfoRow là `justify-between` —
            trên thẻ rộng gần hết màn thì nhãn dính mép trái, giá trị dính mép phải, ở giữa là
            khoảng trống hàng ngàn pixel và mắt phải quét ngang cả màn để ghép một cặp. */}
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <InfoRow layout="stack" label="Nhánh đề tài" value={`Nhánh ${submission.branch}`} size="sm" />
          <InfoRow layout="stack" label="Bài toán giải quyết" value={submission.problemDesc} wrap size="sm" />
          <InfoRow layout="stack" label="Người dùng sản phẩm" value={submission.targetUsers} wrap size="sm" />
          <InfoRow
            layout="stack"
            label="Chức năng chính"
            value={
              features.length ? (
                <ul className="space-y-0.5">
                  {(features as string[]).map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
              ) : (
                "—"
              )
            }
            size="sm"
          />
          <InfoRow layout="stack" label="Phương án database" value={submission.databasePlan} wrap size="sm" />
          <InfoRow
            layout="stack"
            label="Workflow tự động"
            value={submission.hasWorkflow ? (submission.workflowDesc ?? "Có") : "Không có"}
            wrap
            size="sm"
          />
          <InfoRow layout="stack" label="Công cụ AI dự định dùng" value={submission.aiTool ?? "—"} size="sm" />
          <InfoRow
            layout="stack"
            label="Đăng ký Google AI Pro"
            value={submission.googleAiPro ? "Có — được hoàn phí khi đậu" : "Không"}
            size="sm"
          />
          <InfoRow
            layout="stack"
            label="Hạn nộp"
            value={
              submission.submissionDeadline
                ? formatDateVN(submission.submissionDeadline)
                : `${submission.requestedDeadlineDays} ngày kể từ khi duyệt`
            }
            size="sm"
            numeric
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
        <Alert tone="error" title="BTC phát hiện bài dùng repo/mẫu có sẵn">
          {submission.prebuiltNote ?? "BTC chưa ghi rõ căn cứ — liên hệ ban tổ chức."} Theo thể lệ,
          bài phải được tự dựng mới trong kỳ thi nên bài này chưa qua được Phase 2. Bạn có quyền
          phản biện kèm bằng chứng (lịch sử commit).
        </Alert>
      )}
    </PageShell>
  );
}
