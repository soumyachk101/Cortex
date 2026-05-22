'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useExpenses } from '@/hooks/useExpenses';
import { useTasks } from '@/hooks/useTasks';
import { useNotes } from '@/hooks/useNotes';
import { useReminders } from '@/hooks/useReminders';
import { CATEGORY_COLORS } from '@/constants';
import { CalendarDays, ChevronLeft, ChevronRight, Receipt, CheckSquare, Bell, X } from 'lucide-react';

interface DayEvent {
  type: 'expense' | 'task' | 'reminder';
  title: string;
  amount?: number;
  category?: string;
  color: string;
}

export default function CalendarPage() {
  const [userId, setUserId] = useState<string>();
  const [currency, setCurrency] = useState('₹');
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const router = useRouter();
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now);
  const supabase = createClient();

  const { expenses } = useExpenses(userId);
  const { tasks } = useTasks(userId);
  const { reminders } = useReminders(userId);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
      supabase.from('user_settings').select('currency_symbol').eq('user_id', user.id).single().then(({ data }) => {
        if (data) setCurrency(data.currency_symbol);
      });
    });
  }, []);

  if (!mounted || !userId) return null;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();

  // Build events map
  const eventsMap: Record<number, DayEvent[]> = {};
  expenses.forEach(e => {
    const d = new Date(e.date);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate();
      if (!eventsMap[day]) eventsMap[day] = [];
      eventsMap[day].push({
        type: 'expense',
        title: e.title,
        amount: e.amount,
        category: e.category,
        color: CATEGORY_COLORS[e.category as keyof typeof CATEGORY_COLORS] || '#8C9A84',
      });
    }
  });
  tasks.forEach(t => {
    if (t.due_date) {
      const d = new Date(t.due_date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        if (!eventsMap[day]) eventsMap[day] = [];
        eventsMap[day].push({
          type: 'task',
          title: t.title,
          color: t.is_completed ? '#8C9A84' : '#3B82F6',
        });
      }
    }
  });
  reminders.forEach(r => {
    const d = new Date(r.scheduled_time);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate();
      if (!eventsMap[day]) eventsMap[day] = [];
      eventsMap[day].push({
        type: 'reminder',
        title: r.title,
        color: '#EC4899',
      });
    }
  });

  // Selected date events
  const selectedDayEvents = selectedDate
    ? eventsMap[selectedDate.getDate()] || []
    : [];

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <AppShell>
      <div className="px-4 sm:px-6 md:px-12 lg:px-16 py-8 sm:py-12 md:py-16 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 sm:mb-16">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sage/10 flex items-center justify-center">
              <CalendarDays size={20} strokeWidth={1.5} className="text-sage" />
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-semibold text-forest tracking-tight">
              Calendar
            </h1>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-center gap-6 mb-12">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1))}
            className="w-10 h-10 rounded-full bg-white border border-stone/50 flex items-center justify-center text-text-secondary hover:text-forest hover:border-sage/50 transition-all duration-300 shadow-botanical"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <span className="font-serif text-xl text-forest min-w-[140px] sm:min-w-[200px] text-center">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => !isCurrentMonth && setCurrentMonth(new Date(year, month + 1))}
            disabled={isCurrentMonth}
            className="w-10 h-10 rounded-full bg-white border border-stone/50 flex items-center justify-center text-text-secondary hover:text-forest hover:border-sage/50 transition-all duration-300 shadow-botanical disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 card-botanical p-6 md:p-8">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center text-xs text-mushroom font-medium tracking-wider uppercase py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Day Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for offset */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = isCurrentMonth && day === now.getDate();
                const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month;
                const dayEvents = eventsMap[day] || [];
                const hasExpenses = dayEvents.some(e => e.type === 'expense');
                const hasTasks = dayEvents.some(e => e.type === 'task');
                const hasReminders = dayEvents.some(e => e.type === 'reminder');

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(new Date(year, month, day))}
                    className={`aspect-square rounded-xl p-1.5 flex flex-col items-center justify-start gap-0.5 transition-all duration-300 ${
                      isSelected
                        ? 'bg-sage/15 border border-sage/40'
                        : isToday
                        ? 'bg-forest/5 border border-forest/20'
                        : 'hover:bg-cream border border-transparent'
                    }`}
                  >
                    <span className={`text-sm font-medium ${isToday ? 'text-forest font-bold' : 'text-text-secondary'}`}>
                      {day}
                    </span>
                    {/* Event dots */}
                    <div className="flex gap-0.5">
                      {hasExpenses && <div className="w-1.5 h-1.5 rounded-full bg-terracotta" />}
                      {hasTasks && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                      {hasReminders && <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-stone/30">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <div className="w-2.5 h-2.5 rounded-full bg-terracotta" />
                Expenses
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Tasks
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                Reminders
              </div>
            </div>
          </div>

          {/* Day Detail Panel */}
          <div className="card-botanical p-6 md:p-8">
            {selectedDate ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-xl font-semibold text-forest">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <button onClick={() => setSelectedDate(null)} className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-mushroom hover:text-forest transition-colors">
                    <X size={14} />
                  </button>
                </div>

                {selectedDayEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDayEvents.map((e, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-cream/50 border border-stone/30">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${e.color}15` }}>
                          {e.type === 'expense' && <Receipt size={16} strokeWidth={1.5} style={{ color: e.color }} />}
                          {e.type === 'task' && <CheckSquare size={16} strokeWidth={1.5} style={{ color: e.color }} />}
                          {e.type === 'reminder' && <Bell size={16} strokeWidth={1.5} style={{ color: e.color }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-forest truncate">{e.title}</p>
                          <p className="text-xs text-text-secondary">
                            {e.type === 'expense' && `${e.category} · ${currency}${e.amount?.toFixed(0)}`}
                            {e.type === 'task' && 'Task'}
                            {e.type === 'reminder' && 'Reminder'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalendarDays size={32} strokeWidth={1} className="text-stone mx-auto mb-3" />
                    <p className="text-sm text-text-secondary">No events on this day</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <CalendarDays size={32} strokeWidth={1} className="text-stone mx-auto mb-3" />
                <p className="text-sm text-text-secondary">Select a day to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
