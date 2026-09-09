import { listSubmissionsWithUser } from "@/lib/db/queries/submissions";
import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Empty } from "@/components/dsvh/ui/data/Empty";
import { Note } from "@/components/dsvh/ui/data/Note";
import { ShieldCheckIcon } from "@/components/dsvh/icons";
import { SecurityRow } from "./security-row";

const BAN_LIST = [
  "Dữ liệu khách hàng thật",
  "Khoá API / mật khẩu / chuỗi kết nối trong mã",
  "Thu thập thông tin cá nhân người dùng cuối",
  "Logo / tên miền / hình ảnh thương hiệu Mắt Bão",
  "Tuyên bố là sản phẩm chính thức của Mắt Bão",
  "Lộ việc đang làm tại Mắt Bão",
  "Tài liệu nội bộ / bảng giá chưa công bố",
];

export default async function SecurityPage() {
  const all = await listSubmissionsWithUser();
  const relevant = all.filter((s) => s.registrationStatus === "approved" && s.currentPhase >= 2);

  return (
    <PageShell
      title="Cổng rà soát an toàn (CP4)"
      subtitle="Máy quét trước, người chỉ xử những bài bị gắn cờ"
    >
      <Card>
        <CardHeader title="7 điều cấm" subtitle="Vi phạm bất kỳ điều nào là chưa qua cổng" />
        <ol className="list-decimal space-y-1 pl-5 text-caption text-ink-2">
          {BAN_LIST.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ol>
        <Note tone="danger" className="mt-3">
          Vibe Host v2 có cơ chế AI tự sửa mã khi deploy lỗi — mã nguồn được gửi ra nhà cung cấp AI
          nước ngoài. Vì vậy điều cấm 1 và 7 là tuyệt đối, không có ngoại lệ.
        </Note>
      </Card>

      <Card>
        <CardHeader
          title={`${relevant.length} bài trong diện rà soát`}
          subtitle="Bài đã duyệt đề tài và đang ở Phase 2 trở lên"
        />
        {relevant.length === 0 ? (
          <Empty
            icon={<ShieldCheckIcon size={40} />}
            title="Chưa có bài nào cần rà soát"
            description="Bài sẽ vào đây khi thí sinh nộp sản phẩm ở Phase 2."
          />
        ) : (
          <div className="space-y-3">
            {relevant.map((s) => (
              <SecurityRow
                key={s.id}
                submission={{
                  id: s.id,
                  productName: s.productName,
                  userName: s.user.name ?? "",
                  securityStatus: s.securityStatus,
                  securityNote: s.securityNote,
                  vibehostUrl: s.vibehostUrl,
                  githubRepoUrl: s.githubRepoUrl,
                }}
              />
            ))}
          </div>
        )}
      </Card>
    </PageShell>
  );
}
