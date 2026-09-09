import { listAppealsWithSubmission } from "@/lib/db/queries/appeals";
import { formatDateTimeVN } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { Note } from "@/components/dsvh/ui/data/Note";
import { ScalesIcon } from "@/components/dsvh/icons";
import { AppealRow } from "./appeal-row";

export default async function AppealsAdminPage() {
  const appeals = await listAppealsWithSubmission();
  const pending = appeals.filter((a) => a.status === "pending");

  return (
    <PageShell
      title="Xử lý phản biện"
      subtitle="Một vòng duy nhất, bắt buộc có bằng chứng, SLA phản hồi ≤48h"
    >
      <Card>
        <CardHeader
          title={`${pending.length} phản biện chờ xử lý`}
          subtitle={`Tổng ${appeals.length} phản biện đã gửi`}
        />
        {appeals.length === 0 ? (
          <Empty
            icon={<ScalesIcon size={40} />}
            title="Chưa có phản biện nào"
            description="Thí sinh gửi phản biện trong 48h sau khi công bố điểm — danh sách sẽ hiện ở đây."
          />
        ) : (
          <div className="space-y-3">
            {appeals.map((a) => (
              <AppealRow
                key={a.id}
                appeal={{
                  id: a.id,
                  criteria: a.criteria,
                  evidenceUrl: a.evidenceUrl,
                  status: a.status,
                  resolutionNote: a.resolutionNote,
                  createdAt: formatDateTimeVN(a.createdAt),
                  productName: a.submission.productName,
                  userName: a.submission.user.name ?? "",
                }}
              />
            ))}
          </div>
        )}
        <Note className="mt-3">
          Phạm vi: phản biện điểm máy chấm và kết quả rà bảo mật. Điểm chủ quan (giá trị ứng dụng,
          lan tỏa) chỉ nhận khi có bằng chứng MỚI, không nhận tranh luận suông.
        </Note>
      </Card>
    </PageShell>
  );
}
