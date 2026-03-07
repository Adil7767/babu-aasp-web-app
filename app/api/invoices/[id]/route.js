import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function GET(request, { params }) {
  const user = await getSession(request);
  if (!user || !user.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = await params.id;
  const invoice = await prisma.invoice.findFirst({
    where: { id, tenant_id: user.tenant_id },
    include: { package: true, user: { select: { id: true, full_name: true, email: true } }, payments: true },
  });
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (user.role !== 'ADMIN' && user.role !== 'STAFF' && invoice.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json(invoice);
}
