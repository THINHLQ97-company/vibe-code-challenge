import { listSubmissionsWithUser } from "@/lib/db/queries/submissions";
import { getActiveSeason } from "@/lib/db/queries/seasons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";

export default async function AdminDashboardPage() {
  const [submissions, season] = await Promise.all([listSubmissionsWithUser(), getActiveSeason()]);

  const total = submissions.length;
  const pending = submissions.filter((s) => s.registrationStatus === "pending").length;
  const submitted = submissions.filter((s) => s.currentPhase >= 2).length;
  const published = submissions.filter((s) => s.publishedAt).length;
  const flagged = submissions.filter((s) => s.securityStatus === "flagged").length;

  const byTopicGroup = submissions.reduce<Record<string, number>>((acc, s) => {
    acc[s.topicGroup] = (acc[s.topicGroup] ?? 0) + 1;
    return acc;
  }, {});
  const maxTopicCount = Math.max(1, ...Object.values(byTopicGroup));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatTile label="Tổng đăng ký" value={total} />
        <StatTile label="Chờ duyệt" value={pending} positive={pending === 0} />
        <StatTile label="Đang làm/nộp bài" value={submitted} />
        <StatTile label="Đã công bố" value={published} />
        <StatTile label="Cảnh báo bảo mật" value={flagged} positive={flagged === 0} />
      </div>

      {season && (
        <Card>
          <CardContent className="py-4 text-caption text-ink-2">
            Mùa hiện tại: <b className="text-ink">{season.name}</b> · trần{" "}
            <b className="text-ink">{season.capPerWeek}</b> đề tài duyệt/tuần
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Phân bổ theo nhóm chủ đề</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {Object.entries(byTopicGroup).map(([group, count]) => (
            <div key={group} className="flex items-center gap-3">
              <span className="w-48 shrink-0 text-caption text-ink-2">{group}</span>
              <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-stroke-soft">
                <div
                  className="h-full rounded-full bg-teal"
                  style={{ width: `${(count / maxTopicCount) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-caption font-bold text-ink">{count}</span>
            </div>
          ))}
          {Object.keys(byTopicGroup).length === 0 && (
            <p className="text-body text-ink-2">Chưa có đăng ký nào.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
