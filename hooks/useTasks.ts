'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Task } from '@/lib/types';

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;
    fetchTasks();
    const channel = supabase
      .channel('tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` }, () => fetchTasks())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*').eq('user_id', userId).order('priority', { ascending: false });
    setTasks(data || []);
    setLoading(false);
  }

  async function addTask(task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'is_completed' | 'completed_at' | 'is_archived'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('tasks').insert({ ...task, user_id: user.id });
  }

  async function updateTask(id: string, updates: Partial<Task>) {
    await supabase.from('tasks').update(updates).eq('id', id);
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id);
  }

  async function toggleComplete(id: string) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    await supabase.from('tasks').update({
      is_completed: !task.is_completed,
      completed_at: !task.is_completed ? new Date().toISOString() : null,
    }).eq('id', id);
  }

  const activeTasks = tasks.filter(t => !t.is_archived);

  return { tasks, activeTasks, loading, addTask, updateTask, deleteTask, toggleComplete };
}
