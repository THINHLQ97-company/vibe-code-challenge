import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSubmissionWithUser } from "@/lib/db/queries/submissions";
import { getScoreOverviews, listJudgeScores } from "@/lib/db/queries/scores";
import { formatDateVN } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Note } from "@/components/dsvh/ui/data/Note";
import { InfoRow } from "@/components/dsvh/ui/data/InfoRow";
import { PrdPanel } from "@/components/prd-viewer";
import {
  ArrowRightIcon,
  GlobeIcon,
  GitBranchIcon,
  CheckCircleIcon,
  WarningIcon,
} from "@/components/dsvh/icons";
import { PhaseScoring } from "./phase-scoring";
import { FeedbackPanel } from "./feedback-panel";

export default async function ScoringDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const session = await getSession();
  const submission = await getSubmissionWithUser(id);
  if (!submission) notFound();

  const [overviews, judgeScores] = await Promise.all([
    getScoreOverviews([id], session?.userId ?? 0),
    listJudgeScores(id),
  ]);
  const o = overviews.get(id)!;
  const technicalCap = submission.isPrebuiltRepo ? 20 : 40;

  return (
    <PageShell
      title={submission.productName}
      subtitle={`${submission.user.name ?? ""} · ${submission.user.department ?? ""} · Nhánh ${submission.branch} · ${submission.topicGroup}`}
      action={
        <Link
          href="/admin/scoring"
          className="text-caption font-medium text-link hover:text-link-hover"
        >
          ← Về danh sách chấm điểm
        </Link>
      }
    >
      <Card>
        <CardHeader
          title="Bài dự thi"
          subtitle="Đọc tài liệu và mở sản phẩm trước khi chấm"
          action={<Badge tone="neutral">Phase {submission.currentPhase}</Badge>}
        />
        <div className="flex flex-wrap items-center gap-4 text-caption">
          {submission.vibehostUrl ? (
            <a
              href={submission.vibehostUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-link hover:text-link-hover"
            >
              <GlobeIcon size={15} /> Mở sản phẩm
            </a>
          ) : (
            <span className="text-ink-3">Chưa nộp link Vibe Host</span>
          )}
          {submission.githubRepoUrl ? (
            <a
              href={submission.githubRepoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-link hover:text-link-hover"
            >
              <GitBranchIcon size={15} /> Mã nguồn
            </a>
          ) : (
            <span className="text-ink-3">Chưa nộp mã nguồn</span>
          )}
          {submission.githubRepoUrl &&
            (submission.githubVerifiedAt ? (
              <span className="flex items-center gap-1.5 text-teal-strong">
                <CheckCircleIcon size={15} /> Đã xác minh quyền repo
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-strong">
                <WarningIcon size={15} />
                Chưa xác minh
                {submission.githubVerifyError ? `: ${submission.githubVerifyError}` : ""}
              </span>
            ))}
        </div>

        <dl className="mt-4 grid gap-x-6 gap-y-3 border-t border-stroke pt-4 sm:grid-cols-2">
          <InfoRow layout="stack" label="Bài toán" value={submission.problemDesc} wrap size="sm" />
          <InfoRow layout="stack" label="Người dùng" value={submission.targetUsers} wrap size="sm" />
          <InfoRow
            layout="stack"
            label="Chức năng đăng ký"
            value={
              <ul className="space-y-0.5">
                {(submission.features as string[]).map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
            }
            size="sm"
          />
          <InfoRow layout="stack" label="Database" value={submission.databasePlan} wrap size="sm" />
          <InfoRow
            layout="stack"
            label="Hạn nộp"
            value={
              submission.submissionDeadline
                ? formatDateVN(submission.submissionDeadline)
                : "Chưa duyệt đề tài"
            }
            size="sm"
            numeric
          />
          <InfoRow
            layout="stack"
            label="Công cụ AI"
            value={submission.aiTool || "—"}
            size="sm"
          />
        </dl>

        {submission.isPrebuiltRepo && (
          <Note tone="warning" className="mt-4">
            Bài deploy từ repo/mẫu có sẵn — điểm Chất lượng kỹ thuật bị tính trần {technicalCap} khi
            chốt tổng, dù bạn chấm cao hơn.
          </Note>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Tài liệu PRD"
          subtitle="Căn cứ chấm điểm ý tưởng ở Phase 1"
          action={
            submission.prdContent ? undefined : <Badge tone="warning">Thiếu tài liệu</Badge>
          }
        />
        <PrdPanel content={submission.prdContent} fileName={submission.prdFileName} />
      </Card>

      <PhaseScoring
        submissionId={id}
        phase={1}
        title="Phase 1 · Điểm ý tưởng"
        subtitle="Máy chấm dựa trên PRD; bạn xác nhận hoặc điều chỉnh"
        modules={[{ key: "giaTriUngDung", label: "Giá trị ứng dụng", max: 25 }]}
        aggregate={{ giaTriUngDung: o.giaTriUngDung }}
        myScore={o.myIdea}
        judges={judgeScores.ideas.map((r) => ({
          name: r.judge?.name ?? r.judge?.email ?? "—",
          scores: r.moduleScores,
          summary: r.summary,
        }))}
      />

      <PhaseScoring
        submissionId={id}
        phase={2}
        title="Phase 2 · Điểm sản phẩm"
        subtitle="Máy chấm dựa trên sản phẩm và mã nguồn; bạn xác nhận hoặc điều chỉnh"
        modules={[
          { key: "chatLuongKyThuat", label: "Chất lượng kỹ thuật", max: technicalCap },
          { key: "hoanThien", label: "Độ hoàn thiện", max: 15 },
        ]}
        aggregate={{
          chatLuongKyThuat: o.chatLuongKyThuat,
          hoanThien: o.hoanThien,
        }}
        myScore={o.myProduct}
        judges={judgeScores.products.map((r) => ({
          name: r.judge?.name ?? r.judge?.email ?? "—",
          scores: r.moduleScores,
          summary: r.summary,
        }))}
      />

      <Card>
        <CardHeader
          title="Phản hồi Phase 2 cho thí sinh"
          subtitle="Duyệt đạt là mốc thí sinh được tính 90% Ứng dụng AI theo KPI 3P và mở bước lan tỏa"
          action={
            <Link
              href={`/admin/posts`}
              className="flex items-center gap-1 text-caption font-medium text-link hover:text-link-hover"
            >
              Sang bài đăng & lan tỏa
              <ArrowRightIcon size={14} />
            </Link>
          }
        />
        <FeedbackPanel
          submissionId={id}
          status={submission.feedbackStatus}
          feedback={submission.btcFeedback}
          hasProductScore={o.hasProductScore}
        />
      </Card>
    </PageShell>
  );
}
