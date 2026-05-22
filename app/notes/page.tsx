'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useNotes } from '@/hooks/useNotes';
import { useTasks } from '@/hooks/useTasks';
import { useReminders } from '@/hooks/useReminders';
import { Plus, X, Bell, BellOff, Leaf, Check } from 'lucide-react';

type Tab = 'notes' | 'tasks' | 'reminders';

export default function NotesPage() {
  const [userId, setUserId] = useState<string>();
  const [tab, setTab] = useState<Tab>('notes');
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState<any>(null);
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [taskForm, setTaskForm] = useState({ title: '', priority: 0, dueDate: '' });
  const [reminderForm, setReminderForm] = useState({ title: '', time: '', repeat: 'none' });
  const router = useRouter();
  const supabase = createClient();

  const { notes, addNote, updateNote, deleteNote } = useNotes(userId);
  const { activeTasks, addTask, deleteTask, toggleComplete } = useTasks(userId);
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

  const priorityColors = ['text-mushroom', 'text-terracotta', 'text-red-500'];
  const priorityLabels = ['Low', 'Medium', 'High'];

  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-forest">Notes & Tasks</h1>
          <p className="text-text-secondary mt-1 tracking-wide">Organize your thoughts and to-dos</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1.5 bg-cream rounded-full mb-8 border border-stone/30">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 py-3 rounded-full text-sm font-medium tracking-wider uppercase transition-all duration-300 ${tab === t.key ? 'bg-white shadow-botanical text-forest' : 'text-text-secondary hover:text-forest'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Notes Tab */}
        {tab === 'notes' && (
          <div>
            <div className="space-y-3">
              {notes.map(n => (
                <div key={n.id} className="card-botanical p-5 cursor-pointer" onClick={() => { setEditNote(n); setNoteForm({ title: n.title, content: n.content }); setShowModal(true); }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-semibold text-forest truncate">{n.title}</p>
                      <p className="text-sm text-text-secondary mt-2 line-clamp-2 leading-relaxed">{n.content}</p>
                      <p className="text-xs text-mushroom mt-3 tracking-wide">{new Date(n.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteNote(n.id); }} className="p-2 text-mushroom hover:text-terracotta transition-colors duration-300"><X size={16} strokeWidth={1.5} /></button>
                  </div>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4"><Leaf size={28} strokeWidth={1.5} className="text-sage" /></div>
                  <p className="font-serif text-xl text-forest">No notes yet</p>
                  <p className="text-sm text-mushroom mt-1">Tap + to create your first note</p>
                </div>
              )}
            </div>
            <button onClick={() => { setEditNote(null); setNoteForm({ title: '', content: '' }); setShowModal(true); }} className="fixed bottom-24 lg:bottom-8 right-6 lg:right-10 w-14 h-14 rounded-full bg-forest text-white flex items-center justify-center shadow-botanical-xl hover:bg-forest/90 transition-all duration-300"><Plus size={22} strokeWidth={1.5} /></button>
          </div>
        )}

        {/* Tasks Tab */}
        {tab === 'tasks' && (
          <div>
            <div className="space-y-3">
              {activeTasks.map(t => (
                <div key={t.id} className="card-botanical flex items-center gap-4 p-4">
                  <button onClick={() => toggleComplete(t.id)} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${t.is_completed ? 'bg-sage border-sage' : `border-current ${priorityColors[t.priority]}`}`}>
                    {t.is_completed && <Check size={14} strokeWidth={2} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${t.is_completed ? 'line-through text-mushroom' : 'text-forest'}`}>{t.title}</p>
                    <div className="flex gap-3 mt-1.5">
                      <span className={`text-xs font-medium tracking-wider uppercase ${priorityColors[t.priority]}`}>{priorityLabels[t.priority]}</span>
                      {t.due_date && <span className="text-xs text-mushroom">{new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                    </div>
                  </div>
                  <button onClick={() => deleteTask(t.id)} className="p-2 text-mushroom hover:text-terracotta transition-colors duration-300"><X size={16} strokeWidth={1.5} /></button>
                </div>
              ))}
              {activeTasks.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4"><Leaf size={28} strokeWidth={1.5} className="text-sage" /></div>
                  <p className="font-serif text-xl text-forest">No tasks yet</p>
                  <p className="text-sm text-mushroom mt-1">Tap + to add a task</p>
                </div>
              )}
            </div>
            <button onClick={() => setShowModal(true)} className="fixed bottom-24 lg:bottom-8 right-6 lg:right-10 w-14 h-14 rounded-full bg-forest text-white flex items-center justify-center shadow-botanical-xl hover:bg-forest/90 transition-all duration-300"><Plus size={22} strokeWidth={1.5} /></button>
          </div>
        )}

        {/* Reminders Tab */}
        {tab === 'reminders' && (
          <div>
            <div className="space-y-3">
              {reminders.map(r => (
                <div key={r.id} className="card-botanical flex items-center gap-4 p-4">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${r.is_active ? 'bg-terracotta/10' : 'bg-cream'}`}>
                    {r.is_active ? <Bell size={18} strokeWidth={1.5} className="text-terracotta" /> : <BellOff size={18} strokeWidth={1.5} className="text-mushroom" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-forest">{r.title}</p>
                    <p className="text-xs text-mushroom mt-1 tracking-wide">
                      {new Date(r.scheduled_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      {r.repeat_mode !== 'none' ? ` · ${r.repeat_mode}` : ''}
                    </p>
                  </div>
                  <button onClick={() => updateReminder(r.id, { is_active: !r.is_active })} className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-300 ${r.is_active ? 'bg-terracotta/10 text-terracotta' : 'bg-cream text-mushroom'}`}>
                    {r.is_active ? 'On' : 'Off'}
                  </button>
                  <button onClick={() => deleteReminder(r.id)} className="p-2 text-mushroom hover:text-terracotta transition-colors duration-300"><X size={16} strokeWidth={1.5} /></button>
                </div>
              ))}
              {reminders.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4"><Leaf size={28} strokeWidth={1.5} className="text-sage" /></div>
                  <p className="font-serif text-xl text-forest">No reminders</p>
                  <p className="text-sm text-mushroom mt-1">Tap + to set a reminder</p>
                </div>
              )}
            </div>
            <button onClick={() => setShowModal(true)} className="fixed bottom-24 lg:bottom-8 right-6 lg:right-10 w-14 h-14 rounded-full bg-forest text-white flex items-center justify-center shadow-botanical-xl hover:bg-forest/90 transition-all duration-300"><Plus size={22} strokeWidth={1.5} /></button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-forest/20 backdrop-blur-sm flex items-end md:items-center justify-center z-40" onClick={() => setShowModal(false)}>
            <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-8 border-t border-stone/50" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-stone rounded-full mx-auto mb-6" />

              {tab === 'notes' && (
                <form onSubmit={async (e) => { e.preventDefault(); if (editNote) { await updateNote(editNote.id, noteForm); } else { await addNote(noteForm); } setShowModal(false); }} className="space-y-5">
                  <h2 className="font-serif text-2xl font-semibold text-forest">{editNote ? 'Edit Note' : 'New Note'}</h2>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide">Title</label>
                    <input type="text" value={noteForm.title} onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} className="input-botanical" placeholder="Title" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide">Content</label>
                    <textarea value={noteForm.content} onChange={e => setNoteForm({ ...noteForm, content: e.target.value })} className="input-botanical min-h-[140px] rounded-3xl" placeholder="Write your note..." />
                  </div>
                  <button type="submit" className="btn-botanical w-full">Save</button>
                </form>
              )}

              {tab === 'tasks' && (
                <form onSubmit={async (e) => { e.preventDefault(); await addTask({ title: taskForm.title, priority: taskForm.priority, due_date: taskForm.dueDate || null }); setShowModal(false); }} className="space-y-5">
                  <h2 className="font-serif text-2xl font-semibold text-forest">New Task</h2>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide">Title</label>
                    <input type="text" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} className="input-botanical" placeholder="Task title" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide">Priority</label>
                    <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: parseInt(e.target.value) })} className="input-botanical">
                      <option value={0}>Low</option>
                      <option value={1}>Medium</option>
                      <option value={2}>High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide">Due Date</label>
                    <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="input-botanical" />
                  </div>
                  <button type="submit" className="btn-botanical w-full">Add Task</button>
                </form>
              )}

              {tab === 'reminders' && (
                <form onSubmit={async (e) => { e.preventDefault(); await addReminder({ title: reminderForm.title, scheduled_time: reminderForm.time, repeat_mode: reminderForm.repeat, is_active: true }); setShowModal(false); }} className="space-y-5">
                  <h2 className="font-serif text-2xl font-semibold text-forest">New Reminder</h2>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide">Title</label>
                    <input type="text" value={reminderForm.title} onChange={e => setReminderForm({ ...reminderForm, title: e.target.value })} className="input-botanical" placeholder="Reminder title" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide">Time</label>
                    <input type="datetime-local" value={reminderForm.time} onChange={e => setReminderForm({ ...reminderForm, time: e.target.value })} className="input-botanical" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide">Repeat</label>
                    <select value={reminderForm.repeat} onChange={e => setReminderForm({ ...reminderForm, repeat: e.target.value })} className="input-botanical">
                      <option value="none">Once</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-botanical w-full">Set Reminder</button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
