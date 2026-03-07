'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      if (data.user.role === 'SUPER_ADMIN') {
        router.push('/super-admin');
      } else if (data.user.tenant?.subscription_status === 'SUSPENDED') {
        router.push('/suspended');
      } else if ((data.user.role === 'ADMIN' || data.user.role === 'STAFF') && data.user.tenant?.subscription_status === 'PENDING_PAYMENT') {
        router.push('/pending-subscription');
      } else if ((data.user.role === 'ADMIN' || data.user.role === 'STAFF') && data.user.tenant?.subscription_ends_at && new Date(data.user.tenant.subscription_ends_at) < new Date()) {
        router.push('/renew-subscription');
      } else if (data.user.role === 'ADMIN' || data.user.role === 'STAFF') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 bg-slate-900">
      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: 'url(/cover.png)' }} aria-hidden />
      <div className="relative z-10 w-full max-w-md">
        <div className="card text-center mb-8 bg-white/95 backdrop-blur">
          <div className="flex justify-center mb-6">
            <Image src="/appicon.png" alt="NETSCALE" width={80} height={80} priority className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">NETSCALE</h1>
          <p className="text-slate-500 mt-1 text-sm">ISP Management SaaS · Sign in to your account</p>
        </div>

        <div className="card bg-white/95 backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="label mb-0">Password</label>
                <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline">Forgot password?</Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-500">
            Use the credentials provided by your admin.
          </p>
          <p className="mt-3 text-center text-sm">
            <Link href="/signup" className="text-primary-600 font-medium hover:underline">Register your ISP (admin signup)</Link>
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-300">
          <Link href="/" className="text-white font-medium hover:underline">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
