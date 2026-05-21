'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { GEMINI_MODELS } from '@/constants';
import { Send, Trash2, Leaf, Sparkles } from 'lucide-react';

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
        <div className="flex items-center justify-between p-6 border-b border-stone/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
              <Leaf size={20} strokeWidth={1.5} className="text-sage" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-semibold text-forest">AI Agent</h1>
              <p className="text-xs text-mushroom tracking-wide">{modelName}</p>
            </div>
          </div>
          <button onClick={clearContext} className="w-10 h-10 rounded-full bg-cream border border-stone/50 flex items-center justify-center text-text-secondary hover:text-terracotta hover:border-terracotta/30 transition-all duration-300" title="Clear context">
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* API Key warning */}
        {!apiKey && (
          <div className="mx-6 mt-6 p-4 bg-cream border border-stone/50 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} strokeWidth={1.5} className="text-terracotta" />
            </div>
            <span className="text-sm text-text-secondary">Set your Gemini API key in Settings to use the AI agent</span>
            <button onClick={() => router.push('/settings')} className="ml-auto text-sm text-sage font-medium hover:text-terracotta transition-colors duration-300 tracking-wide uppercase">Settings</button>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-sage/10 flex items-center justify-center mb-8">
                <Sparkles size={36} strokeWidth={1.5} className="text-sage" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-forest mb-3">Ask me anything</h2>
              <p className="text-text-secondary max-w-sm leading-relaxed mb-8">I can help you manage expenses, tasks, notes, and more</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {['Add 500 for Zomato to food', 'Show my spending this week', 'Create a task to buy groceries'].map(s => (
                  <button key={s} onClick={() => setInput(s)} className="px-5 py-2.5 rounded-full text-sm bg-cream border border-stone/50 text-text-secondary hover:text-forest hover:border-sage transition-all duration-300">{s}</button>
                ))}
              </div>
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] px-5 py-3.5 rounded-2xl ${m.isUser ? 'bg-forest text-white rounded-br-md' : 'bg-white border border-stone/50 text-forest rounded-bl-md'}`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-stone/50 px-5 py-3.5 rounded-2xl rounded-bl-md flex gap-2">
                <span className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                <span className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-stone/50">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask Cortex..."
              className="input-botanical flex-1"
              disabled={!apiKey}
            />
            <button onClick={send} disabled={!apiKey || isTyping} className="w-12 h-12 rounded-full bg-forest text-white flex items-center justify-center hover:bg-forest/90 transition-all duration-300 disabled:opacity-50 shadow-botanical">
              <Send size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
