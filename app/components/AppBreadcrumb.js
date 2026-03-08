'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const LABELS = {
  users: 'Customers',
  packages: 'Packages',
  complaints: 'Complaints',
  profile: 'Settings',
  dashboard: 'Dashboard',
  'super-admin': 'Super Admin',
  admin: 'Admin',
};

export default function AppBreadcrumb({ user }) {
  const pathname = usePathname();
  if (!pathname) return null;
  const segments = pathname.split('/').filter(Boolean);
  const role = user?.role;
  const homeLabel = role === 'SUPER_ADMIN' ? 'Super Admin' : role === 'ADMIN' || role === 'STAFF' ? 'Admin' : 'Dashboard';
  const homeHref = role === 'SUPER_ADMIN' ? '/super-admin' : role === 'ADMIN' || role === 'STAFF' ? '/admin' : '/dashboard';
  const normalizedPathname = pathname.replace(/\/$/, '') || '/';
  const isHome = normalizedPathname === homeHref;
  const items = isHome
    ? [{ label: homeLabel, href: null }]
    : [{ label: homeLabel, href: homeHref }];
  if (!isHome) {
    const homeSegment = homeHref.replace(/^\//, '').split('/')[0];
    let path = '';
    for (let i = 0; i < segments.length; i++) {
      path += (path ? '/' : '') + segments[i];
      const last = i === segments.length - 1;
      if (i === 0 && segments[0] === homeSegment && segments.length > 1) continue;
      const label = LABELS[segments[i]] || segments[i].charAt(0).toUpperCase() + segments[i].slice(1);
      items.push({ label, href: last ? null : `/${path}` });
    }
  }
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs text-muted-foreground">
        {items.map((item, i) => (
          <BreadcrumbItem key={i}>
            {i > 0 && <BreadcrumbSeparator />}
            {item.href ? (
              <BreadcrumbLink asChild>
                <Link href={item.href} className="hover:text-foreground">{item.label}</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage className="font-medium text-foreground">{item.label}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
