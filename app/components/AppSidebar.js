'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Building2, Users, Package, MessageSquare, User } from 'lucide-react';

const navByRole = {
  SUPER_ADMIN: [
    { href: '/super-admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/super-admin#tenants', label: 'Tenants', icon: Building2 },
  ],
  ADMIN: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'User management', icon: Users },
    { href: '/admin/packages', label: 'Packages', icon: Package },
    { href: '/admin/complaints', label: 'Complaints', icon: MessageSquare },
  ],
  STAFF: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'User management', icon: Users },
    { href: '/admin/packages', label: 'Packages', icon: Package },
    { href: '/admin/complaints', label: 'Complaints', icon: MessageSquare },
  ],
  USER: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/complaints', label: 'Complaints', icon: MessageSquare },
  ],
};

export default function AppSidebar({ user }) {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  const role = user?.role || 'USER';
  const items = navByRole[role] || navByRole.USER;
  const loading = !user;

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname, isMobile, setOpenMobile]);

  return (
    <Sidebar collapsible="icon" side="left" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="shrink-0 border-b border-sidebar-border/80 px-4 py-4">
        <Link
          href={role === 'SUPER_ADMIN' ? '/super-admin' : role === 'ADMIN' || role === 'STAFF' ? '/admin' : '/dashboard'}
          className="flex items-center gap-3 outline-none rounded-xl focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sidebar-accent ring-1 ring-sidebar-border">
            <Image src="/appicon.png" alt="" width={40} height={40} className="object-contain" />
          </span>
          <span className="truncate text-base font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            NETSCALE
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 min-h-0">
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {loading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <SidebarMenuItem key={i}>
                      <Skeleton className="h-11 w-full rounded-xl" />
                    </SidebarMenuItem>
                  ))}
                </>
              ) : items.map((item) => {
                const normalizedPath = (pathname || '').replace(/\/$/, '') || '/';
                const exactOnly = ['/admin', '/dashboard', '/super-admin'].includes(item.href);
                const active =
                  normalizedPath === item.href ||
                  (!exactOnly && (normalizedPath.startsWith(item.href + '/') || normalizedPath === item.href));
                const Icon = item.icon;
                return (
                  <SidebarMenuItem
                    key={item.href}
                    data-active={active ? 'true' : undefined}
                    className={cn(
                      active &&
                        '!bg-sidebar-accent rounded-xl border-l-2 border-l-primary [&>*]:!bg-transparent [&>*]:font-semibold [&_a]:!bg-transparent [&_a]:font-semibold [&_a]:text-sidebar-accent-foreground'
                    )}
                  >
                    <SidebarMenuButton
                      render={
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 py-2.5 px-3 rounded-xl min-h-[44px]"
                          data-active={active ? 'true' : undefined}
                        >
                          {Icon && <Icon className="h-5 w-5 shrink-0" />}
                          <span className="truncate text-sm font-medium group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </Link>
                      }
                      isActive={active}
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/80 px-3 py-4">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem
            data-active={!loading && pathname === '/profile' ? 'true' : undefined}
            className={cn(
              !loading &&
                pathname === '/profile' &&
                '!bg-sidebar-accent rounded-xl border-l-2 border-l-primary [&>*]:!bg-transparent [&_a]:!bg-transparent [&_a]:font-semibold [&_a]:text-sidebar-accent-foreground'
            )}
          >
            {loading ? (
              <Skeleton className="h-11 w-full rounded-xl" />
            ) : (
              <SidebarMenuButton
                render={
                  <Link href="/profile" className="flex items-center gap-3 py-2.5 px-3 rounded-xl min-h-[44px]">
                    <User className="h-5 w-5 shrink-0" />
                    <span className="truncate text-sm font-medium group-data-[collapsible=icon]:hidden">Profile</span>
                  </Link>
                }
                isActive={pathname === '/profile'}
              />
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
