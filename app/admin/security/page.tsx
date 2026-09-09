import { listSubmissionsWithUser } from "@/lib/db/queries/submissions";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { StatCard } from "@/components/dsvh/ui/data/StatCard";
import { ShieldCheckIcon, ShieldWarningIcon, HourglassIcon } from "@/components/dsvh/icons";
import { SecurityTable, type SecurityRowData } from "./security-table";
import { BanList } from "./ban-list";

export default async function SecurityPage() {
  const all = await listSubmissionsWithUser();
  const relevant = all.filter((s) => s.registrationStatus === "approved" && s.currentPhase >= 2);

  const rows: SecurityRowData[] = relevant.map((s) => ({
    id: s.id,
    productName: s.productName,
    userName: s.user.name ?? "",
    department: s.user.department ?? "",
    securityStatus: s.securityStatus,
    securityNote: s.securityNote,
    vibehostUrl: s.vibehostUrl,
    githubRepoUrl: s.githubRepoUrl,
  }));

  const pending = rows.filter((r) => r.securityStatus === "pending").length;
  const flagged = rows.filter((r) => r.securityStatus === "flagged").length;
  const clean = rows.filter((r) => r.securityStatus === "clean").length;

  return (
    <PageShell
      title="Cổng rà soát an toàn (CP4)"
      subtitle="Máy quét trước, người chỉ xử những bài bị gắn cờ"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={HourglassIcon}
          label="Chưa rà soát"
          value={pending}
          desc="đang chặn công bố"
          tone={pending > 0 ? "danger" : "default"}
        />
        <StatCard
          icon={ShieldWarningIcon}
          label="Bị gắn cờ"
          value={flagged}
          desc="cần thí sinh sửa"
          tone={flagged > 0 ? "danger" : "default"}
        />
        <StatCard
          icon={ShieldCheckIcon}
          label="Đã qua cổng"
          value={clean}
          desc="đủ điều kiện công bố"
          tone="success"
        />
      </div>

      <Card>
        <CardHeader
          title={`${rows.length} bài trong diện rà soát`}
          subtitle="Bài đã duyệt đề tài và đang ở Phase 2 trở lên"
        />
        <SecurityTable rows={rows} />
      </Card>

      {/* Danh sách 7 điều cấm là TÀI LIỆU TRA CỨU, không phải việc cần làm — trước đây nó chiếm
          nguyên màn hình đầu tiên và đẩy danh sách bài xuống dưới nếp gấp. Thu lại, mở khi cần. */}
      <BanList />
    </PageShell>
  );
}
