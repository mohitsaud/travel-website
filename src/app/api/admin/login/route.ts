import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ADMIN_COOKIE, createAdminSession } from '@/lib/session-token';
import { requireSameOrigin } from '@/lib/require-admin';

export const runtime = 'nodejs';

const loginSchema = z.object({ password: z.string().min(1).max(256) }).strict();
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

function recordAttempt(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return 1;
  }
  current.count += 1;
  return current.count;
}

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (
    !configuredPassword ||
    !process.env.SESSION_SECRET ||
    process.env.SESSION_SECRET.length < 32
  ) {
    return NextResponse.json(
      { error: 'Admin authentication is not configured.' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Enter your admin password.' },
      { status: 400 },
    );

  const attemptKey =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const attemptCount = recordAttempt(attemptKey);
  if (attemptCount > MAX_ATTEMPTS)
    return NextResponse.json(
      { error: 'Too many login attempts. Try again later.' },
      { status: 429 },
    );

  const provided = Buffer.from(parsed.data.password);
  const expected = Buffer.from(configuredPassword);
  const matches =
    provided.length === expected.length && timingSafeEqual(provided, expected);
  if (!matches)
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  attempts.delete(attemptKey);

  try {
    const token = await createAdminSession();
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Unable to create an admin session.' },
      { status: 503 },
    );
  }
}

export async function DELETE(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
