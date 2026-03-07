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
  const entityType = searchParams.get('entity_type');
  const entityId = searchParams.get('entity_id');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
  const list = await prisma.auditLog.findMany({
    where: {
      tenant_id: user.tenant_id,
      ...(entityType && { entity_type: entityType }),
      ...(entityId && { entity_id: entityId }),
    },
    orderBy: { created_at: 'desc' },
    take: limit,
  });
  return NextResponse.json(list);
}
