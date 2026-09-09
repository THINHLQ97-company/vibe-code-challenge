import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareForm } from "./share-form";

export default async function SharePage() {
  const session = await getSession();
  const submission = session ? await getCurrentSubmissionForUser(session.userId) : null;

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
  if (submission.currentPhase < 3) {
    return (
      <Card>
        <CardContent className="py-6 text-body text-ink-2">
          Bạn cần được BTC duyệt Phase 2 (sản phẩm & mã nguồn) trước khi sang bước chia sẻ.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chia sẻ & lan tỏa</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-caption text-ink-2">
          Đăng bài <b>ẩn danh</b> lên nhóm &quot;Vibe Coding chưa?&quot; (không lộ nick chính /
          không lộ đang làm ở Mắt Bão, không đặt link bấm được trong thân bài). Dán link bài đăng
          bên dưới — BGK sẽ kiểm tra rồi tick duyệt, sau đó đếm tương tác 7 ngày ra điểm lan tỏa
          cuối.
        </p>
        <ShareForm
          submissionId={submission.id}
          initialUrl={submission.facebookPostUrl ?? ""}
          approved={!!submission.facebookApprovedAt}
          engagementCount={submission.engagementCount}
          engagementTier={submission.engagementTier}
        />
      </CardContent>
    </Card>
  );
}
