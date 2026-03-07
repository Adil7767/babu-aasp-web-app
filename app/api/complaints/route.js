import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function GET(request) {
  const user = await getSession(request);
  if (!user || !user.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const status = searchParams.get('status');
  const isAdminOrStaff = user.role === 'ADMIN' || user.role === 'STAFF';
  const onlyMine = !userId || (!isAdminOrStaff && userId !== user.id);
  const where = {
    tenant_id: user.tenant_id,
    ...(onlyMine && { user_id: user.id }),
    ...(userId && isAdminOrStaff && { user_id: userId }),
    ...(status && { status }),
  };
  const list = await prisma.complaint.findMany({
    where,
    include: {
      user: { select: { id: true, full_name: true, email: true } },
      assigned_to: { select: { id: true, full_name: true } },
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
    const { category, description } = body;
    if (!category || !description?.trim()) {
      return NextResponse.json({ error: 'category and description required' }, { status: 400 });
    }
    const validCategories = ['SLOW_INTERNET', 'NO_CONNECTION', 'ROUTER_ISSUE', 'BILLING_QUERY', 'OTHER'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }
    const complaint = await prisma.complaint.create({
      data: {
        tenant_id: user.tenant_id,
        user_id: user.id,
        category,
        description: description.trim(),
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, full_name: true, email: true } },
      },
    });
    return NextResponse.json(complaint);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
