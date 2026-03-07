import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

const profileSelect = {
  id: true,
  email: true,
  full_name: true,
  role: true,
  staff_role: true,
  tenant_id: true,
  area_id: true,
  phone: true,
  address: true,
  installation_date: true,
  router_info: true,
  is_active: true,
  created_at: true,
  tenant: {
    select: {
      id: true,
      name: true,
      slug: true,
      plan: true,
      customer_limit: true,
      is_active: true,
      subscription_status: true,
      subscription_ends_at: true,
    },
  },
};

export async function GET(request) {
  const user = await getSession(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: profileSelect,
  });
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({
    ...profile,
    installation_date: profile.installation_date ? profile.installation_date.toISOString() : null,
    tenant: profile.tenant
      ? {
          ...profile.tenant,
          subscription_ends_at: profile.tenant.subscription_ends_at
            ? profile.tenant.subscription_ends_at.toISOString()
            : null,
        }
      : null,
  });
}

export async function PATCH(request) {
  const user = await getSession(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const data = {};
    if (body.full_name != null) data.full_name = String(body.full_name).trim();
    if (body.phone != null) data.phone = body.phone ? String(body.phone).trim() : null;
    if (body.address != null) data.address = body.address ? String(body.address).trim() : null;
    if (body.router_info != null) data.router_info = body.router_info ? String(body.router_info).trim() : null;
    if (body.installation_date != null) {
      data.installation_date = body.installation_date ? new Date(body.installation_date) : null;
    }
    if (user.role === 'ADMIN') {
      if (body.email != null && body.email.trim()) {
        const emailLower = String(body.email).trim().toLowerCase();
        const existing = await prisma.profile.findFirst({
          where: { email: emailLower, id: { not: user.id } },
        });
        if (existing) {
          return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
        }
        data.email = emailLower;
      }
    }
    const updated = await prisma.profile.update({
      where: { id: user.id },
      data,
      select: profileSelect,
    });
    return NextResponse.json({
      ...updated,
      installation_date: updated.installation_date ? updated.installation_date.toISOString() : null,
      tenant: updated.tenant
        ? {
            ...updated.tenant,
            subscription_ends_at: updated.tenant.subscription_ends_at
              ? updated.tenant.subscription_ends_at.toISOString()
              : null,
          }
        : null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
