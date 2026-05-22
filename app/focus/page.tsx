'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useTasks } from '@/hooks/useTasks';
import { Timer, Play, Pause, RotateCcw, SkipForward, CheckSquare, Leaf, Settings, X } from 'lucide-react';

type TimerMode = 'focus' | 'short' | 'long';

const DEFAULT_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const MODE_COLORS: Record<TimerMode, string> = {
  focus: '#2D3A31',
  short: '#8C9A84',
  long: '#C27B66',
};

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus',
  short: 'Short Break',
  long: 'Long Break',
};

const PRESETS: Record<TimerMode, { label: string; minutes: number }[]> = {
  focus: [
    { label: '15m', minutes: 15 },
    { label: '25m', minutes: 25 },
    { label: '30m', minutes: 30 },
    { label: '45m', minutes: 45 },
    { label: '60m', minutes: 60 },
    { label: '90m', minutes: 90 },
  ],
  short: [
    { label: '3m', minutes: 3 },
    { label: '5m', minutes: 5 },
    { label: '10m', minutes: 10 },
    { label: '15m', minutes: 15 },
  ],
  long: [
    { label: '10m', minutes: 10 },
    { label: '15m', minutes: 15 },
    { label: '20m', minutes: 20 },
    { label: '30m', minutes: 30 },
  ],
};

