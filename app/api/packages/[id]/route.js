import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function GET(request, { params }) {
  const user = await getSession(request);
  if (!user || !user.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = await params.id;
  const pkg = await prisma.package.findFirst({ where: { id, tenant_id: user.tenant_id } });
  if (!pkg) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(pkg);
}

export async function PATCH(request, { params }) {
  const user = await getSession(request);
  if (!user || user.role !== 'ADMIN' || !user.tenant_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const id = await params.id;
  const body = await request.json();
  const pkg = await prisma.package.updateMany({
    where: { id, tenant_id: user.tenant_id },
    data: {
      ...(body.name != null && { name: body.name }),
      ...(body.type != null && { type: body.type }),
      ...(body.mb_limit != null && { mb_limit: body.mb_limit }),
      ...(body.speed_mbps != null && { speed_mbps: body.speed_mbps }),
      ...(body.price != null && { price: Number(body.price) }),
      ...(body.validity_period_days != null && { validity_period_days: body.validity_period_days }),
      ...(body.description != null && { description: body.description }),
      ...(body.is_active != null && { is_active: body.is_active }),
    },
  });
  if (pkg.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = await prisma.package.findUnique({ where: { id } });
  return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
  const user = await getSession(request);
  if (!user || user.role !== 'ADMIN' || !user.tenant_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const id = await params.id;
  const deleted = await prisma.package.deleteMany({ where: { id, tenant_id: user.tenant_id } });
  if (deleted.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
