'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useExpenses } from '@/hooks/useExpenses';
import { EXPENSE_CATEGORIES, CATEGORY_COLORS } from '@/lib/constants';
import { Plus, Search, Filter, Download, X, Receipt } from 'lucide-react';

export default function ExpensesPage() {
  const [userId, setUserId] = useState<string>();
  const [currency, setCurrency] = useState('₹');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', amount: '', category: 'Food', note: '' });
  const router = useRouter();
  const supabase = createClient();
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses(userId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
      supabase.from('user_settings').select('currency_symbol').eq('user_id', user.id).single().then(({ data }) => {
        if (data) setCurrency(data.currency_symbol);
      });
    });
  }, []);

  if (!userId) return null;

  let filtered = expenses;
  if (search) filtered = filtered.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.note.toLowerCase().includes(search.toLowerCase()));
  if (filterCat) filtered = filtered.filter(e => e.category === filterCat);

  // Group by date
  const grouped: Record<string, typeof expenses> = {};
  filtered.forEach(e => {
    const key = new Date(e.date).toISOString().split('T')[0];
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.title || isNaN(amount)) return;
    if (editId) {
      await updateExpense(editId, { title: form.title, amount, category: form.category, note: form.note });
    } else {
      await addExpense({ title: form.title, amount, category: form.category, note: form.note, date: new Date().toISOString() });
    }
    setShowAdd(false);
    setEditId(null);
    setForm({ title: '', amount: '', category: 'Food', note: '' });
  }

  function openEdit(expense: typeof expenses[0]) {
    setEditId(expense.id);
    setForm({ title: expense.title, amount: expense.amount.toString(), category: expense.category, note: expense.note });
    setShowAdd(true);
  }

  function exportCsv() {
    const rows = [['Title', 'Amount', 'Category', 'Date', 'Note']];
    expenses.forEach(e => rows.push([e.title, e.amount.toString(), e.category, e.date.split('T')[0], e.note]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `cortex_expenses_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  }

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Expenses</h1>
          <div className="flex gap-2">
            <button onClick={exportCsv} className="btn-ghost"><Download size={18} /></button>
            <button onClick={() => { setEditId(null); setForm({ title: '', amount: '', category: 'Food', note: '' }); setShowAdd(true); }} className="btn-primary flex items-center gap-2"><Plus size={18} />Add</button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input type="text" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-11" />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {filterCat && <button onClick={() => setFilterCat(null)} className="px-3 py-1.5 rounded-full text-sm bg-accent/10 text-accent flex items-center gap-1">{filterCat} <X size={14} /></button>}
        </div>

        {/* Grouped list */}
        {Object.entries(grouped).map(([date, items]) => {
          const d = new Date(date + 'T00:00:00');
          const isToday = date === new Date().toISOString().split('T')[0];
          const dayTotal = items.reduce((s, e) => s + e.amount, 0);
          return (
            <div key={date} className="mb-6">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{isToday ? 'Today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="text-sm text-text-secondary dark:text-text-secondary-dark">{currency}{dayTotal.toFixed(0)}</span>
              </div>
              <div className="space-y-2">
                {items.map(e => (
                  <div key={e.id} className="card flex items-center gap-3 p-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${CATEGORY_COLORS[e.category as keyof typeof CATEGORY_COLORS] || '#64748B'}15` }}>
                      <Receipt size={16} style={{ color: CATEGORY_COLORS[e.category as keyof typeof CATEGORY_COLORS] || '#64748B' }} />
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(e)}>
                      <p className="font-medium truncate">{e.title}</p>
                      <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{e.category}{e.note ? ` · ${e.note}` : ''}</p>
                    </div>
                    <p className="font-semibold">{currency}{e.amount.toFixed(0)}</p>
                    <button onClick={() => deleteExpense(e.id)} className="p-1 text-text-secondary hover:text-red-500 transition-colors"><X size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-text-secondary dark:text-text-secondary-dark text-center py-12">No expenses found</p>}

        {/* Add/Edit Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50" onClick={() => setShowAdd(false)}>
            <div className="bg-surface-light dark:bg-surface-dark w-full max-w-lg rounded-t-2xl md:rounded-2xl p-6" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-border-light dark:bg-border-dark rounded-full mx-auto mb-4" />
              <h2 className="text-lg font-bold mb-4">{editId ? 'Edit Expense' : 'Add Expense'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Title</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input" placeholder="What did you spend on?" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">{currency}</span>
                    <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="input pl-10" placeholder="0" required step="0.01" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input">
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Note (optional)</label>
                  <input type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} className="input" placeholder="Add a note..." />
                </div>
                <button type="submit" className="btn-primary w-full">{editId ? 'Save Changes' : 'Add Expense'}</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
