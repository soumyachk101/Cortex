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
  const sortedChartData = [...chartData].sort((a, b) => b.value - a.value);
  const topCategory = sortedChartData[0];
  const activeCount = activeTasks.filter(t => !t.is_completed).length;

  const stats = [
    { icon: Receipt, label: 'Transactions', value: monthlyExpenses.length },
    { icon: CheckSquare, label: 'Active Tasks', value: activeCount },
    { icon: StickyNote, label: 'Notes', value: notes.length },
  ];

  return (
    <AppShell>
      <div className="px-4 sm:px-6 md:px-12 lg:px-16 py-8 sm:py-12 md:py-16 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10 sm:mb-16">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sage/10 flex items-center justify-center">
              <Leaf size={20} strokeWidth={1.5} className="text-sage" />
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-semibold text-forest tracking-tight">
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

        {/* Month Selector */}
        <div className="flex items-center justify-center gap-6 mb-12">
          <button
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
            className="w-10 h-10 rounded-full bg-white border border-stone/50 flex items-center justify-center text-text-secondary hover:text-forest hover:border-sage/50 transition-all duration-300 shadow-botanical"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <span className="font-serif text-xl text-forest min-w-[140px] sm:min-w-[200px] text-center">
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

        {/* Balance Card */}
        <div className="gradient-botanical rounded-card p-5 sm:p-8 md:p-10 text-white mb-8 sm:mb-12 shadow-botanical-xl relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

          <p className="text-white/70 text-xs sm:text-sm tracking-widest uppercase font-medium">Total Spent</p>
          <p className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mt-2 sm:mt-3 tracking-tight">
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

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`card-botanical-flat p-4 sm:p-6 text-center ${i % 2 === 1 ? 'md:translate-y-3' : ''}`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <s.icon size={18} strokeWidth={1.5} className="text-sage" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-semibold text-forest">{s.value}</p>
              <p className="text-[10px] sm:text-xs text-text-secondary mt-1 tracking-wider uppercase">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Category Chart */}
        {chartData.length > 0 && (
          <div className="card-botanical p-6 sm:p-8 mb-12">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-forest mb-6 sm:mb-8">Spending by Category</h2>
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="w-48 h-48 sm:w-56 sm:h-56 relative flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={42}
                      strokeWidth={2}
                      stroke="#F9F8F4"
                    >
                      {chartData.map((d) => (
                        <Cell
                          key={d.name}
                          fill={CATEGORY_COLORS[d.name as keyof typeof CATEGORY_COLORS] || '#8C9A84'}
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
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {chartData.map((d) => {
                  const color = CATEGORY_COLORS[d.name as keyof typeof CATEGORY_COLORS] || '#8C9A84';
                  const percent = totalSpent > 0 ? ((d.value / totalSpent) * 100).toFixed(0) : '0';
                  return (
                    <div key={d.name} className="flex items-center justify-between p-3.5 rounded-2xl bg-cream/50 border border-stone/30">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-sm font-medium text-forest truncate">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 text-xs sm:text-sm">
                        <span className="font-medium text-forest">{currency}{d.value.toFixed(0)}</span>
                        <span className="text-mushroom text-xs">({percent}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* AI Insights & Budget Alert */}
        <div className="rounded-card p-6 bg-cream/70 border border-stone/50 mb-12 relative overflow-hidden shadow-botanical">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Leaf size={22} strokeWidth={1.5} className="text-sage animate-pulse" />
              </div>
              <div>
                <p className="font-serif text-lg font-semibold text-forest flex items-center gap-2">
                  <span>AI Financial Insights</span>
                  <span className="text-[10px] bg-sage/15 text-sage px-2 py-0.5 rounded-full uppercase tracking-wider font-sans font-medium">Smart</span>
                </p>
                <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                  {sortedChartData.length > 0 && topCategory ? (
                    <>
                      Top category is <strong className="text-forest">{topCategory.name}</strong> ({((topCategory.value / (totalSpent || 1)) * 100).toFixed(0)}% of total spent: {currency}{topCategory.value.toFixed(0)}).
                      {budget > 0 && totalSpent > budget && (
                        <span className="block mt-1 text-terracotta font-medium">⚠️ Alert: You have exceeded your monthly budget of {currency}{budget}!</span>
                      )}
                      {budget > 0 && totalSpent <= budget && totalSpent / budget >= 0.8 && (
                        <span className="block mt-1 text-amber-600 font-medium">⚠️ Warning: You have used {((totalSpent / budget) * 100).toFixed(0)}% of your monthly budget.</span>
                      )}
                    </>
                  ) : (
                    'No transactions recorded for this month yet. Ask Cortex AI or scan a receipt to get started!'
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const promptText = encodeURIComponent('Analyze my spending summary for this month and give me personalized budget advice.');
                router.push(`/agent?prompt=${promptText}&new=true`);
              }}
              className="px-4 py-2 rounded-full bg-forest text-white text-xs font-medium hover:bg-forest/90 transition-all flex-shrink-0 whitespace-nowrap self-end sm:self-center"
            >
              Ask AI Agent
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
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
