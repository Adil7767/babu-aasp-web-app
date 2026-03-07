'use client';

import { SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';

export default function AppLayout({ user, title, subtitle, children, maxWidth = 'max-w-5xl' }) {
  return (
    <>
      <AppSidebar user={user} />
      <SidebarInset className="min-w-0 flex flex-col border-l border-border bg-surface">
        <AppHeader user={user} title={title} subtitle={subtitle} />
        <main className={`flex-1 mx-auto w-full ${maxWidth} px-4 sm:px-6 py-6 sm:py-8`}>
          {children}
        </main>
      </SidebarInset>
    </>
  );
}
