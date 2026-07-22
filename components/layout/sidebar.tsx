'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  BarChart3,
  CalendarDays,
  StickyNote,
  Bot,
  Timer,
  Settings,
  LogOut,
  Leaf,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: Wallet },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/notes', label: 'Notes', icon: StickyNote },
  { href: '/agent', label: 'Agent', icon: Bot },
  { href: '/focus', label: 'Focus', icon: Timer },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  async function handleSignOut() {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/signin';
  }

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 bg-white border-r border-stone/50">
      {/* Logo */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
          <Leaf size={20} className="text-sage" strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-forest">
          Cortex
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ease-out group ${
                isActive
                  ? 'bg-sage/10 text-forest font-medium'
                  : 'text-text-secondary hover:bg-cream hover:text-forest'
              }`}
            >
              <item.icon
                size={20}
                strokeWidth={1.5}
                className={`transition-colors duration-300 ${
                  isActive ? 'text-sage' : 'text-mushroom group-hover:text-sage'
                }`}
              />
              <span className="tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Decorative vine */}
      <div className="px-8">
        <div className="vine-line mx-auto" />
      </div>

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={handleSignOut}
          type="button"
          className="flex items-center gap-4 px-5 py-3.5 rounded-2xl w-full text-text-secondary hover:bg-cream hover:text-forest transition-all duration-300 group"
        >
          <LogOut size={20} strokeWidth={1.5} className="text-mushroom group-hover:text-terracotta transition-colors duration-300" />
          <span className="tracking-wide">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
