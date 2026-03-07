import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function GET(request) {
  const user = await getSession(request);
  if (!user || !user.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parent_id');
  const list = await prisma.area.findMany({
    where: { tenant_id: user.tenant_id, ...(parentId ? { parent_id: parentId } : { parent_id: null }) },
    include: { _count: { select: { children: true, profiles: true } } },
    orderBy: { name: 'asc' },
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
    const { name, slug, parent_id } = body;
    if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 });
    const slugVal = (slug || name).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'area';
    if (parent_id) {
      const parent = await prisma.area.findFirst({ where: { id: parent_id, tenant_id: user.tenant_id } });
      if (!parent) return NextResponse.json({ error: 'Parent area not found' }, { status: 400 });
    }
    const area = await prisma.area.create({
      data: {
        tenant_id: user.tenant_id,
        parent_id: parent_id || null,
        name: name.trim(),
        slug: slugVal,
      },
    });
    return NextResponse.json(area);
  } catch (e) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'Area with this slug already exists' }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
