import { listPendingApprovals } from "@/lib/db/queries/submissions";
import { listWaves, countByWave } from "@/lib/db/queries/waves";
import { getActiveSeason } from "@/lib/db/queries/seasons";
import { formatDateVN } from "@/lib/datetime";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { Note } from "@/components/dsvh/ui/data/Note";
import { Badge } from "@/components/dsvh/ui/Badge";
import { CheckCircleIcon } from "@/components/dsvh/icons";
import { TopicsList } from "./topics-list";

export const metadata = { title: "Duyệt đề tài" };

export default async function TopicsPage() {
  const [pending, season] = await Promise.all([listPendingApprovals(), getActiveSeason()]);

  /**
   * Số suất tính theo ĐỢT THI, không theo tuần lịch.
   *
   * Nhãn cũ ghi "Còn 35/35 suất tuần này" là tàn dư của cơ chế trần-theo-tuần đã được thay bằng
   * wave — và nó nói SAI: cổng duyệt giờ chặn theo trần của đợt, nên con số hiện ra không liên
   * quan gì tới thứ thật sự chặn BTC.
   */
  const waves = season ? await listWaves(season.id) : [];
  const counts = season ? await countByWave(season.id) : new Map<number, number>();
  const openWave = waves.find(
    (w) =>
      w.status === "open" &&
      w.registrationOpensAt <= new Date() &&
      w.registrationClosesAt >= new Date()
  );
  const waveUsed = openWave ? (counts.get(openWave.id) ?? 0) : 0;
  const waveLeft = openWave ? Math.max(0, openWave.capacity - waveUsed) : 0;

  return (
    <PageShell
      title="Duyệt đề tài"
      subtitle="Duyệt cuốn chiếu — duyệt xong là mốc bắt đầu tính hạn nộp của thí sinh"
      action={
        openWave ? (
          <Badge tone={waveLeft > 0 ? "accent" : "danger"}>
            {openWave.name} · còn {waveLeft}/{openWave.capacity} suất
          </Badge>
        ) : waves.length > 0 ? (
          <Badge tone="neutral">Không có đợt nào đang mở đăng ký</Badge>
        ) : undefined
      }
    >
      <Card>
        <CardHeader
          title={`${pending.length} đề tài chờ duyệt`}
          subtitle="Tiêu chí: bài toán thật · phạm vi làm được trong hạn · 3 chức năng đủ cụ thể · có phương án database · không chạm 7 điều cấm"
        />
        {pending.length === 0 ? (
          <Empty
            icon={<CheckCircleIcon size={40} />}
            title="Không còn đề tài nào chờ duyệt"
            description="Mọi đăng ký gần nhất đã được xử lý. Đợt đăng ký tuần sau sẽ hiện ở đây."
          />
        ) : (
          <TopicsList
            capLeft={waveLeft}
            topics={pending.map((s) => ({
              id: s.id,
              productName: s.productName,
              topicGroup: s.topicGroup,
              branch: s.branch,
              problemDesc: s.problemDesc,
              targetUsers: s.targetUsers,
              prdContent: s.prdContent,
              prdFileName: s.prdFileName,
              createdAt: formatDateVN(s.createdAt),
              userName: s.user.name ?? "",
              department: s.user.department ?? "",
            }))}
          />
        )}
        <Note className="mt-3">
          Đề tài trùng nhau vẫn được duyệt — thể lệ không cấm. Trả về chỉ khi thiếu bài toán thật,
          thiếu phương án database, chức năng quá chung, hoặc chạm điều cấm.
        </Note>
      </Card>
    </PageShell>
  );
}
