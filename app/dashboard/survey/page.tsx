import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { SurveyForm } from "./survey-form";
import { ClipboardList } from "lucide-react";

export default async function SurveyPage() {
  const session = await getSession();
  const submission = session ? await getCurrentSubmissionForUser(session.userId) : null;
  const user = session ? await db.query.users.findFirst({ where: eq(users.id, session.userId) }) : null;

  if (!submission) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Bạn chưa có đề tài"
        desc="Đăng ký đề tài trước khi nộp phiếu trải nghiệm."
        action={
          <Link href="/dashboard/register">
            <button className="ds-btn ds-btn-primary">Đăng ký ngay</button>
          </Link>
        }
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phiếu trải nghiệm sản phẩm (CP6)</CardTitle>
      </CardHeader>
      <CardContent>
        <SurveyForm
          submissionId={submission.id}
          board={user?.board ?? "van_phong"}
          alreadySubmitted={!!submission.surveySubmittedAt}
        />
      </CardContent>
    </Card>
  );
}
