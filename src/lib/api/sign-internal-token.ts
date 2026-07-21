import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.INTERNAL_API_SECRET);

export function signInternalToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(secret);
}

export function signSyncToken(): Promise<string> {
  return new SignJWT({ purpose: "sync" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(secret);
}
