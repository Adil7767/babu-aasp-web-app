'use client';

import { SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';

const HEADER_HEIGHT = '4rem';

export default function AppLayout({ user, title, subtitle, children, maxWidth = 'max-w-5xl' }) {
  return (
    <div className="flex flex-1 flex-col min-h-svh w-full" style={{ ['--header-height']: HEADER_HEIGHT }}>
      {/* Full-width header above sidebar and content so nothing hides under the sidebar */}
      <AppHeader user={user} title={title} subtitle={subtitle} className="shrink-0 border-b border-border bg-card/95 backdrop-blur-md shadow-sm" />
      <div className="flex flex-1 min-h-0 w-full">
        <AppSidebar user={user} />
        <SidebarInset className="min-w-0 flex flex-col border-l border-border bg-surface">
          <main className={`flex-1 mx-auto w-full ${maxWidth} px-4 sm:px-6 py-6 sm:py-8 flex flex-col`}>
            {children}
          </main>
        </SidebarInset>
      </div>
    </div>
  );
}
