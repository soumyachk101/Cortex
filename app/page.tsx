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
import { StickyNote, Receipt, CheckSquare, TrendingUp, Sun, Moon } from 'lucide-react';
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

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Month selector */}
        <div className="card flex items-center justify-between p-4 mb-6">
          <button onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">←</button>
          <span className="font-semibold">{selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => !isCurrentMonth && setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))} disabled={isCurrentMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-30">→</button>
        </div>

        {/* Balance card */}
        <div className="gradient-accent rounded-2xl p-6 text-white mb-6 shadow-lg shadow-accent/25">
          <p className="text-white/80 text-sm">Total Spent</p>
          <p className="text-4xl font-bold mt-1">{currency}{totalSpent.toFixed(0)}</p>
          {budget > 0 && (
            <div className="mt-4">
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min((totalSpent / budget) * 100, 100)}%` }} />
              </div>
              <p className="text-white/70 text-xs mt-1">{currency}{budget.toFixed(0)} budget</p>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Receipt, label: 'Transactions', value: monthlyExpenses.length, color: 'bg-accent/10 text-accent' },
            { icon: CheckSquare, label: 'Active Tasks', value: activeCount, color: 'bg-emerald-500/10 text-emerald-500' },
            { icon: StickyNote, label: 'Notes', value: notes.length, color: 'bg-amber-500/10 text-amber-500' },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
                <s.icon size={18} />
              </div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Category chart */}
        {chartData.length > 0 && (
          <div className="card p-6 mb-6">
            <h2 className="font-semibold mb-4">Spending by Category</h2>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-48 h-48">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {chartData.map((_, i) => <Cell key={i} fill={Object.values(CATEGORY_COLORS)[i % Object.values(CATEGORY_COLORS).length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${currency}${v.toFixed(0)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3">
                {chartData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: Object.values(CATEGORY_COLORS)[i % Object.values(CATEGORY_COLORS).length] }} />
                    <span>{d.name}</span>
                    <span className="text-text-secondary dark:text-text-secondary-dark">{currency}{d.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Insights */}
        <div className="rounded-2xl p-4 bg-accent/5 border border-accent/20 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <TrendingUp size={18} className="text-accent" />
            </div>
            <div>
              <p className="font-semibold text-accent text-sm">AI Insights</p>
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                {chartData.length > 0
                  ? `Top spend: ${chartData.sort((a, b) => b.value - a.value)[0].name} (${currency}${chartData[0].value.toFixed(0)})`
                  : 'No expenses this month. Add one to get started!'}
              </p>
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <h2 className="font-semibold mb-3">Recent Transactions</h2>
        <div className="space-y-2">
          {monthlyExpenses.slice(0, 5).map((e) => (
            <div key={e.id} className="card flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${CATEGORY_COLORS[e.category as keyof typeof CATEGORY_COLORS] || '#64748B'}15` }}>
                <Receipt size={16} style={{ color: CATEGORY_COLORS[e.category as keyof typeof CATEGORY_COLORS] || '#64748B' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{e.title}</p>
                <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{e.category} · {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>
              <p className="font-semibold">{currency}{e.amount.toFixed(0)}</p>
            </div>
          ))}
          {monthlyExpenses.length === 0 && <p className="text-text-secondary dark:text-text-secondary-dark text-sm text-center py-8">No expenses this month</p>}
        </div>
      </div>
    </AppShell>
  );
}
