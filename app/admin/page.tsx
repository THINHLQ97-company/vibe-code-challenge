import Link from "next/link";
import { listSubmissionsWithUser } from "@/lib/db/queries/submissions";
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
import { listWaves, countInWaveByBoard } from "@/lib/db/queries/waves";

const BOARD_LABEL: Record<string, string> = {
  ky_thuat: "Kỹ thuật",
  van_phong: "Văn phòng",
};

export const metadata = { title: { absolute: "Tổng quan · Ban tổ chức" } };

export default async function AdminDashboardPage() {
  const [submissions, season] = await Promise.all([listSubmissionsWithUser(), getActiveSeason()]);


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

  /**
   * Suất còn lại tính theo ĐỢT ĐANG MỞ, không theo trần tuần cũ.
   *
   * Dòng cũ đọc `season.capPerWeek` — con số của cơ chế đã bị thay bằng đợt thi, nên nó nói một
   * đằng còn cổng duyệt chặn một nẻo.
   */
  const waves = season ? await listWaves(season.id) : [];
  const openWave = waves.find(
    (w) =>
      w.status === "open" &&
      w.registrationOpensAt <= new Date() &&
      w.registrationClosesAt >= new Date()
  );
  const openWaveCounts = openWave ? await countInWaveByBoard(openWave.id) : null;
  const capLeft = openWave
    ? Math.max(0, openWave.capacityKyThuat - (openWaveCounts?.ky_thuat ?? 0)) +
      Math.max(0, openWave.capacityVanPhong - (openWaveCounts?.van_phong ?? 0))
    : 0;

  // Danh sách thí sinh nằm NGAY TRÊN dashboard chứ không phải một menu riêng: nó là cùng một tập
  // dữ liệu với các ô thống kê phía trên, tách ra thành trang riêng chỉ bắt BTC bấm thêm một lần
  // để xem chi tiết của con số họ vừa đọc.
  // Nạp các đợt một lần rồi tra map — không gọi trong vòng lặp qua từng bài.
  const waveById = new Map(waves.map((w) => [w.id, w]));

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
      waveId: s.waveId,
      waveName: s.waveId != null ? (waveById.get(s.waveId)?.name ?? null) : null,
      cpDone: cps.filter((c) => c.state === "done").length,
      cpTotal: cps.length,
      cpBlocked: blocked ? blocked.label : null,
      finalScore: s.finalScore,
      // Đậu = công bố điểm + đã đăng ký Google AI Pro (điều kiện hoàn phí theo thể lệ mục C).
      // Form không còn hỏi "có đăng ký Google AI Pro không" (bỏ 10/09/2026), nên app chỉ đánh dấu
      // ĐÃ ĐẬU; việc đối chiếu hoá đơn đăng ký thật là của HR khi chi hoàn phí.
      reimburse: !!s.publishedAt,
    };
  });
  const reimbursable = candidateRows.filter((r) => r.reimburse).length;

  return (
    <PageShell
      title="Dashboard BTC"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={NotepadIcon} label="Tổng đăng ký" value={submissions.length} desc="toàn mùa thi" />
        <StatCard
          icon={HourglassIcon}
          label="Chờ duyệt đề tài"
          value={pending.length}
          desc={season ? `còn ${capLeft} suất trong đợt đang mở` : "—"}
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

      {openWave && capLeft === 0 && (
        <Alert tone="warning" title="Đợt đang mở đã hết suất duyệt">
          {openWave.name} đã đầy cả hai bảng. Duyệt thêm sẽ bị hệ thống chặn — để sang
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
          Cột &quot;Diện hoàn phí&quot; bật khi bài ĐÃ công bố kết quả. Form đăng ký không còn hỏi thí sinh
          có đăng ký Google AI Pro hay không, nên việc đối chiếu hoá đơn thật là của HR khi chi
          hoàn phí — hiện có {reimbursable} người đã đậu.
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
