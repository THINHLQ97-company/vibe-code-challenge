import { listSubmissionsWithUser } from "@/lib/db/queries/submissions";
import { missingCheckpoints } from "@/lib/checkpoints";
import { formatDateVN } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { StatCard } from "@/components/dsvh/ui/data/StatCard";
import { Note } from "@/components/dsvh/ui/data/Note";
import { MegaphoneIcon, HourglassIcon, TrophyIcon, ChartBarIcon } from "@/components/dsvh/icons";
import { PostsTable, type PostRowData } from "./posts-table";

export default async function PostsPage() {
  const all = await listSubmissionsWithUser();
  const relevant = all.filter((s) => !!s.facebookPostUrl);

  const rows: PostRowData[] = relevant.map((s) => ({
    id: s.id,
    productName: s.productName,
    userName: s.user.name ?? "",
    department: s.user.department ?? "",
    facebookPostUrl: s.facebookPostUrl!,
    approvedAt: s.facebookApprovedAt ? formatDateVN(s.facebookApprovedAt) : null,
    engagementCount: s.engagementCount,
    engagementTier: s.engagementTier,
    published: !!s.publishedAt,
    finalScore: s.finalScore,
    // Cùng danh sách mốc mà API công bố dùng — trước đây màn này chỉ soi CP4/CP5/CP6
    // nên nút "Công bố" vẫn sáng cho bài thiếu CP2/CP3 rồi API mới trả lỗi.
    missing: missingCheckpoints(s),
  }));

  const waitingApproval = rows.filter((r) => !r.approvedAt).length;
  const waitingCount = rows.filter((r) => r.approvedAt && r.engagementTier == null).length;
  const published = rows.filter((r) => r.published).length;

  return (
    <PageShell
      title="Bài đăng & lan tỏa (CP5)"
      subtitle="Duyệt bài trên nhóm rồi mới bắt đầu đếm tương tác 7 ngày"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={MegaphoneIcon}
          label="Đã dán link"
          value={rows.length}
          desc="tổng bài trong vòng lan tỏa"
        />
        <StatCard
          icon={HourglassIcon}
          label="Chờ duyệt bài"
          value={waitingApproval}
          desc="chưa bắt đầu đếm 7 ngày"
          tone={waitingApproval > 0 ? "danger" : "default"}
        />
        <StatCard
          icon={ChartBarIcon}
          label="Chờ chốt bậc"
          value={waitingCount}
          desc="đã duyệt, chưa nhập tương tác"
          tone={waitingCount > 0 ? "danger" : "default"}
        />
        <StatCard
          icon={TrophyIcon}
          label="Đã công bố"
          value={published}
          desc="có điểm cuối"
          tone="success"
        />
      </div>

      <Card>
        <CardHeader
          title="Danh sách bài đăng"
          subtitle="Điểm lan tỏa chấm theo bậc, so trung vị các bài cùng tuần — nhập số tương tác sau đúng 7 ngày"
        />
        <PostsTable rows={rows} />
        <Note className="mt-3">
          Chống gian lận: không tính tương tác từ nhân viên Mắt Bão và tài khoản vận hành; một bình
          luận có nội dung thật = 5 lượt cảm xúc; mua like / seeding là loại khỏi cuộc thi.
        </Note>
      </Card>
    </PageShell>
  );
}
