'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PLAN_PKR = { STARTER: 1000, PROFESSIONAL: 2000, ENTERPRISE: 3000 };

export default function PendingSubscriptionPage() {
  const router = useRouter();
  const [tenant, setTenant] = useState(null);
  const [paymentInstructions, setPaymentInstructions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('JAZZCASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [amount, setAmount] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/login';
    } finally {
      setLoggingOut(false);
    }
  }

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (!u || (u.role !== 'ADMIN' && u.role !== 'STAFF')) {
          router.replace('/login');
          return;
        }
        if (u.tenant?.subscription_status !== 'PENDING_PAYMENT') {
          router.replace(u.role === 'ADMIN' || u.role === 'STAFF' ? '/admin' : '/dashboard');
          return;
        }
        return Promise.all([
          fetch('/api/tenant', { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
          fetch('/api/plans?payment_details=true').then((r) => r.json()),
        ]);
      })
      .then(([t, plansData]) => {
        if (t) {
          setTenant(t);
          setSubmitted(!!t.subscription_payment_reference);
        }
        if (plansData?.payment_instructions) setPaymentInstructions(plansData.payment_instructions);
      })
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);
    try {
      const res = await fetch('/api/tenant/subscription-payment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          payment_method: paymentMethod,
          payment_reference: paymentReference.trim(),
          amount: amount ? parseFloat(amount) : undefined,
          receipt_url: receiptUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit');
        return;
      }
      setSubmitted(true);
      setTenant((prev) => prev ? { ...prev, subscription_payment_reference: paymentReference.trim(), subscription_payment_method: paymentMethod, subscription_amount: amount ? parseFloat(amount) : null } : null);
    } finally {
      setSubmitLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 w-full min-h-screen flex flex-col items-center justify-center bg-surface">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background via-40% to-amber-500/20 px-4 py-12 overflow-auto">
      <div className="w-full max-w-md flex-shrink-0 mx-auto">
        <div className="card text-center mb-6 shadow-md">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-700 text-2xl mb-6">⏳</div>
          <h1 className="text-xl font-bold text-foreground">Complete your subscription</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {tenant?.name} – {tenant?.plan} plan (up to {tenant?.customer_limit === 0 ? 'unlimited' : tenant?.customer_limit} customers)
          </p>
          <p className="text-primary font-semibold mt-2">PKR {(PLAN_PKR[tenant?.plan] ?? 0).toLocaleString()} / month</p>
        </div>

        {!submitted && paymentInstructions && (paymentInstructions.jazzcash || paymentInstructions.easypaisa || paymentInstructions.bank) && (
          <div className="card bg-muted/50 border-border mb-6 shadow-md">
            <h2 className="text-sm font-semibold text-foreground mb-2">Pay to Super Admin (platform)</h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              {paymentInstructions.jazzcash && <li><strong>JazzCash:</strong> {paymentInstructions.jazzcash}</li>}
              {paymentInstructions.easypaisa && <li><strong>EasyPaisa:</strong> {paymentInstructions.easypaisa}</li>}
              {paymentInstructions.bank && <li><strong>Bank:</strong> {paymentInstructions.bank}</li>}
            </ul>
          </div>
        )}

        {submitted ? (
          <div className="card bg-amber-500/10 border-amber-500/30 shadow-md">
            <p className="text-amber-800 font-medium">Payment details submitted</p>
            <p className="text-muted-foreground text-sm mt-2">
              Super Admin will verify your payment (JazzCash / EasyPaisa / bank) and activate your account. You will be able to use the admin dashboard after approval.
            </p>
            {tenant?.subscription_payment_reference && (
              <p className="text-slate-500 text-xs mt-3">Reference: {tenant.subscription_payment_reference}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              <Link href="/" className="btn-secondary inline-block text-center py-2.5 px-4 text-sm">Back to home</Link>
              <button type="button" onClick={handleLogout} disabled={loggingOut} className="btn-secondary py-2.5 px-4 text-sm">
                {loggingOut ? '…' : 'Log out'}
              </button>
            </div>
          </div>
        ) : (
          <div className="card shadow-md">
            <p className="text-sm text-muted-foreground mb-4">Pay the platform fee via JazzCash, EasyPaisa, or bank transfer. Then enter the transaction/reference ID below.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">{error}</div>}
              <div>
                <label className="label">Payment method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input-field">
                  <option value="JAZZCASH">JazzCash</option>
                  <option value="EASYPAISA">EasyPaisa</option>
                  <option value="BANK_TRANSFER">Bank transfer</option>
                  <option value="MANUAL">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Transaction / reference ID</label>
                <input type="text" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} required className="input-field" placeholder="e.g. transaction ID or receipt number" />
              </div>
              <div>
                <label className="label">Amount paid (PKR, optional)</label>
                <input type="number" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field" placeholder="e.g. 1000" />
              </div>
              <div>
                <label className="label">Payment screenshot / receipt URL (optional)</label>
                <input type="url" value={receiptUrl} onChange={(e) => setReceiptUrl(e.target.value)} className="input-field" placeholder="https://..." />
              </div>
              <button type="submit" disabled={submitLoading} className="btn-primary w-full py-3.5">
                {submitLoading ? 'Submitting…' : 'Submit payment details'}
              </button>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="text-primary font-medium hover:underline">← Back to home</Link>
          <span className="mx-2">·</span>
          <button type="button" onClick={handleLogout} disabled={loggingOut} className="text-primary font-medium hover:underline">
            {loggingOut ? '…' : 'Log out'}
          </button>
        </p>
      </div>
    </div>
  );
}
