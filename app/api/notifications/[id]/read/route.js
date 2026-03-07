import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function PATCH(request, { params }) {
  const user = await getSession(request);
  if (!user || !user.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = await params.id;
  const notification = await prisma.notification.findFirst({
    where: { id, tenant_id: user.tenant_id },
  });
  if (!notification) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (notification.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const updated = await prisma.notification.update({
    where: { id },
    data: { read_at: new Date() },
  });
  return NextResponse.json(updated);
}
