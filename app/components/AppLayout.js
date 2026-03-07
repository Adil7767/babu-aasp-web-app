'use client';

import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';

export default function AppLayout({ user, title, subtitle, children, maxWidth = 'max-w-5xl' }) {
  return (
    <div className="min-h-screen flex bg-surface">
      <AppSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader user={user} title={title} subtitle={subtitle} />
        <main className={`flex-1 mx-auto w-full ${maxWidth} px-4 py-6`}>
          {children}
        </main>
      </div>
    </div>
  );
}
