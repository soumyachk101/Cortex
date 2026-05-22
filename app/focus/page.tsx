'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useTasks } from '@/hooks/useTasks';
import { Timer, Play, Pause, RotateCcw, SkipForward, CheckSquare, Leaf } from 'lucide-react';

type TimerMode = 'focus' | 'short' | 'long';

const MODES: Record<TimerMode, { label: string; duration: number; color: string }> = {
  focus: { label: 'Focus', duration: 25 * 60, color: '#2D3A31' },
  short: { label: 'Short Break', duration: 5 * 60, color: '#8C9A84' },
  long: { label: 'Long Break', duration: 15 * 60, color: '#C27B66' },
};

export default function FocusPage() {
  const [userId, setUserId] = useState<string>();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const { activeTasks } = useTasks(userId);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
    });
  }, []);

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
      setSessions(prev => prev + 1);
      // Auto switch to break
      const newSessions = sessions + 1;
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
    setTimeLeft(MODES[newMode].duration);
    setIsRunning(false);
  }

  function toggleTimer() {
    setIsRunning(!isRunning);
  }

  function resetTimer() {
    setIsRunning(false);
    setTimeLeft(MODES[mode].duration);
  }

  function skipTimer() {
    handleTimerEnd();
  }

  // Format time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / MODES[mode].duration;

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
        </div>

        <div className="flex flex-col items-center">
          {/* Mode Selector */}
          <div className="flex gap-2 mb-12 p-1.5 bg-cream rounded-full border border-stone/30">
            {(Object.keys(MODES) as TimerMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
                  mode === m
                    ? 'bg-white text-forest shadow-botanical'
                    : 'text-text-secondary hover:text-forest'
                }`}
              >
                {MODES[m].label}
              </button>
            ))}
          </div>

          {/* Timer Circle */}
          <div className="relative mb-10 sm:mb-12 w-[260px] max-w-[80vw] aspect-square">
            <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#E6E2DA"
                strokeWidth={strokeWidth}
              />
              {/* Progress circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={MODES[mode].color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-forest tabular-nums">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-sm text-text-secondary mt-2 tracking-wider uppercase">{MODES[mode].label}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-12">
            <button
              onClick={resetTimer}
              className="w-14 h-14 rounded-full bg-cream border border-stone/50 flex items-center justify-center text-text-secondary hover:text-forest hover:border-sage/50 transition-all duration-300"
              title="Reset"
            >
              <RotateCcw size={20} strokeWidth={1.5} />
            </button>
            <button
              onClick={toggleTimer}
              className="w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-botanical-xl"
              style={{ backgroundColor: MODES[mode].color }}
            >
              {isRunning ? <Pause size={28} strokeWidth={1.5} /> : <Play size={28} strokeWidth={1.5} className="ml-1" />}
            </button>
            <button
              onClick={skipTimer}
              className="w-14 h-14 rounded-full bg-cream border border-stone/50 flex items-center justify-center text-text-secondary hover:text-forest hover:border-sage/50 transition-all duration-300"
              title="Skip"
            >
              <SkipForward size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Session Counter */}
          <div className="flex items-center gap-3 mb-12">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  i < sessions % 4 ? 'bg-sage' : 'bg-stone'
                }`}
              />
            ))}
            <span className="text-sm text-text-secondary ml-2">
              {sessions} session{sessions !== 1 ? 's' : ''} completed
            </span>
          </div>

          {/* Task Selector */}
          {activeTasks.length > 0 && (
            <div className="w-full max-w-md card-botanical p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckSquare size={18} strokeWidth={1.5} className="text-sage" />
                <span className="text-sm font-medium text-forest">Focus on a task</span>
              </div>
              <select
                value={selectedTaskId}
                onChange={e => setSelectedTaskId(e.target.value)}
                className="input-botanical text-sm"
              >
                <option value="">Select a task...</option>
                {activeTasks.filter(t => !t.is_completed).map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tip */}
          <div className="mt-8 rounded-card p-4 bg-sage/5 border border-sage/20 max-w-md text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Leaf size={14} className="text-sage" />
              <span className="text-xs font-medium text-sage tracking-wider uppercase">Focus Tip</span>
            </div>
            <p className="text-sm text-text-secondary">
              {mode === 'focus'
                ? 'Stay focused for 25 minutes. No distractions. You can check messages during your break.'
                : 'Take a real break. Stand up, stretch, or grab a drink. Your brain needs rest to stay sharp.'}
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
