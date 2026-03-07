'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AppHeader({ user, title, subtitle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href={isSuperAdmin ? '/super-admin' : isAdminOrStaff ? '/admin' : '/dashboard'} className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shrink-0">
            <Image src="/appicon.png" alt="Logo" width={36} height={36} className="object-contain" />
          </Link>
          <div>
            <h1 className="text-base font-semibold text-slate-800 leading-tight">
              {title || (isSuperAdmin ? 'Super Admin' : isAdminOrStaff ? 'Admin' : 'Dashboard')}
            </h1>
            {subtitle ? <p className="text-xs text-slate-500 leading-tight">{subtitle}</p> : user?.full_name && <p className="text-xs text-slate-500 leading-tight">{user.full_name}</p>}
          </div>
        </div>
        <div className="relative" ref={ref}>
          <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
            <span className="hidden sm:inline">{user?.full_name || 'Account'}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">{(user?.full_name || 'U').charAt(0).toUpperCase()}</span>
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              <Link href="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setOpen(false)}>Profile</Link>
              <Link href="/" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setOpen(false)}>Home</Link>
              <form action="/api/auth/logout" method="POST" className="block">
                <button type="submit" className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">Log out</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
