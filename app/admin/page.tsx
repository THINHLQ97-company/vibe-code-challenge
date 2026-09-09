import { FolderOpen } from "lucide-react";
import { listSubmissionsWithUser } from "@/lib/db/queries/submissions";
import { getActiveSeason } from "@/lib/db/queries/seasons";
import { EmptyState } from "@/components/empty-state";

const BAR_COLORS = ["var(--ds-c1)", "var(--ds-c2)", "var(--ds-c3)", "var(--ds-c4)", "var(--ds-c5)", "var(--ds-c6)"];

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
  const topicEntries = Object.entries(byTopicGroup);
  const maxTopicCount = Math.max(1, ...topicEntries.map(([, c]) => c));

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <div className="dash-h1">Dashboard BTC</div>
          <div className="dash-sub">
            {season ? (
              <>
                Mùa hiện tại: <b>{season.name}</b> · trần <b>{season.capPerWeek}</b> đề tài duyệt/tuần
              </>
            ) : (
              "Chưa có mùa thi nào"
            )}
          </div>
        </div>
      </div>

      <div className="kpirow">
        <Kpi label="Tổng đăng ký" value={total} />
        <Kpi label="Chờ duyệt" value={pending} tone={pending > 0 ? "warn" : undefined} />
        <Kpi label="Đang làm/nộp bài" value={submitted} />
        <Kpi label="Đã công bố" value={published} />
        <Kpi label="Cảnh báo bảo mật" value={flagged} tone={flagged > 0 ? "alert" : undefined} />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Phân bổ theo nhóm chủ đề</div>
            <div className="panel-desc">Số đề tài đăng ký theo từng nhóm — giúp BTC cân bằng gợi ý chủ đề.</div>
          </div>
        </div>
        <div className="panel-body">
          {topicEntries.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="Chưa có đăng ký nào"
              desc="Khi thí sinh đăng ký đề tài, phân bổ theo nhóm chủ đề sẽ hiện ở đây."
            />
          ) : (
            <div className="barlist">
              {topicEntries.map(([group, count], i) => (
                <div key={group} className="barlist-row">
                  <span className="barlist-name">{group}</span>
                  <span className="barlist-val">{count}</span>
                  <div className="barlist-track">
                    <div
                      className="barlist-fill"
                      style={{
                        width: `${(count / maxTopicCount) * 100}%`,
                        background: BAR_COLORS[i % BAR_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: "warn" | "alert" }) {
  return (
    <div className={`kcard${tone ? ` ${tone}` : ""}`}>
      <span className="kcard-l">{label}</span>
      <span className={`kcard-v${tone ? ` ${tone}` : ""}`}>{value}</span>
    </div>
  );
}
