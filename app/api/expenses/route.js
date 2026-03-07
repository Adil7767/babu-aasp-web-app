import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function GET(request) {
  const user = await getSession(request);
  if (!user || !user.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const list = await prisma.expenseRecord.findMany({
    where: { tenant_id: user.tenant_id },
    include: { created_by: { select: { id: true, full_name: true } } },
    orderBy: [{ year: 'desc' }, { month: 'desc' }, { created_at: 'desc' }],
  });
  return NextResponse.json(list);
}

export async function POST(request) {
  const user = await getSession(request);
  if (!user || !user.tenant_id || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { amount, month, year, description } = body;
    if (amount == null || !month || !year) {
      return NextResponse.json(
        { error: 'amount, month, year required' },
        { status: 400 }
      );
    }
    const expense = await prisma.expenseRecord.create({
      data: {
        tenant_id: user.tenant_id,
        amount: Number(amount),
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        description: description || null,
        created_by_id: user.id,
      },
    });
    return NextResponse.json(expense);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
