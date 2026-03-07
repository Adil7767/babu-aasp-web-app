import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function GET(request) {
  const user = await getSession(request);
  if (!user || !user.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const isAdminOrStaff = user.role === 'ADMIN' || user.role === 'STAFF';
  const onlyMine = !userId || (!isAdminOrStaff && userId !== user.id);
  const where = { tenant_id: user.tenant_id, ...(onlyMine ? { user_id: user.id } : { user_id: userId }) };
  const list = await prisma.payment.findMany({
    where,
    include: { invoice: { select: { id: true, month: true, year: true, status: true } } },
    orderBy: [{ year: 'desc' }, { month: 'desc' }, { paid_at: 'desc' }],
  });
  return NextResponse.json(list);
}

export async function POST(request) {
  const user = await getSession(request);
  if (!user || !user.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const targetUserId = body.user_id || user.id;
    const isAdminOrStaff = user.role === 'ADMIN' || user.role === 'STAFF';
    if (!isAdminOrStaff && targetUserId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (isAdminOrStaff && targetUserId !== user.id) {
      const target = await prisma.profile.findFirst({ where: { id: targetUserId, tenant_id: user.tenant_id } });
      if (!target) return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }
    const { amount, month, year, notes, payment_method, receipt_url, invoice_id } = body;
    if (amount == null || !month || !year) {
      return NextResponse.json(
        { error: 'amount, month, year required' },
        { status: 400 }
      );
    }
    const validMethods = ['JAZZCASH', 'EASYPAISA', 'MANUAL'];
    const method = validMethods.includes(body.payment_method) ? body.payment_method : 'MANUAL';
    const payment = await prisma.payment.create({
      data: {
        tenant_id: user.tenant_id,
        user_id: targetUserId,
        amount: Number(amount),
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        notes: notes || null,
        payment_method: method,
        receipt_url: receipt_url || null,
        invoice_id: invoice_id || null,
        verification_status: method === 'MANUAL' && receipt_url ? 'PENDING' : 'VERIFIED',
      },
      include: { invoice: { select: { id: true, month: true, year: true } } },
    });
    return NextResponse.json(payment);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
