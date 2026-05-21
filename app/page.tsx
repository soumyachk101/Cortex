'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useExpenses } from '@/hooks/useExpenses';
import { useTasks } from '@/hooks/useTasks';
import { useNotes } from '@/hooks/useNotes';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES } from '@/constants';
import { StickyNote, Receipt, CheckSquare, TrendingUp, Sun, Moon, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';

export default function DashboardPage() {
  const [userId, setUserId] = useState<string>();
  const [currency, setCurrency] = useState('₹');
  const [budget, setBudget] = useState(0);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now);
  const supabase = createClient();

  const { expenses, getExpensesForMonth, getTotalForMonth, getByCategory } = useExpenses(userId);
  const { activeTasks } = useTasks(userId);
  const { notes } = useNotes(userId);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
      supabase.from('user_settings').select('currency_symbol, budget_limit').eq('user_id', user.id).single().then(({ data }) => {
        if (data) { setCurrency(data.currency_symbol); setBudget(data.budget_limit); }
      });
    });
  }, []);

  if (!mounted || !userId) return null;

  const monthlyExpenses = getExpensesForMonth(selectedMonth);
  const totalSpent = getTotalForMonth(selectedMonth);
  const byCategory = getByCategory(selectedMonth);
  const isCurrentMonth = selectedMonth.getMonth() === now.getMonth() && selectedMonth.getFullYear() === now.getFullYear();

  const chartData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  const activeCount = activeTasks.filter(t => !t.is_completed).length;

  const stats = [
    { icon: Receipt, label: 'Transactions', value: monthlyExpenses.length },
    { icon: CheckSquare, label: 'Active Tasks', value: activeCount },
    { icon: StickyNote, label: 'Notes', value: notes.length },
  ];

  return (
    <AppShell>
      <div className="px-6 md:px-12 lg:px-16 py-12 md:py-16 max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center">
              <Leaf size={22} strokeWidth={1.5} className="text-sage" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-forest tracking-tight">
              Dashboard
            </h1>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-11 h-11 rounded-full bg-cream border border-stone/50 flex items-center justify-center text-mushroom hover:text-forest hover:border-sage/50 transition-all duration-300"
          >
            {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
          </button>
        </div>

        {/* ── Month Selector ── */}
        <div className="flex items-center justify-center gap-6 mb-12">
          <button
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
            className="w-10 h-10 rounded-full bg-white border border-stone/50 flex items-center justify-center text-text-secondary hover:text-forest hover:border-sage/50 transition-all duration-300 shadow-botanical"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <span className="font-serif text-xl text-forest min-w-[200px] text-center">
            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => !isCurrentMonth && setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
            disabled={isCurrentMonth}
            className="w-10 h-10 rounded-full bg-white border border-stone/50 flex items-center justify-center text-text-secondary hover:text-forest hover:border-sage/50 transition-all duration-300 shadow-botanical disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* ── Balance Card ── */}
        <div className="gradient-botanical rounded-card p-8 md:p-10 text-white mb-12 shadow-botanical-xl relative overflow-hidden">
          {/* Decorative circle */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

          <p className="text-white/70 text-sm tracking-widest uppercase font-medium">Total Spent</p>
          <p className="font-serif text-5xl md:text-6xl font-bold mt-3 tracking-tight">
            {currency}{totalSpent.toFixed(0)}
          </p>
          {budget > 0 && (
            <div className="mt-8 max-w-xs">
              <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/80 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min((totalSpent / budget) * 100, 100)}%` }}
                />
              </div>
              <p className="text-white/50 text-xs mt-2 tracking-wider">
                {currency}{budget.toFixed(0)} budget
              </p>
            </div>
          )}
        </div>

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-3 gap-4 md:gap-6 mb-12">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`card-botanical-flat p-6 text-center ${i % 2 === 1 ? 'md:translate-y-3' : ''}`}
            >
              <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
                <s.icon size={20} strokeWidth={1.5} className="text-sage" />
              </div>
              <p className="font-serif text-3xl font-semibold text-forest">{s.value}</p>
              <p className="text-xs text-text-secondary mt-1 tracking-wider uppercase">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Category Chart ── */}
        {chartData.length > 0 && (
          <div className="card-botanical p-8 mb-12">
            <h2 className="font-serif text-2xl font-semibold text-forest mb-8">Spending by Category</h2>
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-52 h-52">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      innerRadius={40}
                      strokeWidth={2}
                      stroke="#F9F8F4"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={Object.values(CATEGORY_COLORS)[i % Object.values(CATEGORY_COLORS).length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => `${currency}${v.toFixed(0)}`}
                      contentStyle={{
                        borderRadius: '16px',
                        border: '1px solid #E6E2DA',
                        boxShadow: '0 10px 15px -3px rgba(45, 58, 49, 0.05)',
                        fontFamily: '"Source Sans 3", sans-serif',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {chartData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2.5 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: Object.values(CATEGORY_COLORS)[i % Object.values(CATEGORY_COLORS).length] }}
                    />
                    <span className="text-forest">{d.name}</span>
                    <span className="text-text-secondary">{currency}{d.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── AI Insights ── */}
        <div className="rounded-card p-6 bg-sage/5 border border-sage/20 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
              <Leaf size={20} strokeWidth={1.5} className="text-sage" />
            </div>
            <div>
              <p className="font-serif text-lg font-semibold text-sage">AI Insights</p>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                {chartData.length > 0
                  ? `Top spend: ${chartData.sort((a, b) => b.value - a.value)[0].name} (${currency}${chartData[0].value.toFixed(0)})`
                  : 'No expenses this month. Add one to get started!'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Recent Transactions ── */}
        <h2 className="font-serif text-2xl font-semibold text-forest mb-6">Recent Transactions</h2>
        <div className="space-y-3">
          {monthlyExpenses.slice(0, 5).map((e, i) => (
            <div
              key={e.id}
              className="flex items-center gap-4 p-5 bg-white rounded-card border border-stone/30 hover:border-sage/30 hover:shadow-botanical transition-all duration-500 ease-out group"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${CATEGORY_COLORS[e.category as keyof typeof CATEGORY_COLORS] || '#8C9A84'}12` }}
              >
                <Receipt
                  size={18}
                  strokeWidth={1.5}
                  style={{ color: CATEGORY_COLORS[e.category as keyof typeof CATEGORY_COLORS] || '#8C9A84' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-forest truncate group-hover:text-sage transition-colors duration-300">{e.title}</p>
                <p className="text-xs text-text-secondary mt-0.5 tracking-wide">
                  {e.category} · {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <p className="font-serif text-lg font-semibold text-forest">
                {currency}{e.amount.toFixed(0)}
              </p>
            </div>
          ))}
          {monthlyExpenses.length === 0 && (
            <div className="text-center py-16">
              <Receipt size={32} strokeWidth={1} className="text-stone mx-auto mb-4" />
              <p className="text-text-secondary text-sm tracking-wide">No expenses this month</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
