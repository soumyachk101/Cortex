'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { GEMINI_MODELS, CURRENCIES } from '@/constants';
import { useTheme } from 'next-themes';
import { Moon, Sun, Key, Bot, Wallet, Info, Check } from 'lucide-react';

export default function SettingsPage() {
  const [userId, setUserId] = useState<string>();
  const [settings, setSettings] = useState({ currency_symbol: '₹', budget_limit: 0, gemini_api_key: '', selected_model: 'gemini-2.0-flash' });
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
      supabase.from('user_settings').select('*').eq('user_id', user.id).single().then(({ data }) => {
        if (data) {
          setSettings(data);
          setBudgetInput(data.budget_limit > 0 ? data.budget_limit.toString() : '');
          setApiKeyInput(data.gemini_api_key || '');
        }
      });
    });
  }, []);

  async function updateSetting(key: string, value: any) {
    if (!userId) return;
    await supabase.from('user_settings').upsert({ user_id: userId, [key]: value });
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  if (!userId) return null;

  const currentModel = GEMINI_MODELS.find(m => m.id === settings.selected_model) || GEMINI_MODELS[0];

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        {/* Appearance */}
        <h2 className="text-sm font-semibold text-accent mb-3 tracking-wide">APPEARANCE</h2>
        <div className="card mb-6">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                {theme === 'dark' ? <Moon size={18} className="text-amber-500" /> : <Sun size={18} className="text-amber-500" />}
              </div>
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Switch between light and dark</p>
              </div>
            </div>
            <button onClick={() => { const next = theme === 'dark' ? 'light' : 'dark'; setTheme(next); updateSetting('theme', next); }} className={`w-12 h-7 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-accent' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${theme === 'dark' ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Currency */}
        <h2 className="text-sm font-semibold text-accent mb-3 tracking-wide">CURRENCY</h2>
        <div className="card mb-6">
          <button onClick={() => setShowCurrencyPicker(true)} className="flex items-center justify-between p-4 w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Wallet size={18} className="text-emerald-500" />
              </div>
              <div className="text-left">
                <p className="font-medium">Currency Symbol</p>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{settings.currency_symbol}</p>
              </div>
            </div>
            <span className="text-text-secondary">→</span>
          </button>
        </div>

        {/* Budget */}
        <h2 className="text-sm font-semibold text-accent mb-3 tracking-wide">BUDGET</h2>
        <div className="card mb-6">
          <button onClick={() => { setBudgetInput(settings.budget_limit > 0 ? settings.budget_limit.toString() : ''); setShowBudgetModal(true); }} className="flex items-center justify-between p-4 w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Wallet size={18} className="text-amber-500" />
              </div>
              <div className="text-left">
                <p className="font-medium">Monthly Budget Limit</p>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{settings.budget_limit > 0 ? `${settings.currency_symbol}${settings.budget_limit}` : 'Not set'}</p>
              </div>
            </div>
            <span className="text-text-secondary">→</span>
          </button>
        </div>

        {/* AI Agent */}
        <h2 className="text-sm font-semibold text-accent mb-3 tracking-wide">AI AGENT</h2>
        <div className="card mb-6">
          <button onClick={() => { setApiKeyInput(settings.gemini_api_key || ''); setShowApiKeyModal(true); }} className="flex items-center justify-between p-4 w-full border-b border-border-light dark:border-border-dark">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Key size={18} className="text-accent" />
              </div>
              <div className="text-left">
                <p className="font-medium">Gemini API Key</p>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{settings.gemini_api_key ? `${settings.gemini_api_key.substring(0, 8)}...` : 'Not set'}</p>
              </div>
            </div>
            <span className="text-text-secondary">→</span>
          </button>
          <button onClick={() => setShowModelPicker(true)} className="flex items-center justify-between p-4 w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Bot size={18} className="text-purple-500" />
              </div>
              <div className="text-left">
                <p className="font-medium">AI Model</p>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{currentModel.name}</p>
              </div>
            </div>
            <span className="text-text-secondary">→</span>
          </button>
        </div>

        {/* About */}
        <h2 className="text-sm font-semibold text-accent mb-3 tracking-wide">ABOUT</h2>
        <div className="card">
          <div className="flex items-center gap-3 p-4 border-b border-border-light dark:border-border-dark">
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Info size={18} className="text-text-secondary" />
            </div>
            <div>
              <p className="font-medium">Version</p>
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark">1.0.0</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Bot size={18} className="text-text-secondary" />
            </div>
            <div>
              <p className="font-medium">AI Status</p>
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{settings.gemini_api_key ? `Ready (${currentModel.name})` : 'Not configured'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Picker Modal */}
      {showModelPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50" onClick={() => setShowModelPicker(false)}>
          <div className="bg-surface-light dark:bg-surface-dark w-full max-w-lg rounded-t-2xl md:rounded-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border-light dark:bg-border-dark rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-4">Select AI Model</h2>
            <div className="space-y-2">
              {GEMINI_MODELS.map(m => (
                <button key={m.id} onClick={() => { updateSetting('selected_model', m.id); setShowModelPicker(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${m.id === settings.selected_model ? 'bg-accent/10 border border-accent/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.id === settings.selected_model ? 'bg-accent/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <Bot size={18} className={m.id === settings.selected_model ? 'text-accent' : 'text-text-secondary'} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{m.description}</p>
                  </div>
                  {m.id === settings.selected_model && <Check size={18} className="text-accent" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Currency Picker Modal */}
      {showCurrencyPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50" onClick={() => setShowCurrencyPicker(false)}>
          <div className="bg-surface-light dark:bg-surface-dark w-full max-w-lg rounded-t-2xl md:rounded-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border-light dark:bg-border-dark rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-4">Currency Symbol</h2>
            <div className="grid grid-cols-5 gap-2">
              {CURRENCIES.map(c => (
                <button key={c} onClick={() => { updateSetting('currency_symbol', c); setShowCurrencyPicker(false); }} className={`py-3 rounded-xl text-xl font-medium transition-all ${c === settings.currency_symbol ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{c}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50" onClick={() => setShowApiKeyModal(false)}>
          <div className="bg-surface-light dark:bg-surface-dark w-full max-w-lg rounded-t-2xl md:rounded-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border-light dark:bg-border-dark rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">Gemini API Key</h2>
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-4">Get your key from Google AI Studio</p>
            <input type="password" value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} className="input mb-4" placeholder="AIza..." />
            <div className="flex gap-2">
              <button onClick={() => setShowApiKeyModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={() => { updateSetting('gemini_api_key', apiKeyInput); setShowApiKeyModal(false); }} className="btn-primary flex-1">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50" onClick={() => setShowBudgetModal(false)}>
          <div className="bg-surface-light dark:bg-surface-dark w-full max-w-lg rounded-t-2xl md:rounded-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border-light dark:bg-border-dark rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-4">Monthly Budget</h2>
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">{settings.currency_symbol}</span>
              <input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} className="input pl-10" placeholder="0" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { updateSetting('budget_limit', 0); setShowBudgetModal(false); }} className="btn-ghost flex-1 text-red-500">Remove</button>
              <button onClick={() => { const v = parseFloat(budgetInput); if (!isNaN(v) && v > 0) updateSetting('budget_limit', v); setShowBudgetModal(false); }} className="btn-primary flex-1">Save</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
