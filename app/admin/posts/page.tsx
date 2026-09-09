import { listSubmissionsWithUser } from "@/lib/db/queries/submissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostRow } from "./post-row";

export default async function PostsPage() {
  const all = await listSubmissionsWithUser();
  const relevant = all.filter((s) => !!s.facebookPostUrl);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Duyệt bài đăng & lan tỏa (CP5)</CardTitle>
        <p className="text-caption text-ink-2">
          Kiểm tra bài ẩn danh trên Group rồi tick duyệt. Sau 7 ngày nhập số tương tác để hệ
          thống tự tính bậc điểm lan tỏa theo trung vị cùng tuần.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {relevant.length === 0 && <p className="text-body text-ink-2">Chưa có bài đăng nào.</p>}
        {relevant.map((s) => (
          <PostRow key={s.id} submission={s} />
        ))}
      </CardContent>
    </Card>
  );
}
