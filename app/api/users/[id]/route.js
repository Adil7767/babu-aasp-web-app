import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

const profileSelect = {
  id: true,
  email: true,
  full_name: true,
  role: true,
  phone: true,
  address: true,
  installation_date: true,
  router_info: true,
  is_active: true,
  created_at: true,
};

export async function GET(request, { params }) {
  const user = await getSession(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = await params.id;
  const isAdminOrStaff = user.role === 'ADMIN' || user.role === 'STAFF';
  if (!isAdminOrStaff && user.id !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const profile = await prisma.profile.findFirst({
    where: { id, ...(user.tenant_id ? { tenant_id: user.tenant_id } : {}) },
    select: profileSelect,
  });
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(profile);
}

export async function PATCH(request, { params }) {
  const user = await getSession(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = await params.id;
  const target = await prisma.profile.findFirst({
    where: { id, ...(user.tenant_id ? { tenant_id: user.tenant_id } : {}) },
  });
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const isAdmin = user.role === 'ADMIN';
  const isStaff = user.role === 'STAFF';
  const canEditCustomer = isAdmin || (isStaff && target.role === 'USER');
  const canEditSelf = user.id === id;
  if (!isAdmin && !canEditCustomer && !canEditSelf) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (user.tenant_id && target.tenant_id !== user.tenant_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await request.json();
  const data = {};
  if (body.full_name != null) data.full_name = body.full_name;
  if (body.phone != null) data.phone = body.phone?.trim() || null;
  if (body.address != null) data.address = body.address?.trim() || null;
  if (body.router_info != null) data.router_info = body.router_info?.trim() || null;
  if (body.installation_date != null) data.installation_date = body.installation_date ? new Date(body.installation_date) : null;
  if (body.is_active != null && (isAdmin || isStaff)) data.is_active = body.is_active;
  if (body.email != null && isAdmin) data.email = body.email.trim().toLowerCase();
  if (body.role != null && isAdmin && target.role !== 'ADMIN') data.role = body.role;
  if (body.password != null && body.password.length >= 6 && (isAdmin || canEditSelf)) {
    const bcrypt = (await import('bcryptjs')).default;
    data.password_hash = await bcrypt.hash(body.password, 10);
  }
  const updated = await prisma.profile.update({
    where: { id },
    data,
    select: profileSelect,
  });
  return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
  const user = await getSession(request);
  if (!user || user.role !== 'ADMIN' || !user.tenant_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const id = await params.id;
  const target = await prisma.profile.findFirst({ where: { id, tenant_id: user.tenant_id } });
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (target.role === 'ADMIN') {
    return NextResponse.json({ error: 'Cannot delete admin' }, { status: 400 });
  }
  await prisma.profile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
