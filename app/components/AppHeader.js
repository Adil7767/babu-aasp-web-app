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
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md shadow-sm">
      <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <SidebarTrigger className="shrink-0 rounded-xl min-h-[44px] min-w-[44px] sm:min-h-9 sm:min-w-9 -ml-1" />
          <Link href={homeHref || '#'} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-primary/10 ring-1 ring-primary/20 transition hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Image src="/appicon.png" alt="Logo" width={36} height={36} className="object-contain" />
          </Link>
          <div className="min-w-0">
            {loading ? (
              <>
                <Skeleton className="h-4 w-28 mb-1 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </>
            ) : (
              <>
                <h1 className="text-base font-semibold text-foreground leading-tight tracking-tight truncate">
                  {title || (isSuperAdmin ? 'Super Admin' : isAdminOrStaff ? 'Admin' : 'Dashboard')}
                </h1>
                {(subtitle || user?.full_name) && (
                  <p className="text-xs text-muted-foreground leading-tight truncate">{subtitle || user?.full_name}</p>
                )}
              </>
            )}
          </div>
        </div>

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
