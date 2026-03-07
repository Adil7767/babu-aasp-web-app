import { NextResponse } from 'next/server';
import { getSession, isTenantSubscriptionActive } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function GET(request) {
  const user = await getSession(request);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF') || !user.tenant_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!isTenantSubscriptionActive(user.tenant)) {
    return NextResponse.json({ error: 'Subscription expired. Please renew to continue.', code: 'SUBSCRIPTION_EXPIRED' }, { status: 402 });
  }
  const tenantId = user.tenant_id;
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') ? parseInt(searchParams.get('year'), 10) : new Date().getFullYear();

  const [
    totalIncome,
    totalExpense,
    userCount,
    activePackages,
    expiredCount,
    complaintsPending,
    complaintsInProgress,
    complaintsResolved,
    activeCustomers,
    inactiveCustomers,
  ] = await Promise.all([
    prisma.payment.aggregate({ where: { tenant_id: tenantId, year }, _sum: { amount: true } }),
    prisma.expenseRecord.aggregate({ where: { tenant_id: tenantId, year }, _sum: { amount: true } }),
    prisma.profile.count({ where: { tenant_id: tenantId, role: 'USER' } }),
    prisma.userPackage.count({
      where: { status: 'ACTIVE', end_date: { gte: new Date() }, user: { tenant_id: tenantId } },
    }),
    prisma.userPackage.count({ where: { status: 'EXPIRED', user: { tenant_id: tenantId } } }),
    prisma.complaint.count({ where: { tenant_id: tenantId, status: 'PENDING' } }),
    prisma.complaint.count({ where: { tenant_id: tenantId, status: 'IN_PROGRESS' } }),
    prisma.complaint.count({ where: { tenant_id: tenantId, status: 'RESOLVED' } }),
    prisma.profile.count({ where: { tenant_id: tenantId, role: 'USER', is_active: true } }),
    prisma.profile.count({ where: { tenant_id: tenantId, role: 'USER', is_active: false } }),
  ]);

  const income = Number(totalIncome._sum.amount ?? 0);
  const expense = Number(totalExpense._sum.amount ?? 0);

  return NextResponse.json({
    year,
    total_income: income,
    total_expense: expense,
    profit: income - expense,
    total_users: userCount,
    active_customers: activeCustomers,
    inactive_customers: inactiveCustomers,
    active_packages: activePackages,
    expired_packages: expiredCount,
    complaints_pending: complaintsPending,
    complaints_in_progress: complaintsInProgress,
    complaints_resolved: complaintsResolved,
  });
}
