'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  Wallet,
  MessageSquare,
  UserCog,
  BarChart3,
  Settings,
  Building2,
  ChevronRight,
} from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Customers', icon: Users },
  { href: '/admin/packages', label: 'Packages', icon: Package },
  { href: '/admin', label: 'Billing', icon: CreditCard, exact: true },
  { href: '/admin', label: 'Payments', icon: Wallet, exact: true },
  { href: '/admin/complaints', label: 'Complaints', icon: MessageSquare },
  { href: '/admin/users?role=STAFF', label: 'Staff', icon: UserCog },
  { href: '/admin', label: 'Reports', icon: BarChart3, exact: true },
];

const SUPER_ADMIN_NAV = [
  { href: '/super-admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/super-admin#tenants', label: 'Tenants', icon: Building2 },
];

const USER_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/complaints', label: 'Support', icon: MessageSquare },
];

export default function AppSidebar({ user }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setOpenMobile, isMobile } = useSidebar();
  const role = user?.role || 'USER';
  const currentFull = `${(pathname || '').replace(/\/$/, '') || '/'}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
  const items =
    role === 'SUPER_ADMIN'
      ? SUPER_ADMIN_NAV
      : role === 'ADMIN' || role === 'STAFF'
        ? ADMIN_NAV
        : USER_NAV;
  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname, isMobile, setOpenMobile]);

  const homeHref =
    role === 'SUPER_ADMIN'
      ? '/super-admin'
      : role === 'ADMIN' || role === 'STAFF'
        ? '/admin'
        : '/dashboard';

  return (
    <Sidebar
      collapsible="icon"
      side="left"
      className="border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out"
    >
      <SidebarHeader className="flex h-16 min-h-16 shrink-0 flex-row items-center border-b border-sidebar-border px-4 py-0">
        <Link
          href={homeHref}
          className="flex items-center gap-3 outline-none rounded-xl focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar transition-opacity hover:opacity-90"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sidebar-accent ring-1 ring-sidebar-border">
            <Image src="/appicon.png" alt="" width={40} height={40} className="object-contain" />
          </span>
          <span className="truncate text-base font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            NETSCALE
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 min-h-0 overflow-y-auto">
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider group-data-[collapsible=icon]:hidden">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {items.map((item, index) => {
                  const itemHref = item.href;
                  const normalizedPath = (pathname || '').replace(/\/$/, '') || '/';
                  const itemPath = itemHref.split('?')[0];
                  const itemQuery = itemHref.includes('?') ? itemHref.split('?')[1] || '' : '';
                  const currentQuery = searchParams?.toString() || '';
                  const pathMatch = item.exact ? normalizedPath === itemPath : (normalizedPath === itemPath || (itemPath !== '/' && normalizedPath.startsWith(itemPath)));
                  const queryMatch = itemQuery ? currentQuery === itemQuery : currentQuery === '';
                  const wouldMatch = pathMatch && queryMatch;
                  const firstMatchIndex = items.findIndex((i) => {
                    const p = i.href.split('?')[0];
                    const q = i.href.includes('?') ? i.href.split('?')[1] || '' : '';
                    const pathM = i.exact ? normalizedPath === p : (normalizedPath === p || (p !== '/' && normalizedPath.startsWith(p)));
                    const queryM = q ? currentQuery === q : currentQuery === '';
                    return pathM && queryM;
                  });
                  const active = wouldMatch && firstMatchIndex === index;
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem
                      key={`${item.href}-${item.label}`}
                      data-active={active ? 'true' : undefined}
                      className={cn(
                        active &&
                          '!bg-sidebar-accent rounded-xl [&>*]:!bg-transparent [&>*]:font-semibold [&_a]:!bg-transparent [&_a]:font-semibold [&_a]:text-sidebar-accent-foreground'
                      )}
                    >
                      <SidebarMenuButton
                        render={
                          <Link
                            href={item.href}
                            className="flex items-center gap-3 py-2.5 px-3 rounded-xl min-h-[44px] transition-colors hover:bg-sidebar-accent/80"
                            data-active={active ? 'true' : undefined}
                          >
                            {Icon && <Icon className="h-5 w-5 shrink-0" />}
                            <span className="truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
                              {item.label}
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0 ml-auto opacity-50 group-data-[collapsible=icon]:hidden" />
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
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem
            data-active={pathname === '/profile' ? 'true' : undefined}
            className={cn(
              pathname === '/profile' &&
                '!bg-sidebar-accent rounded-xl [&>*]:!bg-transparent [&_a]:!bg-transparent [&_a]:font-semibold [&_a]:text-sidebar-accent-foreground'
            )}
          >
            <SidebarMenuButton
              render={
                <Link
                  href="/profile"
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl min-h-[44px] transition-colors hover:bg-sidebar-accent/80"
                >
                  <Settings className="h-5 w-5 shrink-0" />
                  <span className="truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
                    Settings
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 ml-auto opacity-50 group-data-[collapsible=icon]:hidden" />
                </Link>
              }
              isActive={pathname === '/profile'}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
