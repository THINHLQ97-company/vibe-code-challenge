// Trang đăng nhập là Client Component nên không tự khai `metadata` được — layout mỏng này làm hộ.
export const metadata = { title: "Đăng nhập" };

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
