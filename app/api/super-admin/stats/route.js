import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function GET(request) {
  const session = await getSession(request);
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const [totalTenants, totalCustomers, totalRevenue] = await Promise.all([
    prisma.tenant.count({ where: { is_active: true } }),
    prisma.profile.count({ where: { role: 'USER', tenant_id: { not: null } } }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
  ]);
  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      plan: true,
      _count: { select: { profiles: { where: { role: 'USER' } } } },
    },
  });
  return NextResponse.json({
    total_tenants: totalTenants,
    total_customers: totalCustomers,
    platform_revenue: Number(totalRevenue._sum.amount ?? 0),
    tenants,
  });
}
