'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError('Missing reset token. Use the link from your email.');
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Reset failed');
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
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
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Set new password</h1>
          <p className="text-slate-500 mt-1 text-sm">Enter your new password below</p>
        </div>

        <div className="card bg-white/95 backdrop-blur">
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-emerald-600 font-medium">Password reset successfully. Redirecting to sign in…</p>
              <Link href="/login" className="btn-primary inline-block">Sign in</Link>
            </div>
          ) : !token ? (
            <div className="text-center space-y-4">
              <p className="text-slate-600">Invalid or missing reset link. Request a new one from the login page.</p>
              <Link href="/forgot-password" className="btn-primary inline-block">Request reset link</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="password" className="label">New password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="confirm" className="label">Confirm password</label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                {loading ? 'Resetting…' : 'Reset password'}
              </button>
            </form>
          )}
          <p className="mt-5 text-center text-sm">
            <Link href="/login" className="text-primary-600 font-medium hover:underline">← Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