export default function FocusPage() {
  const [userId, setUserId] = useState<string>();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [durations, setDurations] = useState<Record<TimerMode, number>>(DEFAULT_DURATIONS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const { activeTasks } = useTasks(userId);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/signin'); return; }
      setUserId(user.id);
    });

    // Load saved durations from localStorage
    try {
      const saved = localStorage.getItem('cocus-focus-durations');
      if (saved) {
        const parsed = JSON.parse(saved);
        setDurations(parsed);
        setTimeLeft(parsed.focus);
      }
    } catch {}
  }, []);

  // Save durations to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('cocus-focus-durations', JSON.stringify(durations));
    } catch {}
  }, [durations]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handleTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleTimerEnd = useCallback(() => {
    setIsRunning(false);
    if (mode === 'focus') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      if (newSessions % 4 === 0) {
        switchMode('long');
      } else {
        switchMode('short');
      }
    } else {
      switchMode('focus');
    }
  }, [mode, sessions]);

  function switchMode(newMode: TimerMode) {
    setMode(newMode);
    setTimeLeft(durations[newMode]);
    setIsRunning(false);
  }

  function toggleTimer() {
    setIsRunning(!isRunning);
  }

  function resetTimer() {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  }

  function skipTimer() {
    handleTimerEnd();
  }

  function setDuration(m: TimerMode, minutes: number) {
    const clamped = Math.max(1, Math.min(180, minutes));
    const newDurations = { ...durations, [m]: clamped * 60 };
    setDurations(newDurations);
    if (m === mode && !isRunning) {
      setTimeLeft(clamped * 60);
    }
  }

  function applyCustomInput() {
    const mins = parseInt(customInput);
    if (!isNaN(mins) && mins > 0) {
      setDuration(mode, mins);
      setCustomInput('');
      setShowSettings(false);
    }
  }

  // Format time
  const totalDuration = durations[mode];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = totalDuration > 0 ? 1 - timeLeft / totalDuration : 0;

  // Circle dimensions
  const size = 260;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  if (!mounted || !userId) return null;

  return (
    <AppShell>
      <div className="px-4 sm:px-6 md:px-12 lg:px-16 py-8 sm:py-12 md:py-16 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 sm:mb-16">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sage/10 flex items-center justify-center">
              <Timer size={20} strokeWidth={1.5} className="text-sage" />
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-semibold text-forest tracking-tight">
              Focus
            </h1>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-cream border border-stone/50 flex items-center justify-center text-text-secondary hover:text-forest transition-colors"
            title="Timer Settings"
          >
            <Settings size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Duration Settings Panel */}
        {showSettings && (
          <div className="mb-8 sm:mb-12 bg-white rounded-card border border-stone/50 p-5 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-forest">Customize Durations</h2>
              <button onClick={() => setShowSettings(false)} className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-mushroom hover:text-forest">
                <X size={16} />
              </button>
            </div>

            {/* Preset buttons for current mode */}
            <div className="mb-6">
              <p className="text-xs text-sage font-medium tracking-widest uppercase mb-3">
                {MODE_LABELS[mode]} Presets
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESETS[mode].map(p => (
                  <button
                    key={p.minutes}
                    onClick={() => setDuration(mode, p.minutes)}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      durations[mode] === p.minutes * 60
                        ? 'bg-forest text-white shadow-botanical'
                        : 'bg-cream text-text-secondary hover:bg-stone/50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom input */}
            <div className="mb-6">
              <p className="text-xs text-sage font-medium tracking-widest uppercase mb-3">
                Custom {MODE_LABELS[mode]} Time
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyCustomInput()}
                    className="input-botanical pr-16"
                    placeholder={`e.g. ${mode === 'focus' ? '35' : '8'}`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-mushroom">min</span>
                </div>
                <button onClick={applyCustomInput} className="btn-botanical px-6">Set</button>
              </div>
            </div>

            {/* All modes overview */}
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(MODE_LABELS) as TimerMode[]).map(m => (
                <div key={m} className="text-center p-3 bg-cream/50 rounded-xl">
                  <p className="text-[10px] text-mushroom tracking-wider uppercase mb-1">{MODE_LABELS[m]}</p>
                  <p className="font-serif text-lg font-semibold text-forest">{Math.floor(durations[m] / 60)}m</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center">
          {/* Mode Selector */}
          <div className="flex gap-1.5 sm:gap-2 mb-10 sm:mb-12 p-1 sm:p-1.5 bg-cream rounded-full border border-stone/30">
            {(['focus', 'short', 'long'] as TimerMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 ${
                  mode === m
                    ? 'bg-white text-forest shadow-botanical'
                    : 'text-text-secondary'
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>

          {/* Timer Circle */}
          <div className="relative mb-10 sm:mb-12 w-[240px] sm:w-[260px] max-w-[80vw] aspect-square">
            <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
              <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E6E2DA" strokeWidth={strokeWidth} />
              <circle
                cx={size / 2} cy={size / 2} r={radius}
                fill="none" stroke={MODE_COLORS[mode]} strokeWidth={strokeWidth}
                strokeLinecap="round" strokeDasharray={circumference}
                strokeDashoffset={dashOffset} className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-forest tabular-nums">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-xs sm:text-sm text-text-secondary mt-1.5 sm:mt-2 tracking-wider uppercase">
                {MODE_LABELS[mode]} · {Math.floor(durations[mode] / 60)}m
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 sm:gap-4 mb-10 sm:mb-12">
            <button onClick={resetTimer} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cream border border-stone/50 flex items-center justify-center text-text-secondary active:text-forest transition-colors" title="Reset">
              <RotateCcw size={18} strokeWidth={1.5} />
            </button>
            <button onClick={toggleTimer} className="w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-botanical-xl active:scale-95" style={{ backgroundColor: MODE_COLORS[mode] }}>
              {isRunning ? <Pause size={26} strokeWidth={1.5} /> : <Play size={26} strokeWidth={1.5} className="ml-0.5" />}
            </button>
            <button onClick={skipTimer} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cream border border-stone/50 flex items-center justify-center text-text-secondary active:text-forest transition-colors" title="Skip">
              <SkipForward size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Session Counter */}
          <div className="flex items-center gap-3 mb-10 sm:mb-12">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-3 h-3 rounded-full transition-all duration-500 ${i < sessions % 4 ? 'bg-sage' : 'bg-stone'}`} />
            ))}
            <span className="text-xs sm:text-sm text-text-secondary ml-2">
              {sessions} session{sessions !== 1 ? 's' : ''} completed
            </span>
          </div>

          {/* Task Selector */}
          {activeTasks.length > 0 && (
            <div className="w-full max-w-md card-botanical p-4 sm:p-6 mb-6">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <CheckSquare size={16} strokeWidth={1.5} className="text-sage" />
                <span className="text-xs sm:text-sm font-medium text-forest">Focus on a task</span>
              </div>
              <select value={selectedTaskId} onChange={e => setSelectedTaskId(e.target.value)} className="input-botanical text-sm">
                <option value="">Select a task...</option>
                {activeTasks.filter(t => !t.is_completed).map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tip */}
          <div className="rounded-card p-4 bg-sage/5 border border-sage/20 max-w-md text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Leaf size={14} className="text-sage" />
              <span className="text-[10px] sm:text-xs font-medium text-sage tracking-wider uppercase">Focus Tip</span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary">
              {mode === 'focus'
                ? `Stay focused for ${Math.floor(durations.focus / 60)} minutes. No distractions.`
                : 'Take a real break. Stand up, stretch, or grab a drink.'}
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
