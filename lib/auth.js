import { prisma } from './prisma.js';
import { createToken, verifyToken } from './jwt.js';

export { createToken, verifyToken } from './jwt.js';

const SESSION_COOKIE = 'isp_session';

const userSelect = {
  id: true,
  email: true,
  full_name: true,
  role: true,
  tenant_id: true,
  avatar_url: true,
  tenant: { select: { id: true, name: true, slug: true, plan: true, customer_limit: true, is_active: true, subscription_status: true, subscription_ends_at: true } },
};

/** For Next.js server components: pass the result of await cookies() from next/headers */
export async function getSessionFromCookies(cookieStore) {
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? null;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload?.sub) return null;
  const user = await prisma.profile.findUnique({
    where: { id: payload.sub },
    select: userSelect,
  });
  return user;
}

export async function getSession(request) {
  let token =
    request.headers.get('authorization')?.startsWith('Bearer ')
      ? request.headers.get('authorization').slice(7)
      : null;
  if (!token && request.cookies) {
    token = request.cookies.get(SESSION_COOKIE)?.value ?? null;
  }
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload?.sub) return null;
  const user = await prisma.profile.findUnique({
    where: { id: payload.sub },
    select: userSelect,
  });
  return user;
}

export function isTenantSubscriptionActive(tenant) {
  if (!tenant || tenant.subscription_status !== 'ACTIVE') return false;
  if (!tenant.subscription_ends_at) return true;
  return new Date(tenant.subscription_ends_at) > new Date();
}

export function requireAuth(handler) {
  return async (req, context) => {
    const user = await getSession(req);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    req.user = user;
    return handler(req, context);
  };
}

export function requireAdmin(handler) {
  return async (req, context) => {
    const user = await getSession(req);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (user.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    req.user = user;
    return handler(req, context);
  };
}
