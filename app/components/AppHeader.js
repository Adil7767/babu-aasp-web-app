'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Home, LogOut, ChevronDown } from 'lucide-react';

export default function AppHeader({ user, title, subtitle }) {
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';
  const homeHref = isSuperAdmin ? '/super-admin' : isAdminOrStaff ? '/admin' : '/dashboard';
  const avatarUrl = user?.avatar_url;
  const initial = (user?.full_name || 'U').charAt(0).toUpperCase();
  const loading = !user;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1 rounded-xl min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0" />
          <Link href={homeHref || '#'} className="flex h-9 w-9 min-h-[44px] min-w-[44px] sm:min-h-9 sm:min-w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-muted/50 ring-1 ring-border/80 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20">
            <Image src="/appicon.png" alt="Logo" width={36} height={36} className="object-contain" />
          </Link>
          <div>
            {loading ? (
              <>
                <Skeleton className="h-4 w-28 mb-1 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </>
            ) : (
              <>
                <h1 className="text-base font-semibold text-foreground leading-tight tracking-tight">
                  {title || (isSuperAdmin ? 'Super Admin' : isAdminOrStaff ? 'Admin' : 'Dashboard')}
                </h1>
                {subtitle ? (
                  <p className="text-xs text-muted-foreground leading-tight">{subtitle}</p>
                ) : (
                  user?.full_name && <p className="text-xs text-muted-foreground leading-tight">{user.full_name}</p>
                )}
              </>
            )}
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
        ) : (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-foreground hover:bg-muted/80 hover:text-foreground rounded-xl pl-1 pr-2.5 py-1.5 border-0 bg-transparent cursor-pointer font-medium text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-2 transition-colors">
            {avatarUrl ? (
              <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-border">
                <Image src={avatarUrl} alt="" width={36} height={36} className="object-cover" unoptimized />
              </span>
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-semibold shrink-0">
                {initial}
              </span>
            )}
            <span className="hidden sm:inline font-medium max-w-[120px] truncate">{user?.full_name || 'Account'}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-border/80">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium truncate">{user?.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Account</DropdownMenuLabel>
            <DropdownMenuItem className="cursor-pointer">
              <Link href="/profile" className="flex w-full items-center gap-2 outline-none [.group:hover_&]:no-underline">
                <User className="h-4 w-4 shrink-0" />
                Profile & picture
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Link href="/" className="flex w-full items-center gap-2 outline-none [.group:hover_&]:no-underline">
                <Home className="h-4 w-4 shrink-0" />
                Home
              </Link>
            </DropdownMenuItem>
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
    </header>
  );
}
