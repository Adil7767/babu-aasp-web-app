import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function GET(request) {
  const user = await getSession(request);
  if (!user || !user.tenant_id || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenant_id },
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
    },
  });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  return NextResponse.json({
    ...tenant,
    subscription_amount: tenant.subscription_amount != null ? Number(tenant.subscription_amount) : null,
    subscription_ends_at: tenant.subscription_ends_at ? tenant.subscription_ends_at.toISOString() : null,
  });
}
