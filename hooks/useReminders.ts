'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Reminder } from '@/lib/types';

export function useReminders(userId: string | undefined) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;
    fetchReminders();
    const channel = supabase
      .channel('reminders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reminders', filter: `user_id=eq.${userId}` }, () => fetchReminders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  async function fetchReminders() {
    const { data } = await supabase.from('reminders').select('*').eq('user_id', userId).order('scheduled_time');
    setReminders(data || []);
    setLoading(false);
  }

  async function addReminder(reminder: Omit<Reminder, 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('reminders').insert({ ...reminder, user_id: user.id });
  }

  async function updateReminder(id: string, updates: Partial<Reminder>) {
    await supabase.from('reminders').update(updates).eq('id', id);
  }

  async function deleteReminder(id: string) {
    await supabase.from('reminders').delete().eq('id', id);
  }

  return { reminders, loading, addReminder, updateReminder, deleteReminder };
}
