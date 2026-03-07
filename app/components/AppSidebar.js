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
    <Sidebar collapsible="offcanvas" className="border-r border-border">
      <SidebarContent className="pt-14">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <SidebarMenuItem key={i}>
                      <Skeleton className="h-8 w-full rounded-md" />
                    </SidebarMenuItem>
                  ))}
                </>
              ) : items.map((item) => {
                const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <SidebarMenuItem
                    key={item.href}
                    className={cn(
                  active &&
                    'rounded-md bg-sidebar-accent [&_a]:bg-transparent [&_a]:font-semibold [&_a]:text-sidebar-accent-foreground border-l-2 border-l-primary'
                )}
                  >
                    <SidebarMenuButton
                      render={
                        <Link href={item.href} className="flex items-center gap-2">
                          {Icon && <Icon className="h-4 w-4 shrink-0" />}
                          <span>{item.label}</span>
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem
            className={cn(
              !loading &&
                pathname === '/profile' &&
                'rounded-md bg-sidebar-accent [&_a]:bg-transparent [&_a]:font-semibold [&_a]:text-sidebar-accent-foreground border-l-2 border-l-primary'
            )}
          >
            {loading ? (
              <Skeleton className="h-8 w-full rounded-md" />
            ) : (
              <SidebarMenuButton
                render={
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4 shrink-0" />
                    <span>Profile</span>
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
