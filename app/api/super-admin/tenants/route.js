import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function GET(request) {
  const session = await getSession(request);
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const list = await prisma.tenant.findMany({
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      plan: true,
      customer_limit: true,
      is_active: true,
      subscription_status: true,
      subscription_payment_method: true,
      subscription_payment_reference: true,
      subscription_amount: true,
      subscription_receipt_url: true,
      subscription_requested_at: true,
      subscription_approved_at: true,
      subscription_ends_at: true,
      created_at: true,
      _count: {
        select: {
          profiles: { where: { role: 'USER' } },
          packages: true,
        },
      },
    },
  });
  return NextResponse.json(list.map((t) => ({
    ...t,
    subscription_amount: t.subscription_amount != null ? Number(t.subscription_amount) : null,
    subscription_ends_at: t.subscription_ends_at ? t.subscription_ends_at.toISOString() : null,
  })));
}

export async function POST(request) {
  const session = await getSession(request);
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { name, slug, plan } = body;
    if (!name || !slug) {
      return NextResponse.json({ error: 'name and slug required' }, { status: 400 });
    }
    const customerLimits = { STARTER: 200, PROFESSIONAL: 1000, ENTERPRISE: 0 };
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        plan: plan || 'STARTER',
        customer_limit: customerLimits[plan] ?? 200,
        is_active: true,
      },
    });
    return NextResponse.json(tenant);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
