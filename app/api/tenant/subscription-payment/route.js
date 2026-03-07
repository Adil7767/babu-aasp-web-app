import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

const VALID_METHODS = ['JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER', 'MANUAL'];

export async function PATCH(request) {
  const user = await getSession(request);
  if (!user || !user.tenant_id || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenant_id },
    });
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    const isExpired = tenant.subscription_ends_at && new Date(tenant.subscription_ends_at) < new Date();
    const canSubmit = tenant.subscription_status === 'PENDING_PAYMENT' || (tenant.subscription_status === 'ACTIVE' && isExpired);
    if (!canSubmit) {
      return NextResponse.json(
        { error: 'Subscription is not pending payment or renewal' },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { payment_method, payment_reference, amount, receipt_url } = body;
    if (!payment_method || !payment_reference?.trim()) {
      return NextResponse.json(
        { error: 'payment_method and payment_reference are required' },
        { status: 400 }
      );
    }
    const method = VALID_METHODS.includes(payment_method) ? payment_method : 'MANUAL';
    await prisma.tenant.update({
      where: { id: user.tenant_id },
      data: {
        subscription_payment_method: method,
        subscription_payment_reference: payment_reference.trim(),
        subscription_amount: amount != null ? Number(amount) : null,
        subscription_receipt_url: receipt_url?.trim() || null,
      },
    });
    return NextResponse.json({ message: 'Payment details submitted. Super Admin will review and activate (or renew) your account.' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
