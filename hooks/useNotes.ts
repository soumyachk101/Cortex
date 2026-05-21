'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Note } from '@/lib/types';

export function useNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;
    fetchNotes();
    const channel = supabase
      .channel('notes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${userId}` }, () => fetchNotes())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  async function fetchNotes() {
    const { data } = await supabase.from('notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
    setNotes(data || []);
    setLoading(false);
  }

  async function addNote(note: Omit<Note, 'id' | 'user_id' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('notes').insert({ ...note, user_id: user.id });
  }

  async function updateNote(id: string, updates: Partial<Note>) {
    await supabase.from('notes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
  }

  async function deleteNote(id: string) {
    await supabase.from('notes').delete().eq('id', id);
  }

  return { notes, loading, addNote, updateNote, deleteNote };
}
