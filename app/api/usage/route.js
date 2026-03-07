import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function GET(request) {
  const user = await getSession(request);
  if (!user || !user.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const onlyMine = !userId || (user.role !== 'ADMIN' && user.role !== 'STAFF' && userId !== user.id);
  const where = { tenant_id: user.tenant_id, ...(onlyMine ? { user_id: user.id } : { user_id: userId }) };
  const list = await prisma.usageRecord.findMany({
    where,
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });
  return NextResponse.json(list);
}

export async function POST(request) {
  const user = await getSession(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const targetUserId = body.user_id || user.id;
    if ((user.role !== 'ADMIN' && user.role !== 'STAFF') && targetUserId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { month, year, mb_used } = body;
    if (!month || !year || mb_used == null) {
      return NextResponse.json(
        { error: 'month, year, mb_used required' },
        { status: 400 }
      );
    }
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    const record = await prisma.usageRecord.upsert({
      where: {
        tenant_id_user_id_month_year: {
          tenant_id: user.tenant_id,
          user_id: targetUserId,
          month: monthNum,
          year: yearNum,
        },
      },
      create: {
        tenant_id: user.tenant_id,
        user_id: targetUserId,
        month: monthNum,
        year: yearNum,
        mb_used: parseInt(mb_used, 10) || 0,
      },
      update: { mb_used: parseInt(mb_used, 10) || 0 },
    });
    return NextResponse.json(record);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
