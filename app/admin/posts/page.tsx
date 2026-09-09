import { listSubmissionsWithUser } from "@/lib/db/queries/submissions";
import { formatDateVN } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { Note } from "@/components/dsvh/ui/data/Note";
import { MegaphoneIcon } from "@/components/dsvh/icons";
import { PostRow } from "./post-row";

export default async function PostsPage() {
  const all = await listSubmissionsWithUser();
  const relevant = all.filter((s) => !!s.facebookPostUrl);

  return (
    <PageShell
      title="Bài đăng & lan tỏa (CP5)"
      subtitle="Duyệt bài trên nhóm rồi mới bắt đầu đếm tương tác 7 ngày"
    >
      <Card>
        <CardHeader
          title={`${relevant.length} bài đã dán link`}
          subtitle="Điểm lan tỏa chấm theo bậc, so trung vị các bài cùng tuần — nhập số tương tác sau đúng 7 ngày"
        />
        {relevant.length === 0 ? (
          <Empty
            icon={<MegaphoneIcon size={40} />}
            title="Chưa có bài đăng nào"
            description="Thí sinh qua được Phase 2 mới dán được link bài — danh sách sẽ hiện ở đây."
          />
        ) : (
          <div className="space-y-3">
            {relevant.map((s) => (
              <PostRow
                key={s.id}
                submission={{
                  id: s.id,
                  productName: s.productName,
                  userName: s.user.name ?? "",
                  facebookPostUrl: s.facebookPostUrl!,
                  approvedAt: s.facebookApprovedAt ? formatDateVN(s.facebookApprovedAt) : null,
                  engagementCount: s.engagementCount,
                  engagementTier: s.engagementTier,
                  securityClean: s.securityStatus === "clean",
                  surveyDone: !!s.surveySubmittedAt,
                  published: !!s.publishedAt,
                  finalScore: s.finalScore,
                }}
              />
            ))}
          </div>
        )}
        <Note className="mt-3">
          Chống gian lận: không tính tương tác từ nhân viên Mắt Bão và tài khoản vận hành; một bình
          luận có nội dung thật = 5 lượt cảm xúc; mua like / seeding là loại khỏi cuộc thi.
        </Note>
      </Card>
    </PageShell>
  );
}
