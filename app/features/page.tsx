import Link from 'next/link';
import { Leaf, ArrowLeft, Wallet, CheckSquare, Bot, StickyNote, Bell, BarChart3, CalendarDays, Timer, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: Wallet, title: 'Expense Tracking', description: 'Log expenses by category with smart tagging. Visual breakdowns and monthly trends show exactly where your money goes. Export to CSV anytime.', color: '#EF4444' },
  { icon: CheckSquare, title: 'Task Management', description: 'Priority-based tasks with due dates, completion tracking, and archive support. Never miss a deadline with smart organization.', color: '#3B82F6' },
  { icon: Bot, title: 'AI Assistant', description: 'Ask in natural language. Cortex uses tool calling to add expenses, create tasks, query data, and give insights. Supports both Gemini and Groq.', color: '#8C9A84' },
  { icon: StickyNote, title: 'Smart Notes', description: 'Quick capture ideas, meeting notes, and reminders. Full CRUD operations with real-time sync across devices.', color: '#F59E0B' },
  { icon: Bell, title: 'Reminders', description: 'Schedule reminders with repeat modes — daily, weekly, or once. Stay on top of bills, meetings, and goals.', color: '#EC4899' },
  { icon: BarChart3, title: 'Analytics', description: 'Deep spending insights with category breakdowns, budget tracking, daily spending charts, and month-over-month comparisons.', color: '#8B5CF6' },
  { icon: CalendarDays, title: 'Calendar View', description: 'Monthly calendar showing expenses, tasks, and reminders on each date. Click any day to see details.', color: '#06B6D4' },
  { icon: Timer, title: 'Focus Timer', description: 'Pomodoro-style focus timer with 25/5/15 minute cycles. Track sessions and link to tasks for focused work.', color: '#F97316' },
  { icon: Sparkles, title: 'Context Memory', description: 'AI remembers your conversation history. Persistent chat sessions stored securely so you can continue where you left off.', color: '#10B981' },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-alabaster">
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-forest transition-colors mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Leaf size={16} className="text-sage" />
            <span className="text-xs text-sage font-medium tracking-[0.2em] uppercase">Features</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-forest tracking-tight mb-4">
            Everything Cortex Offers
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto">
            A complete personal finance and productivity platform powered by AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="card-botanical p-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${f.color}12` }}>
                <f.icon size={22} strokeWidth={1.5} style={{ color: f.color }} />
              </div>
              <h3 className="font-serif text-lg font-semibold text-forest mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link href="/signup" className="btn-botanical">Get Started Free</Link>
        </div>
      </div>
    </div>
  );
}
