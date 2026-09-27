import { SignJWT, jwtVerify } from 'jose';

export const ADMIN_COOKIE = 'blog_admin_session';
const SESSION_SECONDS = 60 * 60 * 12;

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

export async function createAdminSession() {
  const key = secretKey();
  if (!key) throw new Error('SESSION_SECRET must be at least 32 characters.');
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(key);
}

export async function verifyAdminSession(token: string | undefined) {
  const key = secretKey();
  if (!key || !token) return false;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    return payload.role === 'admin';
  } catch {
    return false;
  }
}
