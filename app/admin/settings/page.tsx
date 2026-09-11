import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Note } from "@/components/dsvh/ui/data/Note";
import { InfoRow } from "@/components/dsvh/ui/data/InfoRow";
import { Badge } from "@/components/dsvh/ui/Badge";
import { isPasswordLoginEnabled } from "@/lib/settings";
import { isMicrosoftConfigured } from "@/lib/auth/microsoft";
import { LoginToggle } from "./login-toggle";

export const metadata = { title: "Cấu hình" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [passwordEnabled] = await Promise.all([isPasswordLoginEnabled()]);
  const microsoftReady = isMicrosoftConfigured();

  return (
    <PageShell
      title="Cấu hình hệ thống"
      subtitle="Các công tắc vận hành — đổi ở đây có hiệu lực ngay, không cần triển khai lại"
    >
      <Card>
        <CardHeader
          title="Đường đăng nhập"
          subtitle="Khi vào thi thật, tắt mật khẩu để chỉ còn tài khoản Microsoft của công ty"
        />
        <LoginToggle initial={passwordEnabled} microsoftReady={microsoftReady} />
      </Card>

      <Card>
        <CardHeader
          title="Kết nối Microsoft Entra"
          subtitle="Trạng thái đọc từ biến môi trường — chỉ đổi được khi triển khai lại"
          action={
            <Badge tone={microsoftReady ? "success" : "warning"}>
              {microsoftReady ? "Đã cấu hình" : "Chưa cấu hình"}
            </Badge>
          }
        />
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
          <InfoRow
            layout="stack"
            label="AZURE_AD_TENANT_ID"
            value={process.env.AZURE_AD_TENANT_ID ? "Đã đặt" : "Thiếu"}
            size="sm"
          />
          <InfoRow
            layout="stack"
            label="AZURE_AD_CLIENT_ID"
            value={process.env.AZURE_AD_CLIENT_ID ? "Đã đặt" : "Thiếu"}
            size="sm"
          />
          <InfoRow
            layout="stack"
            label="AZURE_AD_CLIENT_SECRET"
            value={process.env.AZURE_AD_CLIENT_SECRET ? "Đã đặt" : "Thiếu"}
            size="sm"
          />
        </dl>
        {/* Chỉ hiện ĐÃ ĐẶT / THIẾU, không hiện giá trị — kể cả mã tenant. Trang này mở cho mọi
            admin, mà nhu cầu thật ở đây chỉ là biết thiếu cái nào. */}
        <Note className="mt-3">
          Ba biến này do đội quản lý tenant Microsoft cấp. Redirect URI phải đăng ký bên Entra là{" "}
          <code>{(process.env.APP_BASE_URL ?? "https://<tên miền>") + "/api/auth/microsoft/callback"}</code>{" "}
          — sai một ký tự là Microsoft từ chối.
        </Note>
      </Card>
    </PageShell>
  );
}
