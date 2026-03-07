import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function GET(request, { params }) {
  const user = await getSession(request);
  if (!user || !user.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'ADMIN' && user.role !== 'STAFF') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = await params.id;
  const area = await prisma.area.findFirst({
    where: { id, tenant_id: user.tenant_id },
    include: { children: true, parent: { select: { id: true, name: true, slug: true } }, _count: { select: { profiles: true } } },
  });
  if (!area) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(area);
}

export async function PATCH(request, { params }) {
  const user = await getSession(request);
  if (!user || !user.tenant_id || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = await params.id;
  const existing = await prisma.area.findFirst({ where: { id, tenant_id: user.tenant_id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  try {
    const body = await request.json();
    const data = {};
    if (body.name != null) data.name = body.name.trim();
    if (body.slug != null) data.slug = body.slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (body.parent_id !== undefined) data.parent_id = body.parent_id || null;
    const area = await prisma.area.update({ where: { id }, data });
    return NextResponse.json(area);
  } catch (e) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'Slug already in use' }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getSession(request);
  if (!user || !user.tenant_id || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = await params.id;
  const existing = await prisma.area.findFirst({ where: { id, tenant_id: user.tenant_id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.area.delete({ where: { id } });
  return NextResponse.json({ message: 'Deleted' });
}
