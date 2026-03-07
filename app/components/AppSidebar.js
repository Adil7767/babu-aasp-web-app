'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navByRole = {
  SUPER_ADMIN: [
    { href: '/super-admin', label: 'Overview' },
    { href: '/super-admin#tenants', label: 'Tenants' },
  ],
  ADMIN: [
    { href: '/admin', label: 'Overview' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/packages', label: 'Packages' },
    { href: '/admin/complaints', label: 'Complaints' },
  ],
  STAFF: [
    { href: '/admin', label: 'Overview' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/packages', label: 'Packages' },
    { href: '/admin/complaints', label: 'Complaints' },
  ],
  USER: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/complaints', label: 'Complaints' },
  ],
};

export default function AppSidebar({ user }) {
  const pathname = usePathname();
  const role = user?.role || 'USER';
  const items = navByRole[role] || navByRole.USER;

  return (
    <aside className="w-56 shrink-0 border-r border-slate-200/80 bg-white/95 backdrop-blur-sm flex flex-col">
      <nav className="p-3 space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={"flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition " + (active ? 'bg-primary-100 text-primary-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800')}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-3 border-t border-slate-100">
        <Link
          href="/profile"
          className={"flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium " + (pathname === '/profile' ? 'bg-primary-100 text-primary-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800')}
        >
          Profile
        </Link>
      </div>
    </aside>
  );
}
