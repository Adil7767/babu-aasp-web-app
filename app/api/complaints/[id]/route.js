import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function GET(request, { params }) {
  const user = await getSession(request);
  if (!user || !user.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = await params.id;
  const complaint = await prisma.complaint.findFirst({
    where: { id, tenant_id: user.tenant_id },
    include: {
      user: { select: { id: true, full_name: true, email: true } },
      assigned_to: { select: { id: true, full_name: true } },
    },
  });
  if (!complaint) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (user.role !== 'ADMIN' && user.role !== 'STAFF' && complaint.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json(complaint);
}

export async function PATCH(request, { params }) {
  const user = await getSession(request);
  if (!user || !user.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = await params.id;
  const complaint = await prisma.complaint.findFirst({ where: { id, tenant_id: user.tenant_id } });
  if (!complaint) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const isAdminOrStaff = user.role === 'ADMIN' || user.role === 'STAFF';
  if (!isAdminOrStaff && complaint.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await request.json();
  const data = {};
  if (body.status != null) {
    data.status = body.status;
    if (body.status === 'CLOSED' || body.status === 'RESOLVED') data.closed_at = new Date();
  }
  if (isAdminOrStaff && body.assigned_to_id != null) {
    if (body.assigned_to_id) {
      const assignee = await prisma.profile.findFirst({ where: { id: body.assigned_to_id, tenant_id: user.tenant_id } });
      if (!assignee) return NextResponse.json({ error: 'Assignee not found' }, { status: 400 });
    }
    data.assigned_to_id = body.assigned_to_id || null;
  }
  const updated = await prisma.complaint.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, full_name: true, email: true } },
      assigned_to: { select: { id: true, full_name: true } },
    },
  });
  return NextResponse.json(updated);
}
