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
  const list = await prisma.invoice.findMany({
    where,
    include: { package: true, user: { select: { id: true, full_name: true, email: true } } },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });
  return NextResponse.json(list);
}

export async function POST(request) {
  const user = await getSession(request);
  if (!user || !user.tenant_id || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { user_id, package_id, amount, month, year, due_date, status } = body;
    if (!user_id || amount == null || !month || !year) {
      return NextResponse.json({ error: 'user_id, amount, month, year required' }, { status: 400 });
    }
    const targetUser = await prisma.profile.findFirst({ where: { id: user_id, tenant_id: user.tenant_id } });
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 400 });
    if (package_id) {
      const pkg = await prisma.package.findFirst({ where: { id: package_id, tenant_id: user.tenant_id } });
      if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 400 });
    }
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    const due = due_date ? new Date(due_date) : new Date(yearNum, monthNum, 0);
    const invoice = await prisma.invoice.upsert({
      where: {
        tenant_id_user_id_month_year: { tenant_id: user.tenant_id, user_id, month: monthNum, year: yearNum },
      },
      create: {
        tenant_id: user.tenant_id,
        user_id,
        package_id: package_id || null,
        amount: Number(amount),
        month: monthNum,
        year: yearNum,
        due_date: due,
        status: status || 'PENDING',
      },
      update: {
        amount: Number(amount),
        due_date: due,
        ...(status != null && { status }),
        ...(package_id != null && { package_id: package_id || null }),
      },
      include: { package: true, user: { select: { id: true, full_name: true, email: true } } },
    });
    return NextResponse.json(invoice);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
