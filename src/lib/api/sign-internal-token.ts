import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.INTERNAL_API_SECRET);

// Ca 2 loai token deu ky bang CUNG 1 secret, nen phai co claim phan biet ro -
// neu khong, token loai nay co the lot qua guard cua loai kia. Truoc day chi
// dua vao viec token sync "tinh co" khong co `sub` (nen truot JwtAuthGuard) -
// do la may, khong phai thiet ke. Gio tach han bang `aud`, va `iss` de backend
// tu choi token khong phai do web app nay phat hanh.
//
// 2 hang so nay phai KHOP voi phia NestJS (src/auth/token-audience.ts).
export const TOKEN_ISSUER = "enggo-web";
export const AUDIENCE_API = "career-tree-api";
export const AUDIENCE_SYNC = "career-tree-api/sync";
// Phai khop voi career-tree-api/src/auth/token-audience.ts.
export const AUDIENCE_SOCKET = "career-tree-api/socket";

// Token goi API thay mat 1 user cu the. `sub` PHAI luon lay tu auth(), tuyet
// doi khong tu input client - xem client.ts.
export function signInternalToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(TOKEN_ISSUER)
    .setAudience(AUDIENCE_API)
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(secret);
}

// Token cho trinh duyet ket noi TRUC TIEP toi NotificationGateway (socket.io)
// tren backend - khac han signInternalToken (chi dung server-side, khong bao
// gio ra khoi may chu Next.js). Het han sau 60s nhung khong sao: FE luon ky
// token MOI moi lan (re)connect qua callback `auth` cua socket.io-client,
// khong tai su dung token cu.
export function signSocketToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(TOKEN_ISSUER)
    .setAudience(AUDIENCE_SOCKET)
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(secret);
}

// Token rieng cho buoc dong bo user luc dang nhap - luc do CHUA biet userId
// (dang di lay chinh no) nen khong co `sub`.
export function signSyncToken(): Promise<string> {
  return new SignJWT({ purpose: "sync" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(TOKEN_ISSUER)
    .setAudience(AUDIENCE_SYNC)
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(secret);
}
