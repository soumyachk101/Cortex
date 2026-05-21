'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useNotes } from '@/hooks/useNotes';
import { useTasks } from '@/hooks/useTasks';
import { useReminders } from '@/hooks/useReminders';
import { Plus, X, Bell, BellOff } from 'lucide-react';

type Tab = 'notes' | 'tasks' | 'reminders';

export default function NotesPage() {
  const [userId, setUserId] = useState<string>();
  const [tab, setTab] = useState<Tab>('notes');
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState<any>(null);
  const [editTask, setEditTask] = useState<any>(null);
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [taskForm, setTaskForm] = useState({ title: '', priority: 0, dueDate: '' });
  const [reminderForm, setReminderForm] = useState({ title: '', time: '', repeat: 'none' });
  const router = useRouter();
  const supabase = createClient();

  const { notes, addNote, updateNote, deleteNote } = useNotes(userId);
  const { activeTasks, addTask, updateTask, deleteTask, toggleComplete } = useTasks(userId);
  const { reminders, addReminder, updateReminder, deleteReminder } = useReminders(userId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
    });
  }, []);

  if (!userId) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'notes', label: 'Notes' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'reminders', label: 'Reminders' },
  ];

  const priorityColors = ['text-gray-400', 'text-amber-500', 'text-red-500'];
  const priorityLabels = ['Low', 'Medium', 'High'];

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Notes & Tasks</h1>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-surface-light dark:bg-surface-dark shadow-sm text-accent' : 'text-text-secondary dark:text-text-secondary-dark'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Notes Tab */}
        {tab === 'notes' && (
          <div>
            <div className="space-y-2">
              {notes.map(n => (
                <div key={n.id} className="card p-4 cursor-pointer" onClick={() => { setEditNote(n); setNoteForm({ title: n.title, content: n.content }); setShowModal(true); }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{n.title}</p>
                      <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1 line-clamp-2">{n.content}</p>
                      <p className="text-xs text-text-secondary/70 mt-2">{new Date(n.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteNote(n.id); }} className="p-1 text-text-secondary hover:text-red-500"><X size={16} /></button>
                  </div>
                </div>
              ))}
              {notes.length === 0 && <p className="text-text-secondary dark:text-text-secondary-dark text-center py-12">No notes yet</p>}
            </div>
            <button onClick={() => { setEditNote(null); setNoteForm({ title: '', content: '' }); setShowModal(true); }} className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-14 h-14 gradient-accent rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent/25"><Plus size={24} /></button>
          </div>
        )}

        {/* Tasks Tab */}
        {tab === 'tasks' && (
          <div>
            <div className="space-y-2">
              {activeTasks.map(t => (
                <div key={t.id} className="card flex items-center gap-3 p-3">
                  <button onClick={() => toggleComplete(t.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${t.is_completed ? 'bg-accent border-accent' : `border-current ${priorityColors[t.priority]}`}`}>
                    {t.is_completed && <span className="text-white text-xs">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${t.is_completed ? 'line-through text-text-secondary' : ''}`}>{t.title}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-xs ${priorityColors[t.priority]}`}>{priorityLabels[t.priority]}</span>
                      {t.due_date && <span className="text-xs text-text-secondary dark:text-text-secondary-dark">{new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                    </div>
                  </div>
                  <button onClick={() => deleteTask(t.id)} className="p-1 text-text-secondary hover:text-red-500"><X size={16} /></button>
                </div>
              ))}
              {activeTasks.length === 0 && <p className="text-text-secondary dark:text-text-secondary-dark text-center py-12">No tasks yet</p>}
            </div>
            <button onClick={() => { setEditTask(null); setTaskForm({ title: '', priority: 0, dueDate: '' }); setShowModal(true); }} className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-14 h-14 gradient-accent rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent/25"><Plus size={24} /></button>
          </div>
        )}

        {/* Reminders Tab */}
        {tab === 'reminders' && (
          <div>
            <div className="space-y-2">
              {reminders.map(r => (
                <div key={r.id} className="card flex items-center gap-3 p-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.is_active ? 'bg-amber-500/10' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    {r.is_active ? <Bell size={18} className="text-amber-500" /> : <BellOff size={18} className="text-text-secondary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                      {new Date(r.scheduled_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      {r.repeat_mode !== 'none' ? ` · ${r.repeat_mode}` : ''}
                    </p>
                  </div>
                  <button onClick={() => updateReminder(r.id, { is_active: !r.is_active })} className={`px-3 py-1 rounded-full text-xs font-medium ${r.is_active ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-200 dark:bg-gray-700 text-text-secondary'}`}>
                    {r.is_active ? 'On' : 'Off'}
                  </button>
                  <button onClick={() => deleteReminder(r.id)} className="p-1 text-text-secondary hover:text-red-500"><X size={16} /></button>
                </div>
              ))}
              {reminders.length === 0 && <p className="text-text-secondary dark:text-text-secondary-dark text-center py-12">No reminders</p>}
            </div>
            <button onClick={() => setShowModal(true)} className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-14 h-14 gradient-accent rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent/25"><Plus size={24} /></button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50" onClick={() => setShowModal(false)}>
            <div className="bg-surface-light dark:bg-surface-dark w-full max-w-lg rounded-t-2xl md:rounded-2xl p-6" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-border-light dark:bg-border-dark rounded-full mx-auto mb-4" />

              {tab === 'notes' && (
                <form onSubmit={async (e) => { e.preventDefault(); if (editNote) { await updateNote(editNote.id, noteForm); } else { await addNote(noteForm); } setShowModal(false); }} className="space-y-4">
                  <h2 className="text-lg font-bold">{editNote ? 'Edit Note' : 'New Note'}</h2>
                  <input type="text" value={noteForm.title} onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} className="input" placeholder="Title" required />
                  <textarea value={noteForm.content} onChange={e => setNoteForm({ ...noteForm, content: e.target.value })} className="input min-h-[120px]" placeholder="Content..." />
                  <button type="submit" className="btn-primary w-full">Save</button>
                </form>
              )}

              {tab === 'tasks' && (
                <form onSubmit={async (e) => { e.preventDefault(); await addTask({ title: taskForm.title, priority: taskForm.priority, due_date: taskForm.dueDate || null }); setShowModal(false); }} className="space-y-4">
                  <h2 className="text-lg font-bold">New Task</h2>
                  <input type="text" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} className="input" placeholder="Task title" required />
                  <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: parseInt(e.target.value) })} className="input">
                    <option value={0}>Low</option>
                    <option value={1}>Medium</option>
                    <option value={2}>High</option>
                  </select>
                  <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="input" />
                  <button type="submit" className="btn-primary w-full">Add Task</button>
                </form>
              )}

              {tab === 'reminders' && (
                <form onSubmit={async (e) => { e.preventDefault(); await addReminder({ title: reminderForm.title, scheduled_time: reminderForm.time, repeat_mode: reminderForm.repeat, is_active: true }); setShowModal(false); }} className="space-y-4">
                  <h2 className="text-lg font-bold">New Reminder</h2>
                  <input type="text" value={reminderForm.title} onChange={e => setReminderForm({ ...reminderForm, title: e.target.value })} className="input" placeholder="Reminder title" required />
                  <input type="datetime-local" value={reminderForm.time} onChange={e => setReminderForm({ ...reminderForm, time: e.target.value })} className="input" required />
                  <select value={reminderForm.repeat} onChange={e => setReminderForm({ ...reminderForm, repeat: e.target.value })} className="input">
                    <option value="none">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  <button type="submit" className="btn-primary w-full">Set Reminder</button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
