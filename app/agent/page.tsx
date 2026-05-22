'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { ALL_MODELS } from '@/constants';
import { Send, Trash2, Leaf, Sparkles, Copy, Check, Wallet, CheckSquare, BarChart3, StickyNote, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  toolUsed?: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: 'Add Expense', icon: Wallet, prompt: 'Add an expense: ', color: '#EF4444' },
  { label: 'Add Task', icon: CheckSquare, prompt: 'Create a task: ', color: '#3B82F6' },
  { label: 'Show Summary', icon: BarChart3, prompt: 'Show my spending summary for this month', color: '#8B5CF6' },
  { label: 'My Tasks', icon: StickyNote, prompt: 'Show my active tasks', color: '#F59E0B' },
];

const SUGGESTED_PROMPTS = [
  { category: 'Finance', prompts: ['Add 500 for Zomato to food', 'Show my spending this week', 'What\'s my top spending category?'] },
  { category: 'Tasks', prompts: ['Create a task to buy groceries', 'Show my pending tasks', 'Add a high priority task for tomorrow'] },
  { category: 'Notes', prompts: ['Create a note about today\'s meeting', 'Show my recent notes', 'Add a reminder for next Monday'] },
];

export default function AgentPage() {
  const [userId, setUserId] = useState<string>();
  const [apiKey, setApiKey] = useState('');
  const [modelId, setModelId] = useState('gemini-2.0-flash');
  const [provider, setProvider] = useState('gemini');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
      supabase.from('user_settings').select('gemini_api_key, groq_api_key, selected_model, ai_provider').eq('user_id', user.id).single().then(({ data }) => {
        if (data) {
          const p = data.ai_provider || 'gemini';
          setProvider(p);
          setApiKey(p === 'groq' ? (data.groq_api_key || '') : (data.gemini_api_key || ''));
          setModelId(data.selected_model || 'gemini-2.0-flash');
        }
      });
    });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  async function send(text?: string) {
    const msg = text || input;
    if (!msg.trim() || !apiKey) return;
    const userMsg: Message = { id: Date.now().toString(), text: msg, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history, modelId, apiKey, provider }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages(prev => [...prev, { id: Date.now().toString(), text: `Error: ${data.error}`, isUser: false, timestamp: new Date() }]);
      } else {
        // Detect tool usage from history
        const lastToolCall = data.history?.findLast?.((h: any) =>
          h.parts?.some((p: any) => p.functionCall)
        );
        const toolName = lastToolCall?.parts?.find((p: any) => p.functionCall)?.functionCall?.name;

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: data.text,
          isUser: false,
          toolUsed: toolName,
          timestamp: new Date(),
        }]);
        setHistory(data.history || []);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: `Error: ${e.message}`, isUser: false, timestamp: new Date() }]);
    }
    setIsTyping(false);
    inputRef.current?.focus();
  }

  function clearContext() {
    setMessages([]);
    setHistory([]);
  }

  function copyMessage(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleQuickAction(prompt: string) {
    setInput(prompt);
    inputRef.current?.focus();
  }

  const modelName = ALL_MODELS.find(m => m.id === modelId)?.name || modelId;

  return (
    <AppShell>
      <div className="flex flex-col h-screen max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
              <Sparkles size={20} strokeWidth={1.5} className="text-sage" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-semibold text-forest">Cortex AI</h1>
              <p className="text-xs text-mushroom tracking-wide">{modelName} · {messages.length} messages</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button onClick={clearContext} className="w-10 h-10 rounded-full bg-cream border border-stone/50 flex items-center justify-center text-text-secondary hover:text-terracotta hover:border-terracotta/30 transition-all duration-300" title="Clear context">
                <Trash2 size={16} strokeWidth={1.5} />
              </button>
            )}
          </div>
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
              <div className="w-20 h-20 rounded-full bg-sage/10 flex items-center justify-center mb-8 animate-float">
                <Sparkles size={36} strokeWidth={1.5} className="text-sage" />
              </div>
              <h2 className="font-serif text-3xl font-semibold text-forest mb-3">Ask me anything</h2>
              <p className="text-text-secondary max-w-md leading-relaxed mb-10">
                I can help you manage expenses, tasks, notes, and more. Just ask in plain English.
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 justify-center mb-10">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm bg-white border border-stone/50 text-text-secondary hover:text-forest hover:border-sage hover:shadow-botanical transition-all duration-300"
                  >
                    <action.icon size={16} strokeWidth={1.5} style={{ color: action.color }} />
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Suggested Prompts by Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl w-full">
                {SUGGESTED_PROMPTS.map((cat) => (
                  <div key={cat.category} className="text-left">
                    <p className="text-xs text-sage font-medium tracking-widest uppercase mb-3">{cat.category}</p>
                    <div className="space-y-2">
                      {cat.prompts.map((p) => (
                        <button
                          key={p}
                          onClick={() => { setInput(p); inputRef.current?.focus(); }}
                          className="w-full text-left px-4 py-2.5 rounded-xl text-sm bg-cream/50 border border-stone/30 text-text-secondary hover:text-forest hover:border-sage/50 transition-all duration-300"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'} group`}>
                <div className={`max-w-[80%] ${m.isUser ? 'order-1' : 'order-1'}`}>
                  {/* Tool Badge */}
                  {!m.isUser && m.toolUsed && (
                    <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                      <div className="w-5 h-5 rounded-full bg-sage/10 flex items-center justify-center">
                        <Sparkles size={10} className="text-sage" />
                      </div>
                      <span className="text-[10px] text-sage font-medium tracking-wider uppercase">{m.toolUsed}</span>
                    </div>
                  )}

                  <div
                    className={`px-5 py-3.5 rounded-2xl ${
                      m.isUser
                        ? 'bg-forest text-white rounded-br-md'
                        : 'bg-white border border-stone/50 text-forest rounded-bl-md'
                    }`}
                  >
                    {m.isUser ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</p>
                    ) : (
                      <div className="prose-botanical text-sm leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.text}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Message Actions */}
                  <div className={`flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${m.isUser ? 'justify-end mr-1' : 'ml-1'}`}>
                    <button
                      onClick={() => copyMessage(m.text, m.id)}
                      className="flex items-center gap-1 text-[10px] text-mushroom hover:text-sage transition-colors duration-300"
                    >
                      {copiedId === m.id ? <Check size={10} /> : <Copy size={10} />}
                      {copiedId === m.id ? 'Copied' : 'Copy'}
                    </button>
                    <span className="text-[10px] text-stone">
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
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

        {/* Quick Action Bar (when messages exist) */}
        {messages.length > 0 && (
          <div className="px-6 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-cream border border-stone/30 text-text-secondary hover:text-forest hover:border-sage/50 transition-all duration-300 whitespace-nowrap"
                >
                  <action.icon size={12} strokeWidth={1.5} style={{ color: action.color }} />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-stone/50">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask Cortex..."
              className="input-botanical flex-1"
              disabled={!apiKey}
            />
            <button onClick={() => send()} disabled={!apiKey || isTyping || !input.trim()} className="w-12 h-12 rounded-full bg-forest text-white flex items-center justify-center hover:bg-forest/90 transition-all duration-300 disabled:opacity-50 shadow-botanical">
              <Send size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
