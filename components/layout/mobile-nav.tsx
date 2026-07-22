'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  StickyNote,
  Bot,
  Menu,
  X,
  BarChart3,
  CalendarDays,
  Timer,
  Settings,
  LogOut,
} from 'lucide-react';

const MAIN_NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: Wallet },
  { href: '/notes', label: 'Notes', icon: StickyNote },
  { href: '/agent', label: 'Agent', icon: Bot },
];

const MORE_NAV_ITEMS = [
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/focus', label: 'Focus', icon: Timer },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone/50 z-50 safe-area-bottom">
        <div className="flex justify-around items-center h-18 px-2">
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 ${
                  isActive ? 'text-sage scale-105' : 'text-mushroom hover:text-forest'
                }`}
              >
                <item.icon size={20} strokeWidth={1.5} />
                <span className="text-[10px] font-medium tracking-wider uppercase">{item.label}</span>
              </Link>
            );
          })}
          
          {/* More button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 ${
              isOpen ? 'text-sage scale-105' : 'text-mushroom hover:text-forest'
            }`}
          >
            {isOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            <span className="text-[10px] font-medium tracking-wider uppercase">More</span>
          </button>
        </div>
      </nav>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-forest/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sliding Drawer Menu */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] border-t border-stone/50 p-6 pb-12 z-50 transition-all duration-300 ease-out shadow-botanical-xl ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Drag handle decoration */}
        <div className="w-12 h-1 bg-stone/70 rounded-full mx-auto mb-6" />

        {/* Header of Drawer */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-xl font-semibold text-forest">More Features</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full bg-cream text-mushroom hover:text-forest hover:bg-stone/30 transition-colors duration-300"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        
        {/* Grid of more items */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {MORE_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? 'bg-sage/10 border-sage/30 text-forest font-medium shadow-botanical'
                    : 'bg-cream/40 border-transparent text-text-secondary hover:bg-cream hover:text-forest'
                }`}
              >
                <item.icon
                  size={20}
                  strokeWidth={1.5}
                  className={isActive ? 'text-sage' : 'text-mushroom'}
                />
                <span className="text-sm font-medium tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Separator line */}
        <div className="border-t border-stone/30 my-4" />

        {/* Sign Out Button */}
        <button
          onClick={async () => {
            setIsOpen(false);
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = '/signin';
          }}
          type="button"
          className="flex items-center justify-center gap-3.5 p-4 rounded-2xl w-full text-mushroom hover:bg-cream hover:text-terracotta transition-all duration-300 border border-transparent hover:border-stone/50"
        >
          <LogOut size={20} strokeWidth={1.5} className="transition-colors duration-300" />
          <span className="text-sm font-medium tracking-wide">Sign Out</span>
        </button>
      </div>
    </>
  );
}
