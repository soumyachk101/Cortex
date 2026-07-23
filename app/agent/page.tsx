'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { ALL_MODELS, GEMINI_MODELS, GROQ_MODELS } from '@/constants';
import {
  Send, Trash2, Sparkles, Copy, Check, Wallet, CheckSquare,
  BarChart3, StickyNote, Plus, MessageSquare, History, X, PanelLeft,
  Camera, Mic, MicOff, Paperclip, FileText, RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  toolUsed?: string;
  imageUrl?: string;
  fileName?: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface FilePayload {
  data: string; // base64
  mimeType: string;
  previewUrl: string;
  fileName: string;
}

const QUICK_ACTIONS = [
  { label: 'Scan Receipt', icon: Camera, prompt: '', isScan: true, color: '#10B981' },
  { label: 'Add Expense', icon: Wallet, prompt: 'Add an expense: ', color: '#EF4444' },
  { label: 'Add Task', icon: CheckSquare, prompt: 'Create a task: ', color: '#3B82F6' },
  { label: 'Summary', icon: BarChart3, prompt: 'Show my spending summary for this month', color: '#8B5CF6' },
  { label: 'My Tasks', icon: StickyNote, prompt: 'Show my active tasks', color: '#F59E0B' },
];

const SUGGESTED_PROMPTS = [
  { category: 'Finance', prompts: ['Add 500 for Zomato to food', 'Show my spending this week', 'What\'s my top spending category?'] },
  { category: 'Tasks', prompts: ['Create a task to buy groceries', 'Show my pending tasks', 'Add a high priority task for tomorrow'] },
  { category: 'Notes', prompts: ['Create a note about today\'s meeting', 'Show my recent notes', 'Add a reminder for next Monday'] },
];

function groupSessionsByDate(sessions: ChatSession[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const groups: { [key: string]: ChatSession[] } = {
    'Today': [],
    'Yesterday': [],
    'Previous 7 Days': [],
    'Older': [],
  };

  sessions.forEach(s => {
    const d = new Date(s.updated_at || s.created_at);
    if (d >= today) {
      groups['Today'].push(s);
    } else if (d >= yesterday) {
      groups['Yesterday'].push(s);
    } else if (d >= sevenDaysAgo) {
      groups['Previous 7 Days'].push(s);
    } else {
      groups['Older'].push(s);
    }
  });

  return Object.entries(groups).filter(([_, items]) => items.length > 0);
}

function AgentContent() {
  const [userId, setUserId] = useState<string>();
  const [apiKey, setApiKey] = useState('');
  const [modelId, setModelId] = useState('gemini-2.5-flash');
  const [provider, setProvider] = useState('gemini');

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Vision OCR, File & Voice states
  const [selectedFile, setSelectedFile] = useState<FilePayload | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Live Camera Modal states
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const autoPrompt = searchParams.get('prompt');
  const autoNew = searchParams.get('new');

  // Load user settings & sessions
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/signin'); return; }
      setUserId(user.id);

      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setShowHistory(false);
      }

      let p = 'gemini';
      let m = 'gemini-2.5-flash';
      let key = '';

      const { data } = await supabase
        .from('user_settings')
        .select('gemini_api_key, selected_model')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        const raw = data.selected_model || 'gemini-2.5-flash';
        if (raw.startsWith('groq:')) {
          p = 'groq';
          const extracted = raw.replace('groq:', '');
          m = GROQ_MODELS.some(x => x.id === extracted) ? extracted : 'llama-3.3-70b-versatile';
        } else {
          m = GEMINI_MODELS.some(x => x.id === raw) ? raw : 'gemini-2.5-flash';
        }
        setProvider(p);
        setModelId(m);

        const rawKey = data.gemini_api_key || '';
        try {
          const parsed = JSON.parse(rawKey);
          if (typeof parsed === 'object' && parsed !== null) {
            key = p === 'groq' ? (parsed.groq || '') : (parsed.gemini || '');
          } else {
            key = p === 'gemini' ? rawKey : '';
          }
        } catch {
          key = p === 'gemini' ? rawKey : '';
        }
        setApiKey(key.trim());
      }

      // Check if URL specifies starting a new chat or auto prompt
      if (autoNew === 'true') {
        setActiveSessionId(null);
        setMessages([]);
        setHistory([]);
      } else {
        fetchSessions(user.id, true);
      }

      // If autoPrompt is passed in query string, trigger send automatically
      if (autoPrompt && key.trim()) {
        sendAutoPrompt(autoPrompt, key.trim(), p, m, user.id);
      }
    });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Clean up live camera stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  async function fetchSessions(uid: string, autoSelectLatest = false) {
    try {
      const { data: storedSessions } = await supabase
        .from('chat_sessions')
        .select('id, title, created_at, updated_at')
        .eq('user_id', uid)
        .order('updated_at', { ascending: false });

      if (storedSessions) {
        setSessions(storedSessions);
        if (autoSelectLatest && storedSessions.length > 0) {
          selectSession(storedSessions[0].id);
        }
      }
    } catch (e) {
      console.warn('Failed to load sessions:', e);
    }
  }

  async function selectSession(sessionId: string) {
    setActiveSessionId(sessionId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setShowHistory(false);
    }
    try {
      const { data: storedMsgs } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at, tool_used')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (storedMsgs) {
        setMessages(
          storedMsgs.map(m => ({
            id: m.id,
            text: m.content,
            isUser: m.role === 'user',
            toolUsed: m.tool_used || undefined,
            timestamp: new Date(m.created_at),
          }))
        );
        setHistory(
          storedMsgs.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          }))
        );
      }
    } catch (e) {
      console.warn('Failed to load session messages:', e);
    }
  }

  function startNewChat() {
    setActiveSessionId(null);
    setMessages([]);
    setHistory([]);
    setSelectedFile(null);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setShowHistory(false);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function deleteSession(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!userId) return;

    try {
      await supabase.from('chat_messages').delete().eq('session_id', sessionId);
      await supabase.from('chat_sessions').delete().eq('id', sessionId);

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        startNewChat();
      }
    } catch (err) {
      console.warn('Failed to delete session:', err);
    }
  }

  // Auto send prompt from query parameter
  async function sendAutoPrompt(promptText: string, key: string, p: string, m: string, uid: string) {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: promptText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages([userMessage]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          history: [],
          modelId: m,
          apiKey: key,
          provider: p,
          sessionId: null,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `Error: ${data.error}`,
          isUser: false,
          timestamp: new Date(),
        }]);
      } else {
        const lastToolCall = data.history?.findLast?.((h: any) => h.parts?.some((prt: any) => prt.functionCall));
        const toolName = lastToolCall?.parts?.find((prt: any) => prt.functionCall)?.functionCall?.name;
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: data.text,
          isUser: false,
          toolUsed: toolName,
          timestamp: new Date(),
        }]);
        setHistory(data.history || []);

        if (data.sessionId) {
          setActiveSessionId(data.sessionId);
          fetchSessions(uid);
        }
      }
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: `Error: ${e.message}`,
        isUser: false,
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  }

  // Open Live Camera Modal
  async function openLiveCamera() {
    setCameraError(null);
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access permission denied or camera not found.');
    }
  }

  // Close Live Camera
  function closeLiveCamera() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setShowCameraModal(false);
    setCameraError(null);
  }

  // Capture Photo from Live Camera
  function capturePhotoFromCamera() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      const base64Data = dataUrl.split(',')[1];
      setSelectedFile({
        data: base64Data,
        mimeType: 'image/jpeg',
        previewUrl: dataUrl,
        fileName: 'Live Camera Capture.jpg',
      });
    }
    closeLiveCamera();
  }

  // Handle File Selection (Photo or PDF)
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setSelectedFile({
        data: base64Data,
        mimeType,
        previewUrl: mimeType.startsWith('image/') ? result : '',
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  }

  // Handle Voice Input (Speech to Text)
  function toggleVoiceInput() {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }

  async function send(text?: string) {
    const msg = text || input;
    if ((!msg.trim() && !selectedFile) || isTyping) return;

    if (!apiKey) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Please set your API key in **Settings** to chat with Cortex AI.',
        isUser: false,
        timestamp: new Date(),
      }]);
      return;
    }

    const isPdf = selectedFile?.mimeType === 'application/pdf';
    const userMessageText = selectedFile
      ? (msg ? `[Attached: ${selectedFile.fileName}] ${msg}` : `📷 Analyzing ${selectedFile.fileName}...`)
      : msg;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      isUser: true,
      imageUrl: !isPdf ? selectedFile?.previewUrl : undefined,
      fileName: selectedFile?.fileName,
      timestamp: new Date(),
    };

    const filePayload = selectedFile ? { data: selectedFile.data, mimeType: selectedFile.mimeType } : undefined;

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedFile(null);
    setIsTyping(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history,
          modelId,
          apiKey,
          provider,
          sessionId: activeSessionId,
          image: filePayload,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `Error: ${data.error}`,
          isUser: false,
          timestamp: new Date(),
        }]);
      } else {
        const lastToolCall = data.history?.findLast?.((h: any) => h.parts?.some((p: any) => p.functionCall));
        const toolName = lastToolCall?.parts?.find((p: any) => p.functionCall)?.functionCall?.name;
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: data.text,
          isUser: false,
          toolUsed: toolName,
          timestamp: new Date(),
        }]);
        setHistory(data.history || []);

        if (data.sessionId) {
          setActiveSessionId(data.sessionId);
          if (userId) fetchSessions(userId);
        }
      }
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: `Error: ${e.message}`,
        isUser: false,
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  }

  function copyMessage(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleQuickAction(action: typeof QUICK_ACTIONS[0]) {
    if (action.isScan) {
      fileInputRef.current?.click();
    } else {
      setInput(action.prompt);
      inputRef.current?.focus();
    }
  }

  const modelName = ALL_MODELS.find(m => m.id === modelId)?.name || modelId;
  const groupedSessions = groupSessionsByDate(sessions);

  return (
    <AppShell>
      <div className="flex h-[calc(100svh-5rem)] md:h-screen overflow-hidden bg-alabaster relative">

        {/* Hidden File Input for PDF / Photo Selection */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Live Camera Modal */}
        {showCameraModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 max-w-md w-full shadow-2xl relative flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-4">
                <h3 className="font-serif text-lg font-semibold text-forest dark:text-white flex items-center gap-2">
                  <Camera size={18} className="text-sage" />
                  <span>Live Camera Capture</span>
                </h3>
                <button onClick={closeLiveCamera} className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-text-secondary hover:text-terracotta">
                  <X size={16} />
                </button>
              </div>

              {cameraError ? (
                <div className="py-12 px-4 text-center">
                  <p className="text-sm text-terracotta mb-4">{cameraError}</p>
                  <button onClick={openLiveCamera} className="px-4 py-2 bg-sage text-white rounded-full text-xs font-medium">Try Again</button>
                </div>
              ) : (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black mb-5 shadow-inner border border-stone/30">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-white/20 rounded-2xl pointer-events-none" />
                </div>
              )}

              {!cameraError && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={capturePhotoFromCamera}
                    className="flex items-center gap-2 px-6 py-3 bg-forest text-white rounded-full text-sm font-medium hover:bg-forest/90 transition-all shadow-botanical active:scale-95"
                  >
                    <Camera size={18} />
                    <span>Snap Photo</span>
                  </button>
                  <button
                    onClick={closeLiveCamera}
                    className="px-5 py-3 bg-cream text-text-secondary rounded-full text-sm font-medium hover:bg-stone/20"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Backdrop for mobile drawer */}
        {showHistory && (
          <div
            className="fixed inset-0 bg-forest/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setShowHistory(false)}
          />
        )}

        {/* History Sidebar (Gemini/ChatGPT Style) */}
        <aside className={`
          fixed lg:relative inset-y-0 left-0 z-40
          w-72 sm:w-80 bg-white border-r border-stone/50
          flex flex-col transition-all duration-300 ease-in-out flex-shrink-0
          ${showHistory ? 'translate-x-0 lg:ml-0' : '-translate-x-full lg:-ml-72 sm:lg:-ml-80'}
        `}>
          {/* Sidebar Header: New Chat Button */}
          <div className="p-4 border-b border-stone/30 flex items-center justify-between gap-2">
            <button
              onClick={startNewChat}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-forest text-white text-sm font-medium hover:bg-forest/90 transition-all shadow-botanical active:scale-[0.98]"
            >
              <Plus size={18} />
              <span>New Chat</span>
            </button>
            <button
              onClick={() => setShowHistory(false)}
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-cream"
            >
              <X size={18} />
            </button>
          </div>

          {/* History List Grouped by Date */}
          <div className="flex-1 overflow-y-auto p-3 space-y-6">
            {sessions.length === 0 ? (
              <div className="text-center py-10 px-4">
                <History size={24} className="mx-auto text-mushroom/60 mb-2" />
                <p className="text-xs text-mushroom">No chat history yet</p>
              </div>
            ) : (
              groupedSessions.map(([groupName, groupItems]) => (
                <div key={groupName} className="space-y-1">
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-sage mb-2">
                    {groupName}
                  </p>
                  {groupItems.map((s) => {
                    const isActive = s.id === activeSessionId;
                    return (
                      <div
                        key={s.id}
                        onClick={() => selectSession(s.id)}
                        className={`
                          group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer
                          text-xs transition-all duration-200
                          ${isActive
                            ? 'bg-sage/15 text-forest font-semibold border border-sage/30 shadow-sm'
                            : 'text-text-secondary hover:bg-cream hover:text-forest'
                          }
                        `}
                      >
                        <MessageSquare size={14} className={`flex-shrink-0 ${isActive ? 'text-sage' : 'text-mushroom'}`} />
                        <span className="truncate flex-1 pr-6">{s.title || 'Untitled Chat'}</span>
                        <button
                          onClick={(e) => deleteSession(s.id, e)}
                          className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-mushroom hover:text-terracotta transition-opacity rounded-md hover:bg-white/80"
                          title="Delete chat"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

          {/* Top Header */}
          <div className="flex-none flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-stone/50 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all ${
                  showHistory ? 'bg-forest text-white border-forest shadow-sm' : 'bg-cream border-stone/50 text-text-secondary hover:text-forest'
                }`}
                title="Toggle Chat History"
              >
                <PanelLeft size={18} />
              </button>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} strokeWidth={1.5} className="text-sage" />
              </div>
              <div className="min-w-0">
                <h1 className="font-serif text-base sm:text-xl font-semibold text-forest truncate">Cortex AI</h1>
                <p className="text-[10px] sm:text-xs text-mushroom tracking-wide">{modelName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openLiveCamera}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-sage/10 text-sage hover:bg-sage/20 transition-colors"
                title="Live Camera Photo"
              >
                <Camera size={14} />
                <span>Live Camera</span>
              </button>
              <button
                onClick={startNewChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-cream border border-stone/50 text-forest hover:bg-sage/10 transition-colors"
              >
                <Plus size={14} />
                <span>New</span>
              </button>
            </div>
          </div>

          {/* API Key warning */}
          {!apiKey && (
            <div className="flex-none mx-3 sm:mx-6 mt-3 sm:mt-4 p-3 sm:p-4 bg-cream border border-stone/50 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} strokeWidth={1.5} className="text-terracotta" />
              </div>
              <span className="text-xs sm:text-sm text-text-secondary flex-1">Set your Gemini or Groq API key in Settings</span>
              <button onClick={() => router.push('/settings')} className="text-xs sm:text-sm text-sage font-medium flex-shrink-0">Settings</button>
            </div>
          )}

          {/* Chat Messages */}
          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-6 py-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-full text-center py-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-sage/10 flex items-center justify-center mb-6 sm:mb-8 animate-float">
                  <Sparkles size={28} strokeWidth={1.5} className="text-sage" />
                </div>
                <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-semibold text-forest mb-2 sm:mb-3">Ask me anything</h2>
                <p className="text-text-secondary max-w-sm sm:max-w-md leading-relaxed mb-6 sm:mb-10 text-sm sm:text-base px-2">
                  Manage expenses, tasks, notes, or scan PDFs & receipts with AI. Just ask in plain English or Hindi.
                </p>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 justify-center mb-6 sm:mb-8 px-2">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action)}
                      className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm bg-white border border-stone/50 text-text-secondary active:bg-cream active:border-sage transition-all duration-200"
                    >
                      <action.icon size={14} strokeWidth={1.5} style={{ color: action.color }} />
                      {action.label}
                    </button>
                  ))}
                </div>

                {/* Suggested Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-2xl w-full px-2">
                  {SUGGESTED_PROMPTS.map((cat) => (
                    <div key={cat.category} className="text-left">
                      <p className="text-[10px] sm:text-xs text-sage font-medium tracking-widest uppercase mb-2">{cat.category}</p>
                      <div className="space-y-1.5">
                        {cat.prompts.map((p) => (
                          <button
                            key={p}
                            onClick={() => { setInput(p); inputRef.current?.focus(); }}
                            className="w-full text-left px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm bg-cream/50 border border-stone/30 text-text-secondary active:bg-cream active:border-sage/50 transition-all duration-200"
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
                  <div className="max-w-[85%] sm:max-w-[80%]">
                    {!m.isUser && m.toolUsed && (
                      <div className="flex items-center gap-1.5 mb-1 ml-1">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-sage/10 flex items-center justify-center">
                          <Sparkles size={9} className="text-sage" />
                        </div>
                        <span className="text-[9px] sm:text-[10px] text-sage font-medium tracking-wider uppercase">{m.toolUsed}</span>
                      </div>
                    )}

                    <div className={`px-3.5 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl ${m.isUser ? 'bg-forest text-white rounded-br-md' : 'bg-white border border-stone/50 text-forest rounded-bl-md'}`}>
                      {m.imageUrl && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-white/20 max-w-[200px]">
                          <img src={m.imageUrl} alt="Uploaded attachment" className="w-full h-auto object-cover" />
                        </div>
                      )}
                      {m.fileName && !m.imageUrl && (
                        <div className="mb-2 flex items-center gap-2 p-2 rounded-lg bg-white/10 border border-white/20">
                          <FileText size={16} className="text-amber-300" />
                          <span className="text-xs font-medium truncate">{m.fileName}</span>
                        </div>
                      )}
                      {m.isUser ? (
                        <p className="whitespace-pre-wrap text-[13px] sm:text-sm leading-relaxed break-words">{m.text}</p>
                      ) : (
                        <div className="prose-botanical text-[13px] sm:text-sm leading-relaxed break-words">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>

                    <div className={`flex items-center gap-2 mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 ${m.isUser ? 'justify-end mr-1' : 'ml-1'}`}>
                      <button onClick={() => copyMessage(m.text, m.id)} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] text-mushroom active:text-sage">
                        {copiedId === m.id ? <Check size={11} /> : <Copy size={11} />}
                        {copiedId === m.id ? 'Copied' : 'Copy'}
                      </button>
                      <span className="text-[10px] sm:text-[11px] text-stone">
                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone/50 px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5">
                  <span className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <span className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Attachment Preview Bar if file/image is selected */}
          {selectedFile && (
            <div className="flex-none px-3 sm:px-6 py-2 bg-cream/90 border-t border-stone/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {selectedFile.mimeType.startsWith('image/') ? (
                  <img src={selectedFile.previewUrl} alt="Attachment preview" className="w-10 h-10 rounded-lg object-cover border border-stone/50" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
                    <FileText size={20} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-forest truncate">{selectedFile.fileName}</p>
                  <p className="text-[10px] text-mushroom">
                    {selectedFile.mimeType === 'application/pdf' ? 'PDF Document ready for AI analysis' : 'Image ready for AI OCR scan'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedFile(null)} className="p-1 rounded-full text-mushroom hover:text-terracotta">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Quick Action Bar when in active chat */}
          {messages.length > 0 && (
            <div className="flex-none px-3 sm:px-6 pb-1">
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] sm:text-xs bg-cream border border-stone/30 text-text-secondary active:bg-white active:border-sage/50 whitespace-nowrap flex-shrink-0"
                  >
                    <action.icon size={12} strokeWidth={1.5} style={{ color: action.color }} />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="flex-none px-3 sm:px-6 py-3 sm:py-4 border-t border-stone/50 bg-white safe-area-bottom">
            <div className="flex gap-1.5 sm:gap-2 items-end">

              {/* 📷 Live Camera Button */}
              <button
                type="button"
                onClick={openLiveCamera}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-cream border border-stone/50 flex items-center justify-center text-text-secondary hover:text-sage hover:border-sage transition-colors flex-shrink-0"
                title="Take Live Camera Photo"
              >
                <Camera size={18} strokeWidth={1.5} />
              </button>

              {/* 📎 File Attachment Button (PDF or Photo) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-cream border border-stone/50 flex items-center justify-center text-text-secondary hover:text-forest hover:border-sage transition-colors flex-shrink-0"
                title="Attach Photo or PDF Document"
              >
                <Paperclip size={18} strokeWidth={1.5} />
              </button>

              {/* 🎙️ Voice Input Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center transition-all flex-shrink-0 ${
                  isListening
                    ? 'bg-terracotta text-white border-terracotta animate-pulse'
                    : 'bg-cream border-stone/50 text-text-secondary hover:text-forest'
                }`}
                title={isListening ? 'Listening...' : 'Voice Input'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} strokeWidth={1.5} />}
              </button>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                placeholder={isListening ? 'Listening...' : 'Ask Cortex or attach PDF/Photo...'}
                className="flex-1 min-w-0 px-4 py-2.5 sm:py-3 bg-cream border border-stone/50 rounded-full text-sm text-forest placeholder:text-mushroom focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/30 transition-all duration-300"
                disabled={!apiKey}
                autoComplete="off"
              />

              <button
                onClick={() => send()}
                disabled={!apiKey || isTyping || (!input.trim() && !selectedFile)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-95 transition-all duration-200"
              >
                <Send size={17} strokeWidth={1.5} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}

export default function AgentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-alabaster">
        <div className="w-8 h-8 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />
      </div>
    }>
      <AgentContent />
    </Suspense>
  );
}
