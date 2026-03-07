import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma.js';
import { createToken } from '@/lib/auth.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }
    const user = await prisma.profile.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { tenant: { select: { id: true, name: true, slug: true, plan: true, customer_limit: true, is_active: true, subscription_status: true, subscription_ends_at: true } } },
    });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = await createToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      subscription_status: user.tenant?.subscription_status ?? null,
      subscription_ends_at: user.tenant?.subscription_ends_at?.toISOString?.() ?? user.tenant?.subscription_ends_at ?? null,
    });
    const res = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        tenant_id: user.tenant_id,
        tenant: user.tenant ? { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug, plan: user.tenant.plan, customer_limit: user.tenant.customer_limit, is_active: user.tenant.is_active, subscription_status: user.tenant.subscription_status, subscription_ends_at: user.tenant.subscription_ends_at } : null,
      },
    });
    res.cookies.set('isp_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return res;
  } catch (e) {
    console.error('Login error:', e);
    const message = process.env.NODE_ENV === 'production'
      ? 'Server error'
      : (e?.message || String(e));
    return NextResponse.json(
      { error: 'Server error', detail: message },
      { status: 500 }
    );
  }
}
