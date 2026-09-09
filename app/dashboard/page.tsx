import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { getLatestIdeaScore } from "@/lib/db/queries/scores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";

const PHASE_STEPS = [
  { label: "Phase 1 · Ý tưởng", description: "Đăng ký & chấm điểm ý tưởng" },
  { label: "Phase 2 · Sản phẩm", description: "Vibe Host + mã nguồn" },
  { label: "Phase 3 · Lan tỏa", description: "Đăng bài & tương tác" },
  { label: "Công bố", description: "Xem kết quả cuối" },
];

export default async function DashboardOverviewPage() {
  const session = await getSession();
  const submission = session ? await getCurrentSubmissionForUser(session.userId) : null;

  if (!submission) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bạn chưa đăng ký đề tài</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-body text-ink-2">
          <p>
            Đăng ký đề tài để BTC duyệt cuốn chiếu — mỗi người một sản phẩm, có database,
            deploy lên Vibe Host.
          </p>
          <Link href="/dashboard/register">
            <Button>Đăng ký đề tài ngay</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const ideaScore = await getLatestIdeaScore(submission.id);
  const checklist = [
    { label: "CP1 · Đăng ký", done: true },
    { label: "CP2 · Duyệt đề tài", done: submission.registrationStatus === "approved" },
    { label: "CP3 · Nộp Vibe Host + mã nguồn", done: !!submission.githubVerifiedAt },
    { label: "CP4 · Qua cổng an toàn", done: submission.securityStatus === "clean" },
    { label: "CP5 · Đăng bài & BGK duyệt", done: !!submission.facebookApprovedAt },
    { label: "CP6 · Phiếu trải nghiệm", done: !!submission.surveySubmittedAt },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{submission.productName}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2 text-caption text-ink-2">
            <Badge>{submission.registrationStatus}</Badge>
            <span>
              Nhánh {submission.branch} · {submission.topicGroup}
            </span>
            {submission.submissionDeadline && (
              <span>
                · Hạn nộp:{" "}
                {new Date(submission.submissionDeadline).toLocaleDateString("vi-VN")}
              </span>
            )}
          </div>

          {submission.registrationStatus === "returned" && (
            <div className="rounded-card border border-destructive/30 bg-destructive/5 p-3 text-caption text-destructive">
              Đề tài bị trả về: {submission.registrationNote}.{" "}
              <Link href="/dashboard/register" className="underline">
                Sửa & nộp lại
              </Link>
            </div>
          )}

          <Stepper steps={PHASE_STEPS} current={submission.currentPhase - 1} />

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {checklist.map((c) => (
              <div
                key={c.label}
                className="flex items-center gap-2 rounded-lg border border-stroke bg-surface-2 px-3 py-2 text-caption"
              >
                <span className={c.done ? "text-teal-strong" : "text-ink-3"}>
                  {c.done ? "✓" : "○"}
                </span>
                <span className={c.done ? "text-ink" : "text-ink-3"}>{c.label}</span>
              </div>
            ))}
          </div>

          {ideaScore && (
            <div className="rounded-card border border-stroke bg-cream-100 p-3 text-caption text-ink-2">
              <b className="text-ink">Điểm ý tưởng (Phase 1):</b>{" "}
              {ideaScore.moduleScores.giaTriUngDung ?? "—"}/25 — {ideaScore.summary}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
