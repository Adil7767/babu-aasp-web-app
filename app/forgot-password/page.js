'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSent(false);
    setResetLink('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.detail || data.error || 'Something went wrong';
        setError(msg);
        toast.error(msg);
        return;
      }
      setSent(true);
      if (data.reset_link) setResetLink(data.reset_link);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="card text-center mb-6">
          <div className="flex justify-center mb-6">
            <Image src="/appicon.png" alt="NETSCALE" width={72} height={72} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Forgot password</h1>
          <p className="text-slate-500 mt-1 text-sm">Enter your email to receive a reset link</p>
        </div>
        <div className="card">
          {sent ? (
            <div className="space-y-4">
              <p className="text-slate-600 text-sm">
                If an account exists with that email, you will receive a reset link. Check your inbox.
              </p>
              {resetLink && (
                <p className="text-xs text-slate-500 break-all">
                  Dev: <a href={resetLink} className="text-primary-600 underline">Open reset link</a>
                </p>
              )}
              <Link href="/login" className="btn-primary w-full py-3.5 inline-block text-center">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</div>}
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" placeholder="you@example.com" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">{loading ? 'Sending…' : 'Send reset link'}</button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/login" className="text-primary-600 font-medium hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
