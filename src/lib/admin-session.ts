import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyAdminSession } from '@/lib/session-token';
export { ADMIN_COOKIE, createAdminSession } from '@/lib/session-token';

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value);
}
