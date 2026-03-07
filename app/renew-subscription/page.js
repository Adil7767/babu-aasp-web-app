'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PLAN_PKR = { STARTER: 1000, PROFESSIONAL: 2000, ENTERPRISE: 3000 };

export default function RenewSubscriptionPage() {
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
          return null;
        }
        const endsAt = u.tenant?.subscription_ends_at ? new Date(u.tenant.subscription_ends_at) : null;
        const isExpired = endsAt && endsAt < new Date();
        if (!isExpired && u.tenant?.subscription_status === 'PENDING_PAYMENT') {
          router.replace('/pending-subscription');
          return null;
        }
        if (!isExpired) {
          router.replace('/admin');
          return null;
        }
        return Promise.all([
          fetch('/api/tenant', { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
          fetch('/api/plans?payment_details=true').then((r) => r.json()),
        ]);
      })
      .then((data) => {
        if (!data) return;
        const [t, plansData] = data;
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
      setTenant((prev) => prev ? { ...prev, subscription_payment_reference: paymentReference.trim() } : null);
    } finally {
      setSubmitLoading(false);
    }
  }

  if (loading && !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-slate-100 px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="card text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 text-2xl mb-6">🔄</div>
          <h1 className="text-xl font-bold text-slate-800">Renew your subscription</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Your plan has expired. Pay the monthly fee to continue using the admin dashboard. Data is saved.
          </p>
          <p className="text-primary-600 font-semibold mt-2">PKR {(PLAN_PKR[tenant?.plan] ?? 0).toLocaleString()} / month</p>
        </div>

        {!submitted && paymentInstructions && (paymentInstructions.jazzcash || paymentInstructions.easypaisa || paymentInstructions.bank) && (
          <div className="card bg-slate-50 border border-slate-200 mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-2">Pay to Super Admin</h2>
            <ul className="text-sm text-slate-600 space-y-1">
              {paymentInstructions.jazzcash && <li><strong>JazzCash:</strong> {paymentInstructions.jazzcash}</li>}
              {paymentInstructions.easypaisa && <li><strong>EasyPaisa:</strong> {paymentInstructions.easypaisa}</li>}
              {paymentInstructions.bank && <li><strong>Bank:</strong> {paymentInstructions.bank}</li>}
            </ul>
          </div>
        )}

        {submitted ? (
          <div className="card bg-amber-50/50 border border-amber-200">
            <p className="text-amber-800 font-medium">Renewal payment submitted</p>
            <p className="text-slate-600 text-sm mt-2">Super Admin will verify and extend your subscription.</p>
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              <Link href="/" className="btn-secondary inline-block text-center py-2.5 px-4 text-sm">Back to home</Link>
              <button type="button" onClick={handleLogout} disabled={loggingOut} className="btn-secondary py-2.5 px-4 text-sm border-slate-300 text-slate-600 hover:bg-slate-100">
                {loggingOut ? '…' : 'Log out'}
              </button>
            </div>
          </div>
        ) : (
          <div className="card">
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
                <input type="text" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} required className="input-field" placeholder="e.g. transaction ID" />
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
                {submitLoading ? 'Submitting…' : 'Submit renewal payment'}
              </button>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/" className="text-primary-600 font-medium hover:underline">← Back to home</Link>
          <span className="mx-2">·</span>
          <button type="button" onClick={handleLogout} disabled={loggingOut} className="text-primary-600 font-medium hover:underline">
            {loggingOut ? '…' : 'Log out'}
          </button>
        </p>
      </div>
    </div>
  );
}
