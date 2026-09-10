import Link from "next/link";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Button } from "@/components/dsvh/ui/Button";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { NotepadIcon } from "@/components/dsvh/icons";
import { SurveyForm } from "./survey-form";

export const metadata = { title: "Phiếu trải nghiệm" };

export default async function SurveyPage() {
  const session = await getSession();
  const [submission, user] = await Promise.all([
    session ? getCurrentSubmissionForUser(session.userId) : null,
    session ? db.query.users.findFirst({ where: eq(users.id, session.userId) }) : null,
  ]);

  if (!submission) {
    return (
      <PageShell title="Phiếu trải nghiệm">
        <Card>
          <Empty
            icon={<NotepadIcon size={40} />}
            title="Bạn chưa có đề tài"
            description="Phiếu trải nghiệm gắn với bài dự thi — đăng ký đề tài trước."
            action={
              <Link href="/dashboard/register">
                <Button variant="solid">Đăng ký đề tài</Button>
              </Link>
            }
          />
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Phiếu trải nghiệm sản phẩm"
      subtitle="CP6 — bắt buộc với mọi thí sinh, là đầu vào để đội sản phẩm cải thiện Vibe Host"
    >
      <Card>
        <CardHeader
          title={user?.board === "ky_thuat" ? "6 câu chung + 4 câu bảng Kỹ thuật" : "6 câu chung + 4 câu bảng Văn phòng"}
          subtitle="Trả lời thật — đây là nguồn dữ liệu để sửa đúng chỗ khách hay vấp"
        />
        <SurveyForm
          submissionId={submission.id}
          board={user?.board ?? "van_phong"}
          alreadySubmitted={!!submission.surveySubmittedAt}
        />
      </Card>
    </PageShell>
  );
}
