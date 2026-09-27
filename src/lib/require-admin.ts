import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifyAdminSession } from '@/lib/session-token';

export async function requireAdmin(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE}=`));
  const token = cookie?.slice(ADMIN_COOKIE.length + 1);
  if (await verifyAdminSession(token)) return null;

  return NextResponse.json(
    { error: 'Authentication required.' },
    { status: 401 },
  );
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json(
      { error: 'Cross-origin request rejected.' },
      { status: 403 },
    );
  }
  return null;
}
