'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useExpenses } from '@/hooks/useExpenses';
import { CATEGORY_COLORS } from '@/constants';
import { BarChart3, TrendingUp, TrendingDown, Receipt, Target, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function AnalyticsPage() {
  const [userId, setUserId] = useState<string>();
  const [currency, setCurrency] = useState('₹');
  const [budget, setBudget] = useState(0);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now);
  const supabase = createClient();

  const { expenses, getExpensesForMonth, getTotalForMonth, getByCategory } = useExpenses(userId);

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

  // Previous month comparison
  const prevMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1);
  const prevTotal = getTotalForMonth(prevMonth);
  const changePercent = prevTotal > 0 ? ((totalSpent - prevTotal) / prevTotal) * 100 : 0;

  // Category data
  const categoryData = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || '#8C9A84' }))
    .sort((a, b) => b.value - a.value);

  // Daily spending for bar chart
  const dailyData: { day: string; amount: number }[] = [];
  const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), d);
    const dayTotal = monthlyExpenses
      .filter(e => new Date(e.date).toDateString() === date.toDateString())
      .reduce((s, e) => s + e.amount, 0);
    dailyData.push({ day: d.toString(), amount: dayTotal });
  }

  // Average daily spend
  const daysElapsed = isCurrentMonth ? now.getDate() : daysInMonth;
  const avgDaily = daysElapsed > 0 ? totalSpent / daysElapsed : 0;

  // Top category
  const topCategory = categoryData[0];

  return (
    <AppShell>
      <div className="px-6 md:px-12 lg:px-16 py-12 md:py-16 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center">
              <BarChart3 size={22} strokeWidth={1.5} className="text-sage" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-forest tracking-tight">
              Analytics
            </h1>
          </div>
        </div>

        {/* Month Selector */}
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

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          <div className="card-botanical p-6">
            <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center mb-3">
              <Receipt size={18} strokeWidth={1.5} className="text-sage" />
            </div>
            <p className="text-xs text-text-secondary tracking-wider uppercase mb-1">Total Spent</p>
            <p className="font-serif text-2xl font-semibold text-forest">{currency}{totalSpent.toFixed(0)}</p>
          </div>

          <div className="card-botanical p-6">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${changePercent >= 0 ? 'bg-terracotta/10' : 'bg-sage/10'}`}>
              {changePercent >= 0
                ? <TrendingUp size={18} strokeWidth={1.5} className="text-terracotta" />
                : <TrendingDown size={18} strokeWidth={1.5} className="text-sage" />
              }
            </div>
            <p className="text-xs text-text-secondary tracking-wider uppercase mb-1">vs Last Month</p>
            <p className={`font-serif text-2xl font-semibold ${changePercent >= 0 ? 'text-terracotta' : 'text-sage'}`}>
              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
            </p>
          </div>

          <div className="card-botanical p-6">
            <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center mb-3">
              <Target size={18} strokeWidth={1.5} className="text-sage" />
            </div>
            <p className="text-xs text-text-secondary tracking-wider uppercase mb-1">Daily Avg</p>
            <p className="font-serif text-2xl font-semibold text-forest">{currency}{avgDaily.toFixed(0)}</p>
          </div>

          <div className="card-botanical p-6">
            <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center mb-3">
              <Leaf size={18} strokeWidth={1.5} className="text-sage" />
            </div>
            <p className="text-xs text-text-secondary tracking-wider uppercase mb-1">Transactions</p>
            <p className="font-serif text-2xl font-semibold text-forest">{monthlyExpenses.length}</p>
          </div>
        </div>

        {/* Budget Progress */}
        {budget > 0 && (
          <div className="card-botanical p-8 mb-12">
            <h2 className="font-serif text-xl font-semibold text-forest mb-6">Budget Tracking</h2>
            <div className="relative">
              <div className="h-4 bg-cream rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    totalSpent > budget ? 'bg-terracotta' : 'bg-sage'
                  }`}
                  style={{ width: `${Math.min((totalSpent / budget) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-3">
                <span className="text-sm text-text-secondary">{currency}{totalSpent.toFixed(0)} spent</span>
                <span className="text-sm text-text-secondary">{currency}{budget.toFixed(0)} budget</span>
              </div>
              {totalSpent > budget && (
                <p className="text-sm text-terracotta mt-2">
                  Over budget by {currency}{(totalSpent - budget).toFixed(0)}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Category Breakdown */}
          {categoryData.length > 0 && (
            <div className="card-botanical p-8">
              <h2 className="font-serif text-xl font-semibold text-forest mb-6">By Category</h2>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-48 h-48">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={35}
                        strokeWidth={2}
                        stroke="#F9F8F4"
                      >
                        {categoryData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number) => `${currency}${v.toFixed(0)}`}
                        contentStyle={{
                          borderRadius: '16px',
                          border: '1px solid #E6E2DA',
                          boxShadow: '0 10px 15px -3px rgba(45, 58, 49, 0.05)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {categoryData.map((d) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-sm text-forest flex-1">{d.name}</span>
                      <span className="text-sm text-text-secondary">{currency}{d.value.toFixed(0)}</span>
                      <span className="text-xs text-mushroom w-12 text-right">
                        {totalSpent > 0 ? ((d.value / totalSpent) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Daily Spending Chart */}
          <div className="card-botanical p-8">
            <h2 className="font-serif text-xl font-semibold text-forest mb-6">Daily Spending</h2>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6E2DA" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: '#B8ADA0' }}
                    interval={Math.floor(daysInMonth / 8)}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#B8ADA0' }} />
                  <Tooltip
                    formatter={(v: number) => `${currency}${v.toFixed(0)}`}
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid #E6E2DA',
                      boxShadow: '0 10px 15px -3px rgba(45, 58, 49, 0.05)',
                    }}
                  />
                  <Bar dataKey="amount" fill="#8C9A84" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="rounded-card p-6 bg-sage/5 border border-sage/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
              <Leaf size={20} strokeWidth={1.5} className="text-sage" />
            </div>
            <div>
              <p className="font-serif text-lg font-semibold text-sage">AI Insights</p>
              <div className="text-sm text-text-secondary mt-1 leading-relaxed space-y-1">
                {topCategory && (
                  <p>Top spending: <strong className="text-forest">{topCategory.name}</strong> at {currency}{topCategory.value.toFixed(0)} ({totalSpent > 0 ? ((topCategory.value / totalSpent) * 100).toFixed(0) : 0}% of total)</p>
                )}
                {changePercent !== 0 && (
                  <p>
                    {changePercent > 0 ? 'Spending increased' : 'Spending decreased'} by {Math.abs(changePercent).toFixed(1)}% compared to last month.
                    {changePercent > 10 ? ' Consider reviewing your top categories.' : changePercent < -10 ? ' Great job staying on track!' : ''}
                  </p>
                )}
                {monthlyExpenses.length === 0 && <p>No expenses this month. Add some to see insights.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
