import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function GET(request) {
  const user = await getSession(request);
  if (!user || !user.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const onlyMine = !userId || (user.role !== 'ADMIN' && user.role !== 'STAFF' && userId !== user.id);
  const where = {
    ...(onlyMine ? { user_id: user.id } : { user_id: userId }),
    user: { tenant_id: user.tenant_id },
  };
  const list = await prisma.userPackage.findMany({
    where,
    include: {
      package: true,
      user: { select: { id: true, email: true, full_name: true } },
    },
    orderBy: { created_at: 'desc' },
  });
  return NextResponse.json(list);
}

export async function POST(request) {
  const user = await getSession(request);
  if (!user || !user.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const targetUserId = body.user_id || user.id;
    if (user.role !== 'ADMIN' && targetUserId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { package_id, start_date, end_date, status } = body;
    if (!package_id || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'package_id, start_date, end_date required' },
        { status: 400 }
      );
    }
    const pkg = await prisma.package.findFirst({ where: { id: package_id, tenant_id: user.tenant_id } });
    if (!pkg || !pkg.is_active) {
      return NextResponse.json({ error: 'Package not found or inactive' }, { status: 400 });
    }
    const targetUser = await prisma.profile.findFirst({ where: { id: targetUserId, tenant_id: user.tenant_id } });
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 400 });
    const start = new Date(start_date);
    const end = new Date(end_date);
    const up = await prisma.userPackage.create({
      data: {
        user_id: targetUserId,
        package_id,
        start_date: start,
        end_date: end,
        status: status || (user.role === 'ADMIN' ? 'ACTIVE' : 'PENDING'),
      },
      include: { package: true, user: { select: { id: true, email: true, full_name: true } } },
    });
    return NextResponse.json(up);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
