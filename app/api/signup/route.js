import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma.js';

const CUSTOMER_LIMITS = { STARTER: 200, PROFESSIONAL: 1000, ENTERPRISE: 0 };
const VALID_PLANS = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'];

export async function POST(request) {
  try {
    const body = await request.json();
    const { company_name, email, password, full_name, plan } = body;
    if (!company_name?.trim() || !email?.trim() || !password || !full_name?.trim()) {
      return NextResponse.json(
        { error: 'company_name, email, password, and full_name are required' },
        { status: 400 }
      );
    }
    const planKey = VALID_PLANS.includes(plan) ? plan : 'STARTER';
    const emailLower = email.trim().toLowerCase();
    const existing = await prisma.profile.findUnique({ where: { email: emailLower } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }
    const slug = company_name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!slug) {
      return NextResponse.json({ error: 'Company name must contain letters or numbers' }, { status: 400 });
    }
    const existingSlug = await prisma.tenant.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json({ error: 'Company name already registered. Try a different name.' }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const tenant = await prisma.tenant.create({
      data: {
        name: company_name.trim(),
        slug,
        plan: planKey,
        customer_limit: CUSTOMER_LIMITS[planKey],
        is_active: false,
        subscription_status: 'PENDING_PAYMENT',
        subscription_requested_at: new Date(),
      },
    });
    await prisma.profile.create({
      data: {
        email: emailLower,
        full_name: full_name.trim(),
        password_hash: passwordHash,
        role: 'ADMIN',
        tenant_id: tenant.id,
      },
    });
    return NextResponse.json({
      message: 'Registration successful. Please log in and submit your subscription payment (JazzCash / EasyPaisa) for approval.',
      tenant_id: tenant.id,
    });
  } catch (e) {
    console.error('Signup error:', e);
    const message = process.env.NODE_ENV === 'production'
      ? 'Server error'
      : (e?.message || String(e));
    return NextResponse.json(
      { error: 'Server error', detail: message },
      { status: 500 }
    );
  }
}
