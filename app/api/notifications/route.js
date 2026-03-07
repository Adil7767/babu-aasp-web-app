import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function GET(request) {
  const user = await getSession(request);
  if (!user || !user.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get('unread') === 'true';
  const where = { tenant_id: user.tenant_id, user_id: user.id, ...(unreadOnly && { read_at: null }) };
  const list = await prisma.notification.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: 100,
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
    const { user_id, title, body: bodyText, type } = body;
    if (!user_id || !title) {
      return NextResponse.json({ error: 'user_id and title required' }, { status: 400 });
    }
    const targetUser = await prisma.profile.findFirst({ where: { id: user_id, tenant_id: user.tenant_id } });
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 400 });
    const notification = await prisma.notification.create({
      data: {
        tenant_id: user.tenant_id,
        user_id,
        title,
        body: bodyText || null,
        type: type || 'OTHER',
      },
    });
    return NextResponse.json(notification);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
