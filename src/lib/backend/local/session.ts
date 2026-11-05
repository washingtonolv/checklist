import { SignJWT, jwtVerify } from "jose";

export const LOCAL_SESSION_COOKIE = "dd_session";

export interface LocalSessionPayload {
  sub: string;
  email: string;
  name: string;
  role: "admin" | "supervisor" | "manager";
}

function secretKey(): Uint8Array {
  const secret =
    process.env.LOCAL_AUTH_SECRET ||
    "dd-local-development-secret-change-me-please-2026";
  return new TextEncoder().encode(secret);
}

export async function createLocalSessionToken(payload: LocalSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifyLocalSessionToken(token: string): Promise<LocalSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub || !payload.role) return null;
    return {
      sub: String(payload.sub),
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role: payload.role as LocalSessionPayload["role"]
    };
  } catch {
    return null;
  }
}

