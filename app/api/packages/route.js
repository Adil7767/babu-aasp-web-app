import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function GET(request) {
  const user = await getSession(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenantId = user.tenant_id;
  if (!tenantId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const where = { tenant_id: tenantId };
  if (user.role !== 'ADMIN' && user.role !== 'STAFF') where.is_active = true;
  const list = await prisma.package.findMany({
    where,
    orderBy: { created_at: 'desc' },
  });
  return NextResponse.json(list);
}

export async function POST(request) {
  const user = await getSession(request);
  if (!user || user.role !== 'ADMIN' || !user.tenant_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { name, type, mb_limit, speed_mbps, price, validity_period_days, description, is_active } = body;
    if (!name || price == null) {
      return NextResponse.json({ error: 'Name and price required' }, { status: 400 });
    }
    const pkg = await prisma.package.create({
      data: {
        tenant_id: user.tenant_id,
        name,
        type: type || 'DATA',
        mb_limit: mb_limit != null ? parseInt(mb_limit, 10) : null,
        speed_mbps: speed_mbps != null ? parseInt(speed_mbps, 10) : null,
        price: Number(price),
        validity_period_days: validity_period_days != null ? parseInt(validity_period_days, 10) : null,
        description: description || null,
        is_active: is_active !== false,
      },
    });
    return NextResponse.json(pkg);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
