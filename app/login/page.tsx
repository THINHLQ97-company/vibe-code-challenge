import { AuthSplit } from "@/components/auth-split";
import { Note } from "@/components/dsvh/ui/data/Note";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { MicrosoftLoginButton } from "@/components/microsoft-login";

/**
 * Trang đăng nhập CÔNG KHAI — chỉ có một đường: tài khoản Microsoft của công ty.
 *
 * Đường mật khẩu đã dời sang `/login/noi-bo`, không liên kết từ đâu cả. Lý do tách hẳn: thí sinh
 * thấy hai lựa chọn thì sẽ có người đi nhầm đường rồi báo "không đăng nhập được", trong khi đường
 * mật khẩu chỉ dành cho ban tổ chức và tài khoản thử nghiệm.
 */
export const dynamic = "force-dynamic";

/** Mã lỗi trên thanh địa chỉ → câu giải thích cho người dùng. */
const ERRORS: Record<string, string> = {
  ms_chua_cau_hinh:
    "Đăng nhập Microsoft chưa được kết nối. Báo ban tổ chức — đây là việc của hệ thống, không phải lỗi của bạn.",
  ms_tu_choi: "Bạn đã huỷ ở màn hình Microsoft, hoặc quản trị viên chưa cấp quyền cho ứng dụng.",
  ms_phien_khong_hop_le:
    "Phiên đăng nhập hết hạn hoặc không hợp lệ. Bấm đăng nhập lại từ đầu giúp bạn.",
  ms_thieu_thong_tin: "Microsoft không trả về email của bạn. Báo ban tổ chức để kiểm tra hồ sơ.",
  ms_ngoai_cong_ty: "Chỉ tài khoản @matbao.com mới dự thi được.",
  ms_that_bai: "Không kết nối được với Microsoft. Thử lại sau ít phút.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <AuthSplit
      title="Đăng nhập"
      subtitle="Dùng tài khoản Microsoft của công ty để vào khu vực thí sinh."
    >
      <div className="flex flex-col gap-4">
        {error && ERRORS[error] && <Alert tone="error">{ERRORS[error]}</Alert>}

        <MicrosoftLoginButton size="lg" />

        <Note>
          Hệ thống tự lập hồ sơ dự thi và xếp bạn vào bảng thi theo phòng ban trên tài khoản công ty
          của bạn.
        </Note>
      </div>
    </AuthSplit>
  );
}
