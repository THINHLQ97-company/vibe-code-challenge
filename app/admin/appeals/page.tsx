import { listAppealsWithSubmission } from "@/lib/db/queries/appeals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppealRow } from "./appeal-row";

export default async function AppealsAdminPage() {
  const appeals = await listAppealsWithSubmission();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xử lý phản biện</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {appeals.length === 0 && <p className="text-body text-ink-2">Chưa có phản biện nào.</p>}
        {appeals.map((a) => (
          <AppealRow key={a.id} appeal={a} />
        ))}
      </CardContent>
    </Card>
  );
}
