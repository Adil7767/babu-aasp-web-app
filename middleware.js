import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt.js';

const SESSION_COOKIE = 'isp_session';

const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password'];
const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/super-admin', '/profile', '/suspended', '/pending-subscription', '/renew-subscription'];

function isPublic(pathname) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isProtected(pathname) {
  if (pathname === '/') return true;
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function getRedirectForAuthenticatedUser(payload) {
  const role = payload.role;
  const subStatus = payload.subscription_status ?? null;
  const endsAt = payload.subscription_ends_at;

  if (subStatus === 'SUSPENDED') return '/suspended';
  if ((role === 'ADMIN' || role === 'STAFF') && subStatus === 'PENDING_PAYMENT') return '/pending-subscription';
  if (role === 'ADMIN' || role === 'STAFF') {
    if (endsAt) {
      const end = new Date(endsAt);
      if (end < new Date()) return '/renew-subscription';
    }
  }
  if (role === 'SUPER_ADMIN') return '/super-admin';
  if (role === 'ADMIN' || role === 'STAFF') return '/admin';
  return '/dashboard';
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value ?? null;

  if (!token) {
    if (pathname === '/' || isProtected(pathname)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  const payload = await verifyToken(token);
  if (!payload?.sub) {
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' });
    return res;
  }

  if (pathname === '/') {
    const target = getRedirectForAuthenticatedUser(payload);
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (isPublic(pathname)) {
    const target = getRedirectForAuthenticatedUser(payload);
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/dashboard',
    '/dashboard/:path*',
    '/admin',
    '/admin/:path*',
    '/super-admin',
    '/super-admin/:path*',
    '/profile',
    '/profile/:path*',
    '/suspended',
    '/pending-subscription',
    '/renew-subscription',
  ],
};
