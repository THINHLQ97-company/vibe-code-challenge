import { listSubmissionsWithUser } from "@/lib/db/queries/submissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { SecurityRow } from "./security-row";

export default async function SecurityPage() {
  const all = await listSubmissionsWithUser();
  const relevant = all.filter((s) => s.registrationStatus === "approved" && s.currentPhase >= 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cổng rà soát an toàn (CP4)</CardTitle>
        <p className="text-caption text-ink-2">
          7 điều cấm: dữ liệu khách thật · khóa API/mật khẩu trong mã · thu thập PII trái phép ·
          logo/thương hiệu Mắt Bão · tuyên bố là sản phẩm chính thức · lộ đang làm ở Mắt Bão ·
          tài liệu nội bộ chưa công bố.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {relevant.length === 0 && (
          <EmptyState icon="🛡️" title="Chưa có bài nào cần rà soát" desc="Bài ở Phase 2 trở lên và đã duyệt đề tài sẽ xuất hiện ở đây." />
        )}
        {relevant.map((s) => (
          <SecurityRow key={s.id} submission={s} />
        ))}
      </CardContent>
    </Card>
  );
}
