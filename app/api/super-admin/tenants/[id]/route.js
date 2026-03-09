import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

const CUSTOMER_LIMITS = { STARTER: 200, PROFESSIONAL: 1000, ENTERPRISE: 0 };
const VALID_PLANS = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'];

export async function PATCH(request, { params }) {
  const session = await getSession(request);
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const id = await params.id;
  if (!id) {
    return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
  }
  try {
    const body = await request.json();
    const { action, plan } = body;

    if (action === 'approve') {
      const now = new Date();
      const endsAt = new Date(now);
      endsAt.setDate(endsAt.getDate() + 30);
      await prisma.tenant.update({
        where: { id },
        data: {
          subscription_status: 'ACTIVE',
          is_active: true,
          subscription_approved_at: now,
          subscription_ends_at: endsAt,
          approved_by_id: session.id,
        },
      });
      return NextResponse.json({ message: 'Tenant approved and activated (subscription valid 30 days)' });
    }

    if (action === 'renew') {
      const tenant = await prisma.tenant.findUnique({ where: { id } });
      if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      const base = tenant.subscription_ends_at && tenant.subscription_ends_at > new Date() ? tenant.subscription_ends_at : new Date();
      const endsAt = new Date(base);
      endsAt.setDate(endsAt.getDate() + 30);
      await prisma.tenant.update({
        where: { id },
        data: { subscription_ends_at: endsAt, subscription_approved_at: new Date(), approved_by_id: session.id },
      });
      return NextResponse.json({ message: 'Subscription renewed for 30 days' });
    }

    if (action === 'suspend') {
      await prisma.tenant.update({
        where: { id },
        data: {
          subscription_status: 'SUSPENDED',
          is_active: false,
        },
      });
      return NextResponse.json({ message: 'Tenant suspended' });
    }

    if (action === 'activate' || (plan && VALID_PLANS.includes(plan))) {
      const data = {};
      if (action === 'activate') {
        data.subscription_status = 'ACTIVE';
        data.is_active = true;
      }
      if (plan && VALID_PLANS.includes(plan)) {
        data.plan = plan;
        data.customer_limit = CUSTOMER_LIMITS[plan];
      }
      if (Object.keys(data).length > 0) {
        await prisma.tenant.update({ where: { id }, data });
        return NextResponse.json({ message: 'Tenant updated' });
      }
    }

    return NextResponse.json({ error: 'Invalid action or plan' }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
