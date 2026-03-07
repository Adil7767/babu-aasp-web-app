'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    router.push('/login');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center text-center gap-3">
            <Skeleton className="h-20 w-20 rounded-2xl" />
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100 px-4">
        <div className="card max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <Image src="/appicon.png" alt="NETSCALE" width={96} height={96} priority className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">NETSCALE</h1>
          <p className="text-slate-500 mt-2 mb-8">ISP Management SaaS · Manage your connection in one place.</p>
          <Link href="/login" className="btn-primary inline-block w-full py-3.5 text-center">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isStaffOrAdmin = user.role === 'ADMIN' || user.role === 'STAFF';

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/appicon.png" alt="" width={40} height={40} className="rounded-xl object-contain" />
            <div>
              <h1 className="text-lg font-semibold text-slate-800">{isSuperAdmin ? 'Platform' : 'NETSCALE'}</h1>
              <p className="text-xs text-slate-500">{user.full_name} · {user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="btn-secondary py-2 px-4 text-sm">
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href={isSuperAdmin ? '/super-admin' : isStaffOrAdmin ? '/admin' : '/dashboard'}
            className="card group block transition hover:shadow-soft hover:border-primary-200"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 group-hover:bg-primary-200 transition">
                <span className="text-xl">{isSuperAdmin ? '⚙️' : isStaffOrAdmin ? '📊' : '📶'}</span>
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 group-hover:text-primary-600 transition">
                  {isSuperAdmin ? 'Super Admin' : isStaffOrAdmin ? 'Admin dashboard' : 'My dashboard'}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {isSuperAdmin ? 'Tenants, platform stats & plans' : isStaffOrAdmin ? 'View stats, users & complaints' : 'Packages, bills & usage'}
                </p>
              </div>
            </div>
          </Link>
          {isStaffOrAdmin && !isSuperAdmin && (
            <Link href="/admin/complaints" className="card group block transition hover:shadow-soft hover:border-primary-200">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 group-hover:bg-amber-200 transition">
                  <span className="text-xl">🎫</span>
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800 group-hover:text-primary-600 transition">Complaints</h2>
                  <p className="text-sm text-slate-500 mt-0.5">View and manage support tickets</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
