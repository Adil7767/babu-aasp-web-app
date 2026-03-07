'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [plan, setPlan] = useState('STARTER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/plans')
      .then((r) => r.json())
      .then(setPlans)
      .catch(() =>
        setPlans([
          { id: 'STARTER', name: 'Starter', customer_limit: 200, monthly_price_pkr: 1000, description: 'Up to 200 customers' },
          { id: 'PROFESSIONAL', name: 'Professional', customer_limit: 1000, monthly_price_pkr: 2000, description: 'Up to 1,000 customers' },
          { id: 'ENTERPRISE', name: 'Enterprise', customer_limit: 0, monthly_price_pkr: 3000, description: 'Unlimited customers' },
        ])
      );
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName.trim(),
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          plan,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100 px-4">
        <div className="card max-w-md w-full text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 text-2xl mb-6">✓</div>
          <h1 className="text-xl font-bold text-slate-800">Registration successful</h1>
          <p className="text-slate-600 mt-2 text-sm">
            Please sign in and submit your subscription payment (JazzCash, EasyPaisa, or bank transfer) for Super Admin approval.
          </p>
          <Link href="/login" className="btn-primary mt-6 inline-block w-full py-3.5 text-center">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="card text-center mb-6">
          <div className="flex justify-center mb-6">
            <Image src="/appicon.png" alt="NETSCALE" width={72} height={72} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Register your ISP</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Create an account and choose a plan. Payment is manual (JazzCash / EasyPaisa) and approved by the platform.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</div>
            )}
            <div>
              <label htmlFor="company_name" className="label">Company / ISP name</label>
              <input id="company_name" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="input-field" placeholder="e.g. Babu ISP" />
            </div>
            <div>
              <label htmlFor="full_name" className="label">Your full name</label>
              <input id="full_name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="input-field" placeholder="Admin name" />
            </div>
            <div>
              <label htmlFor="email" className="label">Email (login)</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" placeholder="admin@yourisp.com" />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input-field" placeholder="••••••••" />
            </div>
            <div>
              <label className="label">Plan</label>
              <select value={plan} onChange={(e) => setPlan(e.target.value)} className="input-field">
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} – PKR {(p.monthly_price_pkr ?? 0).toLocaleString()}/mo · {p.description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Pay via JazzCash / EasyPaisa after signup. Super Admin will activate your account.</p>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? 'Registering…' : 'Register'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/login" className="text-primary-600 font-medium hover:underline">Already have an account? Sign in</Link>
        </p>
      </div>
    </div>
  );
}
