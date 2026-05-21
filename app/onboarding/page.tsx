'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Wallet, CheckSquare, Sparkles, Bell } from 'lucide-react';

const PAGES = [
  { icon: Wallet, gradient: 'gradient-accent', title: 'Track Expenses', desc: 'Log and categorize your spending. See where your money goes with beautiful visual charts.' },
  { icon: CheckSquare, gradient: 'gradient-green', title: 'Manage Tasks', desc: 'Create tasks with priorities and due dates. Stay organized and never miss a deadline.' },
  { icon: Sparkles, gradient: 'gradient-cool', title: 'AI Assistant', desc: 'Use natural language to add expenses, create tasks, and get smart spending insights.' },
  { icon: Bell, gradient: 'gradient-warm', title: 'Stay Notified', desc: 'Set reminders so you never miss important tasks or bills.' },
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
    <div className="min-h-screen flex flex-col bg-bg-light dark:bg-bg-dark">
      <div className="flex justify-end p-4">
        <button onClick={complete} className="btn-ghost text-sm">Skip</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className={`w-32 h-32 ${p.gradient} rounded-full flex items-center justify-center mb-10 shadow-lg`} style={{ boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)' }}>
          <p.icon size={56} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-4">{p.title}</h1>
        <p className="text-text-secondary dark:text-text-secondary-dark text-center max-w-sm leading-relaxed">{p.desc}</p>
      </div>

      <div className="px-8 pb-12">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {PAGES.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === page ? 'w-7 gradient-accent' : 'w-2 bg-border-light dark:bg-border-dark'}`} />
          ))}
        </div>

        {/* Button */}
        <button onClick={() => page < PAGES.length - 1 ? setPage(page + 1) : complete()} className="btn-primary w-full text-lg py-4">
          {page < PAGES.length - 1 ? 'Next' : 'Get Started'}
        </button>
      </div>
    </div>
  );
}
