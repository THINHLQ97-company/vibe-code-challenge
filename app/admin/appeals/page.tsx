import { listAppealsWithSubmission } from "@/lib/db/queries/appeals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { AppealRow } from "./appeal-row";

export default async function AppealsAdminPage() {
  const appeals = await listAppealsWithSubmission();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xử lý phản biện</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {appeals.length === 0 && (
          <EmptyState icon="⚖️" title="Chưa có phản biện nào" desc="Thí sinh gửi phản biện trong 48h sau khi có điểm — danh sách sẽ hiện ở đây." />
        )}
        {appeals.map((a) => (
          <AppealRow key={a.id} appeal={a} />
        ))}
      </CardContent>
    </Card>
  );
}
