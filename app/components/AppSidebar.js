'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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
    { href: '/super-admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/super-admin#tenants', label: 'Tenants', icon: Building2 },
  ],
  ADMIN: [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/packages', label: 'Packages', icon: Package },
    { href: '/admin/complaints', label: 'Complaints', icon: MessageSquare },
  ],
  STAFF: [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
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
    <Sidebar collapsible="icon" side="left" className="border-r border-border bg-sidebar">
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {loading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <SidebarMenuItem key={i}>
                      <Skeleton className="h-9 w-full rounded-xl" />
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
                          className="flex items-center gap-3"
                          data-active={active ? 'true' : undefined}
                        >
                          {Icon && <Icon className="h-4 w-4 shrink-0" />}
                          <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
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
      <SidebarFooter className="border-t border-border/80">
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem
            data-active={!loading && pathname === '/profile' ? 'true' : undefined}
            className={cn(
              !loading &&
                pathname === '/profile' &&
                '!bg-sidebar-accent rounded-xl border-l-2 border-l-primary [&>*]:!bg-transparent [&_a]:!bg-transparent [&_a]:font-semibold [&_a]:text-sidebar-accent-foreground'
            )}
          >
            {loading ? (
              <Skeleton className="h-9 w-full rounded-xl" />
            ) : (
              <SidebarMenuButton
                render={
                  <Link href="/profile" className="flex items-center gap-3">
                    <User className="h-4 w-4 shrink-0" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Profile</span>
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
