import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Đăng nhập bằng tài khoản Microsoft của công ty (Entra ID).
 *
 * Luồng: authorization code + PKCE, TRAO ĐỔI MÃ Ở PHÍA MÁY CHỦ.
 *
 * Vì sao không đăng ký app dạng SPA: SPA để token nằm trong JavaScript của trình duyệt, tức bất kỳ
 * đoạn mã nào chạy trên trang cũng đọc được. App này đã lưu phiên trong cookie `httpOnly` ký ở máy
 * chủ — chọn SPA là phải vứt cơ chế đó đi. Nền tảng đăng ký đúng trong Entra là **Web**, có client
 * secret, và chỉ máy chủ mới chạm vào token.
 *
 * PKCE vẫn dùng dù đã có client secret: nó chặn kiểu tấn công tráo mã ngay ở bước chuyển hướng,
 * không tốn gì mà thêm được một lớp.
 */

export type MicrosoftConfig = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
};

/**
 * Giá trị GIỮ CHỖ tính là CHƯA cấu hình.
 *
 * Nền tảng lưu trữ quét `.env.example` và tự bơm giá trị mẫu vào môi trường chạy thật (đo được
 * trên Vibe Host: "1 biến đang giữ GIÁ TRỊ MẪU từ .env.example"). Nếu chỉ kiểm "có giá trị hay
 * không" thì app tưởng đã cấu hình xong, hiện nút "Đăng nhập bằng Microsoft", người dùng bấm vào
 * và ăn lỗi từ phía Microsoft — tệ hơn hẳn so với không hiện nút.
 */
const PLACEHOLDERS = new Set(["change-me", "changeme", "todo", "xxx", "your-value-here"]);

function realValue(raw: string | undefined): string | null {
  const v = raw?.trim();
  if (!v) return null;
  if (PLACEHOLDERS.has(v.toLowerCase())) return null;
  // Dạng `<mô tả>` cũng là giữ chỗ do người ta chép từ tài liệu.
  if (v.startsWith("<") && v.endsWith(">")) return null;
  return v;
}

export function getMicrosoftConfig(): MicrosoftConfig | null {
  const tenantId = realValue(process.env.AZURE_AD_TENANT_ID);
  const clientId = realValue(process.env.AZURE_AD_CLIENT_ID);
  const clientSecret = realValue(process.env.AZURE_AD_CLIENT_SECRET);
  if (!tenantId || !clientId || !clientSecret) return null;
  return { tenantId, clientId, clientSecret };
}

export function isMicrosoftConfigured(): boolean {
  return getMicrosoftConfig() !== null;
}

const authority = (tenantId: string) => `https://login.microsoftonline.com/${tenantId}`;

/**
 * Địa chỉ gốc công khai của ứng dụng, dùng để dựng redirect URI.
 *
 * Ưu tiên `APP_BASE_URL` khai tay, vì redirect URI phải TRÙNG TỪNG KÝ TỰ với chuỗi đã đăng ký bên
 * Entra. Đằng sau proxy thì `req.url` hay thấy là địa chỉ nội bộ (http, cổng 3000, tên container) —
 * lấy nó đi so sẽ trượt. Không khai thì suy từ header chuyển tiếp, đủ dùng cho máy dev.
 */
