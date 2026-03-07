import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function GET(request, { params }) {
  const user = await getSession(request);
  if (!user || !user.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = await params.id;
  const payment = await prisma.payment.findFirst({
    where: { id, tenant_id: user.tenant_id },
    include: { invoice: true, user: { select: { id: true, full_name: true, email: true } } },
  });
  if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (user.role !== 'ADMIN' && user.role !== 'STAFF' && payment.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json(payment);
}

export async function PATCH(request, { params }) {
  const user = await getSession(request);
  if (!user || !user.tenant_id || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const id = await params.id;
  const existing = await prisma.payment.findFirst({ where: { id, tenant_id: user.tenant_id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await request.json();
  const data = {};
  if (body.verification_status != null) {
    const v = body.verification_status;
    if (['PENDING', 'VERIFIED', 'REJECTED'].includes(v)) data.verification_status = v;
  }
  if (body.receipt_url != null) data.receipt_url = body.receipt_url;
  const payment = await prisma.payment.update({
    where: { id },
    data,
    include: { invoice: true },
  });
  return NextResponse.json(payment);
}
