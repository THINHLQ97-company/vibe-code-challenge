import { listPendingApprovals } from "@/lib/db/queries/submissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopicRow } from "./topic-row";

export default async function TopicsPage() {
  const pending = await listPendingApprovals();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Duyệt chủ đề đăng ký ({pending.length} chờ duyệt)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {pending.length === 0 && <p className="text-body text-ink-2">Không có đề tài nào chờ duyệt.</p>}
        {pending.map((s) => (
          <TopicRow key={s.id} submission={s} />
        ))}
      </CardContent>
    </Card>
  );
}
