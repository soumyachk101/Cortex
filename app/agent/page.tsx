'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { GEMINI_MODELS } from '@/lib/constants';
import { Send, Trash2, Bot, Sparkles } from 'lucide-react';

interface Message { id: string; text: string; isUser: boolean; }

export default function AgentPage() {
  const [userId, setUserId] = useState<string>();
  const [apiKey, setApiKey] = useState('');
  const [modelId, setModelId] = useState('gemini-2.0-flash');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
      supabase.from('user_settings').select('gemini_api_key, selected_model').eq('user_id', user.id).single().then(({ data }) => {
        if (data) { setApiKey(data.gemini_api_key || ''); setModelId(data.selected_model || 'gemini-2.0-flash'); }
      });
    });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  async function send() {
    if (!input.trim() || !apiKey) return;
    const userMsg: Message = { id: Date.now().toString(), text: input, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text, history, modelId, apiKey }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages(prev => [...prev, { id: Date.now().toString(), text: `Error: ${data.error}`, isUser: false }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), text: data.text, isUser: false }]);
        setHistory(data.history || []);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: `Error: ${e.message}`, isUser: false }]);
    }
    setIsTyping(false);
  }

  function clearContext() {
    setMessages([]);
    setHistory([]);
  }

  const modelName = GEMINI_MODELS.find(m => m.id === modelId)?.name || modelId;

  return (
    <AppShell>
      <div className="flex flex-col h-screen max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
          <div>
            <h1 className="text-lg font-bold">AI Agent</h1>
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{modelName}</p>
          </div>
          <button onClick={clearContext} className="btn-ghost" title="Clear context"><Trash2 size={18} /></button>
        </div>

        {/* API Key warning */}
        {!apiKey && (
          <div className="mx-4 mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3">
            <span className="text-amber-600 dark:text-amber-400 text-sm">Set your Gemini API key in Settings to use the AI agent</span>
            <button onClick={() => router.push('/settings')} className="ml-auto text-amber-600 dark:text-amber-400 text-sm font-medium hover:underline">Settings</button>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 gradient-accent rounded-full flex items-center justify-center mb-6 shadow-lg shadow-accent/30">
                <Sparkles size={36} className="text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">Ask me anything</h2>
              <p className="text-text-secondary dark:text-text-secondary-dark mb-6 max-w-sm">I can help you manage expenses, tasks, notes, and more</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Add 500 for Zomato to food', 'Show my spending this week', 'Create a task to buy groceries'].map(s => (
                  <button key={s} onClick={() => setInput(s)} className="px-4 py-2 rounded-full text-sm bg-accent/5 border border-accent/20 text-accent hover:bg-accent/10 transition-colors">{s}</button>
                ))}
              </div>
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] px-4 py-3 rounded-2xl ${m.isUser ? 'gradient-accent text-white shadow-lg shadow-accent/20' : 'card'}`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="flex justify-start">
              <div className="card px-4 py-3 rounded-2xl flex gap-1.5">
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border-light dark:border-border-dark">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask Cortex..."
              className="input flex-1"
              disabled={!apiKey}
            />
            <button onClick={send} disabled={!apiKey || isTyping} className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent/25 disabled:opacity-50">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
