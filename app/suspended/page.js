'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SuspendedPage() {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-destructive/5 to-background px-4">
      <div className="card max-w-md w-full text-center shadow-md">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive text-2xl mb-6">⛔</div>
        <h1 className="text-xl font-bold text-foreground">Account suspended</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Your ISP account has been suspended by the platform. Please contact Super Admin for support.
        </p>
        <Link href="/" className="btn-secondary mt-6 inline-block py-2.5 px-4 text-sm">Back to home</Link>
        <button type="button" onClick={handleLogout} disabled={loggingOut} className="block mt-3 text-sm text-primary font-medium hover:underline">
          {loggingOut ? '…' : 'Log out / Sign in with another account'}
        </button>
      </div>
    </div>
  );
}
