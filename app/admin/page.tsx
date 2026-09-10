import Link from "next/link";
import { listSubmissionsWithUser, countApprovedThisWeek } from "@/lib/db/queries/submissions";
import { getActiveSeason } from "@/lib/db/queries/seasons";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { StatCard } from "@/components/dsvh/ui/data/StatCard";
import { Button } from "@/components/dsvh/ui/Button";
import { Note } from "@/components/dsvh/ui/data/Note";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { submissionStage } from "@/lib/stage-status";
import { getCheckpoints } from "@/lib/checkpoints";
import {
  TopicDonut,
  StageDonut,
  DepartmentBars,
  type StageSlice,
} from "./_components/dashboard-charts";
import { CandidatesTable, type CandidateRow } from "./_components/candidates-table";
import {
  NotepadIcon,
  HourglassIcon,
  RocketIcon,
  TrophyIcon,
  ShieldWarningIcon,
  ArrowRightIcon,
} from "@/components/dsvh/icons";

const BOARD_LABEL: Record<string, string> = {
  ky_thuat: "Kỹ thuật",
  van_phong: "Văn phòng",
};

export const metadata = { title: { absolute: "Tổng quan · Ban tổ chức" } };

export default async function AdminDashboardPage() {
  const [submissions, season] = await Promise.all([listSubmissionsWithUser(), getActiveSeason()]);
  const approvedThisWeek = season ? await countApprovedThisWeek(season.id) : 0;

  const pending = submissions.filter((s) => s.registrationStatus === "pending");
  const inProgress = submissions.filter((s) => s.currentPhase >= 2 && !s.publishedAt);
  const published = submissions.filter((s) => s.publishedAt);
  const flagged = submissions.filter((s) => s.securityStatus === "flagged");
  const awaitingPost = submissions.filter((s) => s.facebookPostUrl && !s.facebookApprovedAt);

  // Cả ba biểu đồ đếm từ ĐĂNG KÝ THẬT trong DB, không có số liệu dựng sẵn.
  const countBy = <T,>(items: T[], key: (i: T) => string) =>
    Object.entries(
      items.reduce<Record<string, number>>((acc, i) => {
        const k = key(i);
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      }, {})
    )
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

  const topicSlices = countBy(submissions, (s) => s.topicGroup);
  const departmentSlices = countBy(submissions, (s) => s.user.department ?? "—");

  const stageSlices = Object.values(
    submissions.reduce<Record<string, StageSlice>>(
      (acc, s) => {
        const st = submissionStage(s);
        acc[st.label] = acc[st.label] ?? { label: st.label, value: 0, tone: st.state };
        acc[st.label].value += 1;
        return acc;
      },
      {}
    )
  ).sort((a, b) => b.value - a.value);

  const capLeft = season ? Math.max(0, season.capPerWeek - approvedThisWeek) : 0;

  // Danh sách thí sinh nằm NGAY TRÊN dashboard chứ không phải một menu riêng: nó là cùng một tập
  // dữ liệu với các ô thống kê phía trên, tách ra thành trang riêng chỉ bắt BTC bấm thêm một lần
  // để xem chi tiết của con số họ vừa đọc.
  const candidateRows: CandidateRow[] = submissions.map((s) => {
    const stage = submissionStage(s);
    const cps = getCheckpoints(s);
    const blocked = cps.find((c) => c.state === "rejected");
    return {
      id: s.id,
      userName: s.user.name ?? "",
      avatarUrl: s.user.avatarUrl,
      department: s.user.department ?? "",
      board: s.user.board ? BOARD_LABEL[s.user.board] : "—",
      productName: s.productName,
      stageLabel: stage.label,
      stageTone: stage.tone,
      cpDone: cps.filter((c) => c.state === "done").length,
      cpTotal: cps.length,
      cpBlocked: blocked ? blocked.label : null,
      finalScore: s.finalScore,
      // Đậu = công bố điểm + đã đăng ký Google AI Pro (điều kiện hoàn phí theo thể lệ mục C).
      reimburse: !!s.publishedAt && s.googleAiPro,
    };
  });
  const reimbursable = candidateRows.filter((r) => r.reimburse).length;

  return (
    <PageShell
      title="Dashboard BTC"
      subtitle={season ? `${season.name} · trần ${season.capPerWeek} đề tài duyệt/tuần` : "Chưa mở mùa thi"}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={NotepadIcon} label="Tổng đăng ký" value={submissions.length} desc="toàn mùa thi" />
        <StatCard
          icon={HourglassIcon}
          label="Chờ duyệt đề tài"
          value={pending.length}
          desc={season ? `còn ${capLeft} suất tuần này` : "—"}
          tone={pending.length > 0 ? "danger" : "default"}
        />
        <StatCard icon={RocketIcon} label="Đang làm bài" value={inProgress.length} desc="đã duyệt, chưa công bố" />
        <StatCard icon={TrophyIcon} label="Đã công bố" value={published.length} desc="có điểm cuối" tone="success" />
      </div>

      {(pending.length > 0 || flagged.length > 0 || awaitingPost.length > 0) && (
        <Card>
          <CardHeader title="Cần xử lý" subtitle="Việc đang chặn thí sinh đi tiếp — xử trước" />
          <div className="space-y-2">
            {pending.length > 0 && (
              <ActionRow
                tone="warning"
                text={`${pending.length} đề tài chờ duyệt`}
                href="/admin/topics"
                cta="Duyệt đề tài"
              />
            )}
            {flagged.length > 0 && (
              <ActionRow
                tone="danger"
                text={`${flagged.length} bài bị gắn cờ ở cổng an toàn`}
                href="/admin/security"
                cta="Xem cảnh báo"
              />
            )}
            {awaitingPost.length > 0 && (
              <ActionRow
                tone="warning"
                text={`${awaitingPost.length} bài đăng chờ BGK duyệt`}
                href="/admin/posts"
                cta="Duyệt bài đăng"
              />
            )}
          </div>
        </Card>
      )}

      {season && capLeft === 0 && (
        <Alert tone="warning" title="Đã dùng hết trần duyệt của tuần này">
          Tuần này đã duyệt đủ {season.capPerWeek} đề tài. Duyệt thêm sẽ bị hệ thống chặn — để sang
          tuần sau hoặc điều chỉnh trần của mùa thi.
        </Alert>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        <TopicDonut data={topicSlices} />
        <StageDonut data={stageSlices} />
      </div>

      <DepartmentBars data={departmentSlices} />

      <Card>
        <CardHeader
          title="Thí sinh"
          subtitle={`${candidateRows.length} người đã đăng ký · ${published.length} bài đã công bố`}
        />
        <CandidatesTable rows={candidateRows} />
        <Note className="mt-3">
          Cột hoàn phí chỉ bật khi bài ĐÃ công bố và thí sinh có khai đăng ký Google AI Pro lúc đăng
          ký đề tài — đây là dữ liệu HR đọc để chi hoàn 130.000đ qua lương, hiện có {reimbursable}{" "}
          người đủ điều kiện.
        </Note>
      </Card>
    </PageShell>
  );
}

function ActionRow({
  tone,
  text,
  href,
  cta,
}: {
  tone: "warning" | "danger";
  text: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stroke bg-surface-2 px-3 py-2">
      <span className="flex items-center gap-2 text-caption text-ink">
        <ShieldWarningIcon size={16} className={tone === "danger" ? "text-red" : "text-amber"} />
        {text}
      </span>
      <Link href={href}>
        <Button variant="ghost" size="sm" rightIcon={<ArrowRightIcon size={14} />}>
          {cta}
        </Button>
      </Link>
    </div>
  );
}
