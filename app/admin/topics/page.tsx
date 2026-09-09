import { listPendingApprovals } from "@/lib/db/queries/submissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { TopicRow } from "./topic-row";
import { CheckSquare } from "lucide-react";

export default async function TopicsPage() {
  const pending = await listPendingApprovals();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Duyệt chủ đề đăng ký ({pending.length} chờ duyệt)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {pending.length === 0 && (
          <EmptyState icon={CheckSquare} title="Không có đề tài nào chờ duyệt" desc="Mọi đề tài đăng ký gần nhất đã được xử lý." />
        )}
        {pending.map((s) => (
          <TopicRow key={s.id} submission={s} />
        ))}
      </CardContent>
    </Card>
  );
}
