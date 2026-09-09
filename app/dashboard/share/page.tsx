import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCurrentSubmissionForUser } from "@/lib/db/queries/submissions";
import { formatDateVN } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Button } from "@/components/dsvh/ui/Button";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { Note } from "@/components/dsvh/ui/data/Note";
import { NotepadIcon, HourglassIcon } from "@/components/dsvh/icons";
import { ShareForm } from "./share-form";

export default async function SharePage() {
  const session = await getSession();
  const submission = session ? await getCurrentSubmissionForUser(session.userId) : null;

  if (!submission) {
    return (
      <PageShell title="Chia sẻ & lan tỏa">
        <Card>
          <Empty
            icon={<NotepadIcon size={40} />}
            title="Bạn chưa có đề tài"
            description="Đăng ký đề tài trước khi tới bước chia sẻ."
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

  if (submission.currentPhase < 3) {
    return (
      <PageShell title="Chia sẻ & lan tỏa">
        <Card>
          <Empty
            icon={<HourglassIcon size={40} />}
            title="Chưa tới bước chia sẻ"
            description="BTC cần duyệt Phase 2 (sản phẩm & mã nguồn) trước. Đăng bài sớm hơn sẽ không được tính điểm lan tỏa."
            action={
              <Link href="/dashboard/build">
                <Button variant="ghost">Xem trạng thái nộp bài</Button>
              </Link>
            }
          />
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Chia sẻ & lan tỏa"
      subtitle="Phase 3: điểm lan tỏa tính theo tương tác 7 ngày, so trung vị các bài cùng tuần"
    >
      <Card>
        <CardHeader
          title="Link bài đăng trên nhóm cộng đồng"
          subtitle='Đăng ẩn danh lên nhóm "Vibe Coding chưa?" rồi dán link vào đây'
        />
        <ShareForm
          submissionId={submission.id}
          initialUrl={submission.facebookPostUrl ?? ""}
          approved={!!submission.facebookApprovedAt}
          approvedAt={
            submission.facebookApprovedAt ? formatDateVN(submission.facebookApprovedAt) : null
          }
          engagementCount={submission.engagementCount}
          engagementTier={submission.engagementTier}
        />
        <Note tone="warning" className="mt-4">
          Ràng buộc nội dung bài đăng: không nhắc Mắt Bão, không để lộ bạn đang làm ở Mắt Bão, không
          đặt link bấm được trong thân bài (đưa link xuống bình luận), và bài phải kể được quá trình
          làm — chỗ vấp, cách xử lý.
        </Note>
      </Card>
    </PageShell>
  );
}
