'use client';

import {
  Wallet,
  CheckSquare,
  Bot,
  StickyNote,
  Bell,
  BarChart3,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Wallet,
    title: 'Expense Tracking',
    description: 'Log expenses by category with smart tagging. Visual breakdowns and monthly trends.',
    gradient: 'from-red-500/20 via-orange-500/10 to-transparent',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-500',
    borderColor: 'group-hover:border-red-500/20',
  },
  {
    icon: CheckSquare,
    title: 'Task Management',
    description: 'Priority-based tasks with due dates and completion tracking. Never miss a deadline.',
    gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    borderColor: 'group-hover:border-blue-500/20',
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    description: 'Natural language commands. Cortex uses tool calling with Gemini and Groq.',
    gradient: 'from-sage/20 via-emerald-500/10 to-transparent',
    iconBg: 'bg-sage/10',
    iconColor: 'text-sage',
    borderColor: 'group-hover:border-sage/20',
  },
  {
    icon: StickyNote,
    title: 'Smart Notes',
    description: 'Quick capture ideas, meeting notes, and reminders. Always accessible.',
    gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    borderColor: 'group-hover:border-amber-500/20',
  },
  {
    icon: Bell,
    title: 'Reminders',
    description: 'Schedule with repeat modes — daily, weekly, or once. Stay on top of goals.',
    gradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-500',
    borderColor: 'group-hover:border-pink-500/20',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Deep spending insights with category breakdowns and budget tracking.',
    gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-500',
    borderColor: 'group-hover:border-violet-500/20',
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 sm:py-24 md:py-36 relative bg-alabaster overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[1000px] h-[400px] md:h-[600px] rounded-full bg-sage/[0.02] blur-[80px] md:blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-20 md:mb-28">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-sage/10 border border-sage/20 mb-4 sm:mb-6">
            <span className="text-[10px] sm:text-xs text-sage font-medium tracking-[0.15em] sm:tracking-[0.2em] uppercase">Platform</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-forest tracking-tight mb-4 sm:mb-6 px-2">
            Everything you need,
            <br />
            <span className="bg-gradient-to-r from-sage via-emerald-600 to-terracotta bg-clip-text text-transparent">nothing you don&apos;t</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto leading-relaxed text-base sm:text-lg px-2">
            Six powerful tools working together. Track expenses, manage tasks,
            capture notes — all enhanced by AI.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`group relative bg-white rounded-2xl border border-stone/40 p-5 sm:p-7 md:p-8 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-botanical-lg overflow-hidden ${f.borderColor}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              <div className="absolute top-0 left-6 sm:left-8 right-6 sm:right-8 h-px bg-gradient-to-r from-transparent via-stone/30 to-transparent group-hover:via-sage/20 transition-all duration-500" />

              <div className="relative">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${f.iconBg} flex items-center justify-center mb-4 sm:mb-5 transition-transform duration-500 group-hover:scale-105`}>
                  <f.icon size={20} strokeWidth={1.5} className={f.iconColor} />
                </div>
                <h3 className="font-serif text-base sm:text-lg font-semibold text-forest mb-2 sm:mb-2.5">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
