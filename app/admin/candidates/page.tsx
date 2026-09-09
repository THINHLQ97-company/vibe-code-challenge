import { listSubmissionsWithUser } from "@/lib/db/queries/submissions";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Note } from "@/components/dsvh/ui/data/Note";
import { CandidatesTable, type CandidateRow } from "./candidates-table";

const BOARD_LABEL: Record<string, string> = {
  ky_thuat: "Kỹ thuật",
  van_phong: "Văn phòng",
};

/** Trạng thái gọn cho một dòng — thứ BTC cần liếc là bài đang kẹt ở đâu. */
function stageOf(s: {
  registrationStatus: string;
  currentPhase: number;
  githubVerifiedAt: Date | null;
  securityStatus: string;
  facebookApprovedAt: Date | null;
  surveySubmittedAt: Date | null;
  publishedAt: Date | null;
}): { label: string; tone: "neutral" | "accent" | "success" | "warning" | "danger" } {
  if (s.publishedAt) return { label: "Đã công bố", tone: "success" };
  if (s.registrationStatus === "pending") return { label: "Chờ duyệt đề tài", tone: "warning" };
  if (s.registrationStatus === "returned") return { label: "Trả về sửa", tone: "danger" };
  if (!s.githubVerifiedAt) return { label: "Đang làm bài", tone: "neutral" };
  if (s.securityStatus === "flagged") return { label: "Gắn cờ an toàn", tone: "danger" };
  if (s.currentPhase < 3) return { label: "Chờ chấm Phase 2", tone: "accent" };
  if (!s.facebookApprovedAt) return { label: "Chờ duyệt bài đăng", tone: "accent" };
  if (!s.surveySubmittedAt) return { label: "Thiếu phiếu trải nghiệm", tone: "warning" };
  return { label: "Chờ công bố", tone: "accent" };
}

export default async function CandidatesPage() {
  const submissions = await listSubmissionsWithUser();

  const rows: CandidateRow[] = submissions.map((s) => {
    const stage = stageOf(s);
    return {
      id: s.id,
      userName: s.user.name ?? "",
      department: s.user.department ?? "",
      board: s.user.board ? BOARD_LABEL[s.user.board] : "—",
      productName: s.productName,
      stageLabel: stage.label,
      stageTone: stage.tone,
      finalScore: s.finalScore,
      // Đậu = công bố điểm + đã đăng ký Google AI Pro (điều kiện hoàn phí theo thể lệ mục C).
      reimburse: !!s.publishedAt && s.googleAiPro,
    };
  });

  const published = rows.filter((r) => r.finalScore != null).length;
  const reimbursable = rows.filter((r) => r.reimburse).length;

  return (
    <PageShell
      title="Thí sinh"
      subtitle={`${rows.length} người đã đăng ký · ${published} bài đã công bố`}
    >
      <Card>
        <CardHeader
          title="Danh sách thí sinh"
          subtitle="Một dòng một người — cột trạng thái cho biết bài đang kẹt ở mốc nào"
        />
        <CandidatesTable rows={rows} />
        <Note className="mt-3">
          Cột hoàn phí chỉ bật khi bài ĐÃ công bố và thí sinh có khai đăng ký Google AI Pro lúc đăng
          ký đề tài — đây là dữ liệu HR đọc để chi hoàn 130.000đ qua lương, hiện có {reimbursable}{" "}
          người đủ điều kiện.
        </Note>
      </Card>
    </PageShell>
  );
}
