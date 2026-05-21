'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Wallet, CheckSquare, Sparkles, Bell } from 'lucide-react';

const PAGES = [
  {
    icon: Wallet,
    gradient: 'from-sage/80 to-forest/90',
    title: 'Track Expenses',
    description: 'Log and categorize your spending. See where your money goes with beautiful visual charts.',
  },
  {
    icon: CheckSquare,
    gradient: 'from-terracotta/60 to-clay',
    title: 'Manage Tasks',
    description: 'Create tasks with priorities and due dates. Stay organized and never miss a deadline.',
  },
  {
    icon: Sparkles,
    gradient: 'from-sage/60 to-sage',
    title: 'AI Assistant',
    description: 'Use natural language to add expenses, create tasks, and get smart spending insights.',
  },
  {
    icon: Bell,
    gradient: 'from-terracotta to-terracotta/70',
    title: 'Stay Notified',
    description: 'Set reminders so you never miss important tasks or bills.',
  },
];

export default function OnboardingPage() {
  const [page, setPage] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  async function complete() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_settings').upsert({ user_id: user.id, onboarding_done: true });
    }
    router.push('/');
  }

  const p = PAGES[page];

  return (
    <div className="min-h-screen flex flex-col bg-alabaster">
      {/* Skip */}
      <div className="flex justify-end p-6">
        <button
          onClick={complete}
          className="text-sm text-mushroom hover:text-forest transition-colors duration-300 tracking-wider uppercase"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 max-w-lg mx-auto w-full">
        {/* Icon */}
        <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${p.gradient} flex items-center justify-center mb-12 shadow-botanical-lg animate-fade-in`}>
          <p.icon size={56} className="text-white" strokeWidth={1.5} />
        </div>

        {/* Text */}
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-forest text-center mb-4 animate-fade-up">
          {p.title}
        </h1>
        <p className="text-text-secondary text-center text-lg leading-relaxed max-w-sm animate-fade-up" style={{ animationDelay: '100ms' }}>
          {p.description}
        </p>
      </div>

      {/* Bottom */}
      <div className="px-8 pb-12 max-w-lg mx-auto w-full">
        {/* Dots */}
        <div className="flex justify-center gap-3 mb-10">
          {PAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`h-2 rounded-full transition-all duration-500 ease-out ${
                i === page
                  ? 'w-8 bg-sage'
                  : 'w-2 bg-stone hover:bg-mushroom'
              }`}
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={() => page < PAGES.length - 1 ? setPage(page + 1) : complete()}
          className="btn-botanical w-full text-base py-4"
        >
          {page < PAGES.length - 1 ? 'Next' : 'Get Started'}
        </button>
      </div>
    </div>
  );
}
