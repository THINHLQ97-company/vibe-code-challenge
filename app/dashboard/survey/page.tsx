import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SurveyForm } from "./survey-form";

export default async function SurveyPage() {
  const session = await getSession();
  const submission = session ? await getCurrentSubmissionForUser(session.userId) : null;
  const user = session ? await db.query.users.findFirst({ where: eq(users.id, session.userId) }) : null;

  if (!submission) {
    return (
      <Card>
        <CardContent className="py-6 text-body text-ink-2">
          Bạn chưa có đề tài.{" "}
          <Link href="/dashboard/register" className="text-link">
            Đăng ký ngay
          </Link>
          .
        </CardContent>
      </Card>
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
