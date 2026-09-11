import { listPendingApprovals, countApprovedThisWeek } from "@/lib/db/queries/submissions";
import { getActiveSeason } from "@/lib/db/queries/seasons";
import { formatDateVN } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { Note } from "@/components/dsvh/ui/data/Note";
import { Badge } from "@/components/dsvh/ui/Badge";
import { CheckCircleIcon } from "@/components/dsvh/icons";
import { TopicRow } from "./topic-row";

export const metadata = { title: "Duyệt đề tài" };

export default async function TopicsPage() {
  const [pending, season] = await Promise.all([listPendingApprovals(), getActiveSeason()]);
  const approvedThisWeek = season ? await countApprovedThisWeek(season.id) : 0;
  const capLeft = season ? Math.max(0, season.capPerWeek - approvedThisWeek) : 0;

  return (
    <PageShell
      title="Duyệt đề tài"
      subtitle="Duyệt cuốn chiếu — duyệt xong là mốc bắt đầu tính hạn nộp của thí sinh"
      action={
        season ? (
          <Badge tone={capLeft > 0 ? "accent" : "danger"}>
            Còn {capLeft}/{season.capPerWeek} suất tuần này
          </Badge>
        ) : undefined
      }
    >
      <Card>
        <CardHeader
          title={`${pending.length} đề tài chờ duyệt`}
          subtitle="Tiêu chí: bài toán thật · phạm vi làm được trong hạn · 3 chức năng đủ cụ thể · có phương án database · không chạm 7 điều cấm"
        />
        {pending.length === 0 ? (
          <Empty
            icon={<CheckCircleIcon size={40} />}
            title="Không còn đề tài nào chờ duyệt"
            description="Mọi đăng ký gần nhất đã được xử lý. Đợt đăng ký tuần sau sẽ hiện ở đây."
          />
        ) : (
          <div className="space-y-3">
            {pending.map((s) => (
              <TopicRow
                key={s.id}
                submission={{
                  id: s.id,
                  productName: s.productName,
                  topicGroup: s.topicGroup,
                  branch: s.branch,
                  problemDesc: s.problemDesc,
                  targetUsers: s.targetUsers,
                  prdContent: s.prdContent,
                  prdFileName: s.prdFileName,
                  createdAt: formatDateVN(s.createdAt),
                  userName: s.user.name ?? "",
                  department: s.user.department ?? "",
                }}
                capLeft={capLeft}
              />
            ))}
          </div>
        )}
        <Note className="mt-3">
          Đề tài trùng nhau vẫn được duyệt — thể lệ không cấm. Trả về chỉ khi thiếu bài toán thật,
          thiếu phương án database, chức năng quá chung, hoặc chạm điều cấm.
        </Note>
      </Card>
    </PageShell>
  );
}
