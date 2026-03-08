'use client';

import { useSidebar } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import AppBreadcrumb from './AppBreadcrumb';

const SIDEBAR_WIDTH_EXPANDED = '220px';
const SIDEBAR_WIDTH_COLLAPSED = '80px';
const HEADER_HEIGHT = '64px';

export default function AppLayout({
  user,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-6xl',
  contentClassName,
}) {
  const { state } = useSidebar();
  const sidebarWidth = state === 'collapsed' ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <div
      className="grid min-h-screen w-full grid-cols-[0_1fr] gap-0 bg-surface transition-[grid-template-columns] duration-300 ease-out md:grid-cols-[var(--layout-sidebar-width)_1fr]"
      style={{
        ['--layout-sidebar-width']: sidebarWidth,
        ['--header-height']: '0px',
      }}
    >
      {/* Column 1: Sidebar – 0 width on mobile so drawer mounts but takes no space; full width on md+ */}
      <aside className="relative min-w-0 overflow-visible" style={{ gridRow: '1 / -1' }}>
        <AppSidebar user={user} />
      </aside>

      {/* Column 2: Header + Breadcrumb + Content */}
      <div className="flex min-h-0 min-w-0 flex-col bg-surface">
        {/* Header: 64px, sticky */}
        <header
          className="sticky top-0 z-30 shrink-0 w-full border-b border-border bg-card/95 backdrop-blur-md shadow-sm"
          style={{ height: HEADER_HEIGHT }}
        >
          <AppHeader user={user} title={title} subtitle={subtitle} className="h-full w-full" />
        </header>

        {/* Main content: flex-1, padding 24px */}
        <main className={`flex-1 min-h-0 overflow-auto px-4`}>

          {children}
        </main>
      </div>
    </div>
  );
}
