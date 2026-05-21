'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Expense } from '@/lib/types';

export function useExpenses(userId: string | undefined) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;
    fetchExpenses();
    const channel = supabase
      .channel('expenses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${userId}` }, () => fetchExpenses())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  async function fetchExpenses() {
    const { data } = await supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false });
    setExpenses(data || []);
    setLoading(false);
  }

  async function addExpense(expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('expenses').insert({ ...expense, user_id: user.id });
  }

  async function updateExpense(id: string, updates: Partial<Expense>) {
    await supabase.from('expenses').update(updates).eq('id', id);
  }

  async function deleteExpense(id: string) {
    await supabase.from('expenses').delete().eq('id', id);
  }

  function getExpensesForMonth(month: Date) {
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
    });
  }

  function getTotalForMonth(month: Date) {
    return getExpensesForMonth(month).reduce((s, e) => s + e.amount, 0);
  }

  function getByCategory(month: Date) {
    const map: Record<string, number> = {};
    getExpensesForMonth(month).forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return map;
  }

  return { expenses, loading, addExpense, updateExpense, deleteExpense, getExpensesForMonth, getTotalForMonth, getByCategory };
}
