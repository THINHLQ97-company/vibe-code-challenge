import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifySession } from "@/lib/auth/session";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if ((isAdminRoute || isDashboardRoute) && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  /**
   * KHÔNG kiểm vai trò ở đây.
   *
   * Middleware chạy ở edge runtime, không nối được database, nên thứ duy nhất nó biết là vai trò
   * đã ký trong cookie — một bản chụp có thể cũ tới 7 ngày. Chặn theo con số đó gây đúng lỗi đã
   * gặp (15/09/2026): người vừa được nâng lên giám khảo bị đá khỏi /admin vì cookie còn ghi là
   * thí sinh, và mã trang không bao giờ chạy tới để sửa lại.
   *
   * Việc phân quyền chuyển hẳn xuống `app/admin/layout.tsx` và từng route API — những chỗ hỏi
   * được database. Ở đây chỉ giữ câu hỏi rẻ nhất và không bao giờ cũ: đã đăng nhập hay chưa.
   */

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
