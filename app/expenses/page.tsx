'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useExpenses } from '@/hooks/useExpenses';
import { EXPENSE_CATEGORIES, CATEGORY_COLORS } from '@/constants';
import { Plus, Search, Download, X, Receipt, Leaf } from 'lucide-react';
import { formatCurrency, formatDate, isToday, groupBy } from '@/lib/utils';

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

  const grouped = groupBy(filtered, e => new Date(e.date).toISOString().split('T')[0]);

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
      <div className="p-6 md:p-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-forest">Expenses</h1>
            <p className="text-text-secondary mt-1 tracking-wide">Track your spending</p>
          </div>
          <div className="flex gap-3">
            <button onClick={exportCsv} className="w-11 h-11 rounded-full bg-cream border border-stone/50 flex items-center justify-center text-text-secondary hover:text-forest hover:border-sage transition-all duration-300">
              <Download size={18} strokeWidth={1.5} />
            </button>
            <button onClick={() => { setEditId(null); setForm({ title: '', amount: '', category: 'Food', note: '' }); setShowAdd(true); }} className="btn-botanical flex items-center gap-2">
              <Plus size={18} strokeWidth={1.5} />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} strokeWidth={1.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-mushroom" />
          <input type="text" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} className="input-botanical pl-12" />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {EXPENSE_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(filterCat === cat ? null : cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-300 whitespace-nowrap ${
                filterCat === cat
                  ? 'bg-sage text-white'
                  : 'bg-cream text-text-secondary hover:bg-stone/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grouped list */}
        {Object.entries(grouped).map(([date, items]) => {
          const d = new Date(date + 'T00:00:00');
          const dayTotal = items.reduce((s, e) => s + e.amount, 0);
          return (
            <div key={date} className="mb-8">
              <div className="flex justify-between items-center mb-3 px-1">
                <span className="text-sm font-medium text-text-secondary tracking-wide">
                  {isToday(date) ? 'Today' : formatDate(d, 'long')}
                </span>
                <span className="text-sm text-mushroom">{formatCurrency(dayTotal, currency)}</span>
              </div>
              <div className="space-y-3">
                {items.map(e => (
                  <div key={e.id} className="card-botanical flex items-center gap-4 p-4">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: `${CATEGORY_COLORS[e.category as keyof typeof CATEGORY_COLORS] || '#8C9A84'}15` }}>
                      <Receipt size={18} strokeWidth={1.5} style={{ color: CATEGORY_COLORS[e.category as keyof typeof CATEGORY_COLORS] || '#8C9A84' }} />
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(e)}>
                      <p className="font-medium text-forest truncate">{e.title}</p>
                      <p className="text-xs text-mushroom mt-0.5">{e.category}{e.note ? ` · ${e.note}` : ''}</p>
                    </div>
                    <p className="font-serif font-semibold text-forest">{formatCurrency(e.amount, currency)}</p>
                    <button onClick={() => deleteExpense(e.id)} className="p-2 text-mushroom hover:text-terracotta transition-colors duration-300"><X size={16} strokeWidth={1.5} /></button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
              <Leaf size={28} strokeWidth={1.5} className="text-sage" />
            </div>
            <p className="font-serif text-xl text-forest">No expenses yet</p>
            <p className="text-sm text-mushroom mt-1">Tap + to add your first expense</p>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-forest/20 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-40" onClick={() => setShowAdd(false)}>
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-stone/50 shadow-botanical-lg flex flex-col max-h-[90dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-stone rounded-full mx-auto mb-6" />
              <h2 className="font-serif text-2xl font-semibold text-forest mb-6">{editId ? 'Edit Expense' : 'Add Expense'}</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide">Title</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-botanical" placeholder="What did you spend on?" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide">Amount</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-mushroom">{currency}</span>
                    <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="input-botanical pl-12" placeholder="0" required step="0.01" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-botanical">
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide">Note (optional)</label>
                  <input type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} className="input-botanical" placeholder="Add a note..." />
                </div>
                <button type="submit" className="btn-botanical w-full">{editId ? 'Save Changes' : 'Add Expense'}</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
