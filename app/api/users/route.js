import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';
import { createAuditLog } from '@/lib/audit.js';

const customerSelect = {
  id: true,
  email: true,
  full_name: true,
  role: true,
  staff_role: true,
  area_id: true,
  phone: true,
  address: true,
  installation_date: true,
  router_info: true,
  is_active: true,
  created_at: true,
};

export async function GET(request) {
  const user = await getSession(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((user.role !== 'ADMIN' && user.role !== 'STAFF') || !user.tenant_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const roleFilter = searchParams.get('role');
  const where = { tenant_id: user.tenant_id };
  if (roleFilter === 'STAFF') where.role = 'STAFF';
  else if (roleFilter === 'USER') where.role = 'USER';
  else where.role = { in: ['USER', 'STAFF'] };
  const list = await prisma.profile.findMany({
    where,
    select: customerSelect,
    orderBy: { created_at: 'desc' },
  });
  return NextResponse.json(list);
}

export async function POST(request) {
  const user = await getSession(request);
  if (!user || user.role !== 'ADMIN' || !user.tenant_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { email, full_name, password, role, staff_role, area_id, phone, address, installation_date, router_info } = body;
    if (!email || !full_name || !password) {
      return NextResponse.json(
        { error: 'Email, full_name and password required' },
        { status: 400 }
      );
    }
    const newRole = role === 'STAFF' ? 'STAFF' : 'USER';
    const validStaffRoles = ['OPERATOR', 'TECHNICIAN', 'BILLING_MANAGER'];
    const staffRoleVal = newRole === 'STAFF' && validStaffRoles.includes(staff_role) ? staff_role : null;
    if (area_id) {
      const area = await prisma.area.findFirst({ where: { id: area_id, tenant_id: user.tenant_id } });
      if (!area) return NextResponse.json({ error: 'Area not found' }, { status: 400 });
    }
    if (newRole === 'USER') {
      const tenant = await prisma.tenant.findUnique({ where: { id: user.tenant_id } });
      if (tenant && tenant.customer_limit > 0) {
        const count = await prisma.profile.count({ where: { tenant_id: user.tenant_id, role: 'USER' } });
        if (count >= tenant.customer_limit) {
          return NextResponse.json(
            { error: `Customer limit reached (${tenant.customer_limit}). Upgrade plan.` },
            { status: 400 }
          );
        }
      }
    }
    const existing = await prisma.profile.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const created = await prisma.profile.create({
      data: {
        email: email.trim().toLowerCase(),
        full_name: full_name.trim(),
        password_hash,
        role: newRole,
        staff_role: staffRoleVal,
        area_id: area_id || null,
        tenant_id: user.tenant_id,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        installation_date: installation_date ? new Date(installation_date) : null,
        router_info: router_info?.trim() || null,
      },
      select: customerSelect,
    });
    await createAuditLog({
      tenantId: user.tenant_id,
      userId: user.id,
      action: newRole === 'USER' ? 'CUSTOMER_ADDED' : 'STAFF_ADDED',
      entityType: 'Profile',
      entityId: created.id,
      payload: { email: created.email, full_name: created.full_name },
    });
    return NextResponse.json(created);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
