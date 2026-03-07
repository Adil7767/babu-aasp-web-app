import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function GET(request, { params }) {
  const user = await getSession(request);
  if (!user || !user.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = await params.id;
  const up = await prisma.userPackage.findFirst({
    where: { id, user: { tenant_id: user.tenant_id } },
    include: { package: true, user: { select: { id: true, email: true, full_name: true } } },
  });
  if (!up) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (user.role !== 'ADMIN' && user.role !== 'STAFF' && up.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json(up);
}

export async function PATCH(request, { params }) {
  const user = await getSession(request);
  if (!user || !user.tenant_id || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const id = await params.id;
  const existing = await prisma.userPackage.findFirst({
    where: { id, user: { tenant_id: user.tenant_id } },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await request.json();
  const data = {};
  if (body.status != null) data.status = body.status;
  if (body.start_date != null) data.start_date = new Date(body.start_date);
  if (body.end_date != null) data.end_date = new Date(body.end_date);
  const up = await prisma.userPackage.update({
    where: { id },
    data,
    include: { package: true, user: { select: { id: true, email: true, full_name: true } } },
  });
  return NextResponse.json(up);
}
