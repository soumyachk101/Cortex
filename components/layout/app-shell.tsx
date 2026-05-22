'use client';

import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-alabaster">
      <Sidebar />
      <main className="lg:ml-72 pb-20 lg:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
