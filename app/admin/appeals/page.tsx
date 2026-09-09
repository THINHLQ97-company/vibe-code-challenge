import { listAppealsWithSubmission } from "@/lib/db/queries/appeals";
import { formatDateTimeVN } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { StatCard } from "@/components/dsvh/ui/data/StatCard";
import { Note } from "@/components/dsvh/ui/data/Note";
import { ScalesIcon, HourglassIcon, CheckCircleIcon } from "@/components/dsvh/icons";
import { AppealsTable, type AppealRowData } from "./appeals-table";

export default async function AppealsAdminPage() {
  const appeals = await listAppealsWithSubmission();

  const rows: AppealRowData[] = appeals.map((a) => ({
    id: a.id,
    criteria: a.criteria,
    evidenceUrl: a.evidenceUrl,
    status: a.status,
    resolutionNote: a.resolutionNote,
    createdAt: formatDateTimeVN(a.createdAt),
    productName: a.submission.productName,
    userName: a.submission.user.name ?? "",
    department: a.submission.user.department ?? "",
  }));

  const pending = rows.filter((r) => r.status === "pending").length;
  const accepted = rows.filter((r) => r.status === "accepted").length;

  return (
    <PageShell
      title="Xử lý phản biện"
      subtitle="Một vòng duy nhất, bắt buộc có bằng chứng, SLA phản hồi ≤48h"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={HourglassIcon}
          label="Chờ xử lý"
          value={pending}
          desc="còn trong SLA 48h"
          tone={pending > 0 ? "danger" : "success"}
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Đã chấp nhận"
          value={accepted}
          desc="phải chấm lại và công bố lại"
        />
        <StatCard
          icon={ScalesIcon}
          label="Tổng phản biện"
          value={rows.length}
          desc="toàn mùa thi"
        />
      </div>

      <Card>
        <CardHeader
          title="Danh sách phản biện"
          subtitle="Bấm Xử lý để đọc bằng chứng và ghi kết luận"
        />
        <AppealsTable rows={rows} />
        <Note className="mt-3">
          Phạm vi: phản biện điểm máy chấm và kết quả rà bảo mật. Điểm chủ quan (giá trị ứng dụng,
          lan tỏa) chỉ nhận khi có bằng chứng MỚI, không nhận tranh luận suông.
        </Note>
      </Card>
    </PageShell>
  );
}