export function getBaseUrl(req: Request): string {
  const fromEnv = process.env.APP_BASE_URL?.replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  const h = req.headers;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export function getRedirectUri(req: Request): string {
  return `${getBaseUrl(req)}/api/auth/microsoft/callback`;
}

/** Sinh cặp PKCE. `verifier` giữ trong cookie tạm, `challenge` gửi cho Microsoft. */
export async function createPkcePair(): Promise<{ verifier: string; challenge: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const verifier = base64url(bytes);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return { verifier, challenge: base64url(new Uint8Array(digest)) };
}

export function randomToken(): string {
  return base64url(crypto.getRandomValues(new Uint8Array(24)));
}

function base64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function buildAuthorizeUrl(opts: {
  config: MicrosoftConfig;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): string {
  const u = new URL(`${authority(opts.config.tenantId)}/oauth2/v2.0/authorize`);
  u.searchParams.set("client_id", opts.config.clientId);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("redirect_uri", opts.redirectUri);
  u.searchParams.set("response_mode", "query");
  // `offline_access` KHÔNG xin: phiên đăng nhập do app tự cấp và sống 7 ngày, không có việc gì cần
  // gọi lại Graph thay mặt người dùng sau đó. Xin refresh token rồi cất đi là ôm thêm một thứ bí
  // mật dài hạn mà không dùng tới.
  u.searchParams.set("scope", "openid profile email User.Read");
  u.searchParams.set("state", opts.state);
  u.searchParams.set("code_challenge", opts.codeChallenge);
  u.searchParams.set("code_challenge_method", "S256");
  return u.toString();
}

export async function exchangeCode(opts: {
  config: MicrosoftConfig;
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<{ idToken: string; accessToken: string }> {
  const res = await fetch(`${authority(opts.config.tenantId)}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: opts.config.clientId,
      client_secret: opts.config.clientSecret,
      grant_type: "authorization_code",
      code: opts.code,
      redirect_uri: opts.redirectUri,
      code_verifier: opts.codeVerifier,
      scope: "openid profile email User.Read",
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Microsoft từ chối đổi mã: ${res.status} ${detail.slice(0, 300)}`);
  }
  const data = (await res.json()) as { id_token?: string; access_token?: string };
  if (!data.id_token || !data.access_token) {
    throw new Error("Microsoft trả về thiếu id_token hoặc access_token");
  }
  return { idToken: data.id_token, accessToken: data.access_token };
}

/**
 * Kiểm chữ ký `id_token` bằng khoá công khai của Microsoft.
 *
 * Có người lập luận rằng token lấy trực tiếp từ endpoint của Microsoft qua TLS nên khỏi cần kiểm.
 * Vẫn kiểm, vì nó đồng thời ràng đúng `aud` (token này cấp cho ĐÚNG app của mình, không phải app
 * khác cùng tenant) và đúng `iss` (đúng tenant Mắt Bão) — hai điều kiện TLS không nói gì về chúng.
 */
const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export async function verifyIdToken(config: MicrosoftConfig, idToken: string) {
  const issuerBase = `https://login.microsoftonline.com/${config.tenantId}/v2.0`;
  let jwks = jwksCache.get(config.tenantId);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${authority(config.tenantId)}/discovery/v2.0/keys`));
    jwksCache.set(config.tenantId, jwks);
  }
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: issuerBase,
    audience: config.clientId,
  });
  return payload as {
    oid?: string;
    sub?: string;
    email?: string;
    preferred_username?: string;
    name?: string;
    tid?: string;
  };
}

export type GraphProfile = {
  id: string;
  displayName: string | null;
  mail: string | null;
  userPrincipalName: string | null;
  department: string | null;
  employeeId: string | null;
};

export async function fetchGraphProfile(accessToken: string): Promise<GraphProfile | null> {
  const res = await fetch(
    "https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName,department,employeeId",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  // Không ném lỗi: thiếu hồ sơ Graph thì vẫn đăng nhập được, chỉ là chưa xếp được phòng ban và
  // người dùng sẽ tự chọn. Chặn đăng nhập vì một trường phụ là đánh đổi sai.
  if (!res.ok) return null;
  return (await res.json()) as GraphProfile;
}

/**
 * Ảnh đại diện từ Microsoft Graph, trả về dạng data URI để ghi thẳng vào cột `users.avatar_url`.
 *
 * Xin bản 240×240 chứ không phải `/me/photo/$value`: endpoint không kèm kích thước trả về ảnh GỐC,
 * mà ảnh hồ sơ nhân sự thường là vài trăm KB tới vài MB — trong khi chỗ hiển thị lớn nhất trong app
 * chỉ 40px. 240 là đủ nét cho màn hình retina và vẫn nhỏ.
 *
 * Rất nhiều người không đặt ảnh, Graph trả 404 cho họ. Đó là chuyện bình thường, không phải lỗi —
 * trả `null` và app dùng chữ cái đầu của tên như trước.
 */
const AVATAR_MAX_BYTES = 1024 * 1024;

export async function fetchGraphAvatar(accessToken: string): Promise<string | null> {
  for (const path of ["/me/photos/240x240/$value", "/me/photo/$value"]) {
    try {
      const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) continue;

      const buf = await res.arrayBuffer();
      // Chặn ảnh quá lớn: cột này nằm ngay trong bảng users, một ảnh vài MB nhân với vài trăm
      // người là phình cả bảng và làm chậm mọi truy vấn đọc hồ sơ.
      if (buf.byteLength === 0 || buf.byteLength > AVATAR_MAX_BYTES) continue;

      const type = res.headers.get("content-type") ?? "image/jpeg";
      if (!/^image\/(jpeg|png|gif)$/.test(type)) continue;

      return `data:${type};base64,${Buffer.from(buf).toString("base64")}`;
    } catch {
      // Lỗi mạng khi lấy ảnh KHÔNG được làm hỏng việc đăng nhập — ảnh là thứ phụ.
      continue;
    }
  }
  return null;
}
