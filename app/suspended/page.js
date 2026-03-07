'use client';

import Link from 'next/link';

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-rose-50/30 to-slate-100 px-4">
      <div className="card max-w-md w-full text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 text-2xl mb-6">⛔</div>
        <h1 className="text-xl font-bold text-slate-800">Account suspended</h1>
        <p className="text-slate-600 mt-2 text-sm">
          Your ISP account has been suspended by the platform. Please contact Super Admin for support.
        </p>
        <Link href="/" className="btn-secondary mt-6 inline-block py-2.5 px-4 text-sm">Back to home</Link>
        <Link href="/login" className="block mt-3 text-sm text-primary-600 font-medium hover:underline">Sign in with another account</Link>
      </div>
    </div>
  );
}
