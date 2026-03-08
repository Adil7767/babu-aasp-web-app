'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import { User, Home, LogOut, ChevronDown, Search, Bell } from 'lucide-react';

function useBreadcrumb(pathname, user) {
  if (!pathname) return [];
  const segments = pathname.split('/').filter(Boolean);
  const role = user?.role;
  const homeLabel = role === 'SUPER_ADMIN' ? 'Super Admin' : role === 'ADMIN' || role === 'STAFF' ? 'Admin' : 'Dashboard';
  const homeHref = role === 'SUPER_ADMIN' ? '/super-admin' : role === 'ADMIN' || role === 'STAFF' ? '/admin' : '/dashboard';
  const items = [{ label: homeLabel, href: homeHref }];
  const labels = {
    users: 'Customers',
    packages: 'Packages',
    complaints: 'Complaints',
    profile: 'Settings',
    dashboard: 'Dashboard',
    'super-admin': 'Super Admin',
    admin: 'Admin',
  };
  let href = '';
  for (let i = 0; i < segments.length; i++) {
    href += (href ? '/' : '') + segments[i];
    const last = i === segments.length - 1;
    const label = labels[segments[i]] || segments[i].charAt(0).toUpperCase() + segments[i].slice(1);
    items.push({ label, href: last ? null : href });
  }
  return items;
}

export default function AppHeader({ user, title, subtitle, breadcrumbItems, className }) {
  const pathname = usePathname();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';
  const homeHref = isSuperAdmin ? '/super-admin' : isAdminOrStaff ? '/admin' : '/dashboard';
  const avatarUrl = user?.avatar_url;
  const initial = (user?.full_name || 'U').charAt(0).toUpperCase();
  const loading = !user;
  const breadcrumb = breadcrumbItems ?? useBreadcrumb(pathname, user);

  return (
    <header className={cn('h-16 shrink-0 z-30 w-full flex items-center', className)}>
      <div className="flex h-14 sm:h-16 items-center gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2 shrink-0">
          <SidebarTrigger className="rounded-xl min-h-[44px] min-w-[44px] sm:min-h-9 sm:min-w-9 -ml-1" />
        </div>

        {/* Search - visible on md+ */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 h-9 rounded-xl bg-muted/60 border-border/80 text-sm placeholder:text-muted-foreground focus-visible:ring-2"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 flex items-center justify-end gap-1 sm:gap-2">
          {/* Notifications */}
          {!loading && (
            <button
              type="button"
              className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-card" aria-hidden />
            </button>
          )}

          {/* Breadcrumb - visible when no search or on small screens */}
          <div className="hidden lg:flex items-center min-w-0">
            <Breadcrumb>
              <BreadcrumbList className="text-xs">
                {breadcrumb.map((item, i) => (
                  <BreadcrumbItem key={i}>
                    {i > 0 && <BreadcrumbSeparator />}
                    {item.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="font-medium text-foreground truncate max-w-[120px]">
                        {item.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Profile dropdown */}
          {loading ? (
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 text-foreground hover:bg-muted/80 rounded-xl pl-2 pr-3 py-2 border-0 bg-transparent cursor-pointer font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors shrink-0">
                {avatarUrl ? (
                  <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-border">
                    <Image src={avatarUrl} alt="" width={40} height={40} className="object-cover" unoptimized />
                  </span>
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-semibold shrink-0 ring-2 ring-border/50">
                    {initial}
                  </span>
                )}
                <span className="hidden sm:inline font-medium max-w-[140px] truncate">{user?.full_name || 'Account'}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl border border-border">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium truncate">{user?.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Account</DropdownMenuLabel>
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href="/profile" className="flex w-full items-center gap-2 outline-none [.group:hover_&]:no-underline">
                      <User className="h-4 w-4 shrink-0" />
                      Profile & picture
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href={homeHref} className="flex w-full items-center gap-2 outline-none [.group:hover_&]:no-underline">
                      <Home className="h-4 w-4 shrink-0" />
                      Home
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer font-medium"
                  onClick={() => document.getElementById('header-logout-form')?.requestSubmit()}
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
              <form id="header-logout-form" action="/api/auth/logout" method="POST" className="hidden" />
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
