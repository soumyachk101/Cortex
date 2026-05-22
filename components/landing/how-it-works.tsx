'use client';

import { UserPlus, Database, Sparkles } from 'lucide-react';

const STEPS = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Sign Up in Seconds',
    description: 'Create a free account with email or Google. No credit card, no friction.',
  },
  {
    icon: Database,
    step: '02',
    title: 'Add Your Data',
    description: 'Log expenses, create tasks, write notes. Or let the AI add data for you.',
  },
  {
    icon: Sparkles,
    step: '03',
    title: 'Let AI Manage It',
    description: 'Ask questions, get summaries, receive insights. Cortex understands your data.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-16 sm:py-24 md:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-forest" />
      <div className="absolute inset-0 bg-gradient-to-br from-forest via-[#1a2a1f] to-forest" />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 md:px-12">
        <div className="text-center mb-12 sm:mb-20">
          <p className="text-[10px] sm:text-xs text-sage font-medium tracking-[0.15em] sm:tracking-[0.25em] uppercase mb-4 sm:mb-5">How It Works</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold text-white tracking-tight mb-4 sm:mb-5 px-2">
            Three steps to
            <br />
            <span className="bg-gradient-to-r from-sage to-clay bg-clip-text text-transparent">financial clarity</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 md:gap-16">
          {STEPS.map((s, i) => (
            <div key={s.step} className="relative text-center">
              {i < STEPS.length - 1 && (
                <div className="hidden sm:block absolute top-10 left-[60%] w-[calc(100%-20%)] h-px bg-gradient-to-r from-white/10 to-transparent" />
              )}

              <div className="relative inline-flex items-center justify-center mb-6 sm:mb-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center backdrop-blur-sm">
                  <s.icon size={24} strokeWidth={1.5} className="text-sage" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sage text-white text-xs font-bold flex items-center justify-center shadow-botanical">
                  {s.step}
                </span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">{s.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed max-w-xs mx-auto">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
