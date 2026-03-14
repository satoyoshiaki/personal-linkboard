import bcrypt from "bcryptjs";
import crypto from "crypto";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured.");
  }
  return secret;
}

export async function verifyPassword(password) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    throw new Error("ADMIN_PASSWORD_HASH is not configured.");
  }

  return bcrypt.compare(password, hash);
}

export function createSessionToken() {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${expiresAt}`;
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

export function isAuthenticated(token) {
  if (!token || typeof token !== "string") {
    return false;
  }

  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", getSessionSecret())
    .update(expiresAt)
    .digest("hex");

  if (signature.length !== expected.length) {
    return false;
  }

  const validSignature = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  return validSignature && Number(expiresAt) > Date.now();
}
