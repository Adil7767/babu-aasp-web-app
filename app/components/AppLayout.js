'use client';

import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';

export default function AppLayout({ user, title, subtitle, children, maxWidth = 'max-w-5xl' }) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <AppHeader user={user} title={title} subtitle={subtitle} />
        <main className={`flex-1 mx-auto w-full ${maxWidth} px-4 py-6`}>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
