'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { GEMINI_MODELS, CURRENCIES } from '@/constants';
import { useTheme } from 'next-themes';
import { Moon, Sun, Key, Bot, Wallet, Info, Check, Leaf, ChevronRight } from 'lucide-react';

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

  function SettingRow({ icon: Icon, iconBg, label, value, onClick }: { icon: any; iconBg: string; label: string; value: string; onClick: () => void }) {
    return (
      <button onClick={onClick} className="flex items-center justify-between p-5 w-full hover:bg-cream/50 transition-colors duration-300 group">
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-full ${iconBg} flex items-center justify-center`}>
            <Icon size={18} strokeWidth={1.5} />
          </div>
          <div className="text-left">
            <p className="font-medium text-forest">{label}</p>
            <p className="text-sm text-mushroom mt-0.5">{value}</p>
          </div>
        </div>
        <ChevronRight size={18} strokeWidth={1.5} className="text-mushroom group-hover:text-sage transition-colors duration-300" />
      </button>
    );
  }

  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-forest">Settings</h1>
          <p className="text-text-secondary mt-1 tracking-wide">Customize your experience</p>
        </div>

        {/* Appearance */}
        <h2 className="text-xs font-semibold text-sage mb-4 tracking-[0.2em] uppercase">Appearance</h2>
        <div className="bg-white rounded-card border border-stone/50 mb-8 overflow-hidden">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-cream flex items-center justify-center">
                {theme === 'dark' ? <Moon size={18} strokeWidth={1.5} className="text-forest" /> : <Sun size={18} strokeWidth={1.5} className="text-terracotta" />}
              </div>
              <div>
                <p className="font-medium text-forest">Dark Mode</p>
                <p className="text-sm text-mushroom mt-0.5">Switch between light and dark</p>
              </div>
            </div>
            <button onClick={() => { const next = theme === 'dark' ? 'light' : 'dark'; setTheme(next); updateSetting('theme', next); }} className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${theme === 'dark' ? 'bg-sage' : 'bg-stone'}`}>
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Currency */}
        <h2 className="text-xs font-semibold text-sage mb-4 tracking-[0.2em] uppercase">Currency</h2>
        <div className="bg-white rounded-card border border-stone/50 mb-8 overflow-hidden">
          <SettingRow icon={Wallet} iconBg="bg-sage/10 text-sage" label="Currency Symbol" value={settings.currency_symbol} onClick={() => setShowCurrencyPicker(true)} />
        </div>

        {/* Budget */}
        <h2 className="text-xs font-semibold text-sage mb-4 tracking-[0.2em] uppercase">Budget</h2>
        <div className="bg-white rounded-card border border-stone/50 mb-8 overflow-hidden">
          <SettingRow icon={Wallet} iconBg="bg-terracotta/10 text-terracotta" label="Monthly Budget Limit" value={settings.budget_limit > 0 ? `${settings.currency_symbol}${settings.budget_limit}` : 'Not set'} onClick={() => { setBudgetInput(settings.budget_limit > 0 ? settings.budget_limit.toString() : ''); setShowBudgetModal(true); }} />
        </div>

        {/* AI Agent */}
        <h2 className="text-xs font-semibold text-sage mb-4 tracking-[0.2em] uppercase">AI Agent</h2>
        <div className="bg-white rounded-card border border-stone/50 mb-8 overflow-hidden">
          <SettingRow icon={Key} iconBg="bg-sage/10 text-sage" label="Gemini API Key" value={settings.gemini_api_key ? `${settings.gemini_api_key.substring(0, 8)}...` : 'Not set'} onClick={() => { setApiKeyInput(settings.gemini_api_key || ''); setShowApiKeyModal(true); }} />
          <div className="h-px bg-stone/50 mx-5" />
          <SettingRow icon={Bot} iconBg="bg-clay/50 text-forest" label="AI Model" value={currentModel.name} onClick={() => setShowModelPicker(true)} />
        </div>

        {/* About */}
        <h2 className="text-xs font-semibold text-sage mb-4 tracking-[0.2em] uppercase">About</h2>
        <div className="bg-white rounded-card border border-stone/50 overflow-hidden">
          <div className="flex items-center gap-4 p-5">
            <div className="w-11 h-11 rounded-full bg-cream flex items-center justify-center">
              <Info size={18} strokeWidth={1.5} className="text-mushroom" />
            </div>
            <div>
              <p className="font-medium text-forest">Version</p>
              <p className="text-sm text-mushroom mt-0.5">1.0.0</p>
            </div>
          </div>
          <div className="h-px bg-stone/50 mx-5" />
          <div className="flex items-center gap-4 p-5">
            <div className="w-11 h-11 rounded-full bg-cream flex items-center justify-center">
              <Bot size={18} strokeWidth={1.5} className="text-mushroom" />
            </div>
            <div>
              <p className="font-medium text-forest">AI Status</p>
              <p className="text-sm text-mushroom mt-0.5">{settings.gemini_api_key ? `Ready (${currentModel.name})` : 'Not configured'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Picker Modal */}
      {showModelPicker && (
        <div className="fixed inset-0 bg-forest/20 backdrop-blur-sm flex items-end md:items-center justify-center z-40" onClick={() => setShowModelPicker(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-8 border-t border-stone/50" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-stone rounded-full mx-auto mb-6" />
            <h2 className="font-serif text-2xl font-semibold text-forest mb-6">Select AI Model</h2>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {GEMINI_MODELS.map(m => (
                <button key={m.id} onClick={() => { updateSetting('selected_model', m.id); setShowModelPicker(false); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${m.id === settings.selected_model ? 'bg-sage/10 border border-sage/30' : 'hover:bg-cream'}`}>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${m.id === settings.selected_model ? 'bg-sage/20' : 'bg-cream'}`}>
                    <Bot size={18} strokeWidth={1.5} className={m.id === settings.selected_model ? 'text-sage' : 'text-mushroom'} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-forest">{m.name}</p>
                    <p className="text-xs text-mushroom mt-0.5">{m.description}</p>
                  </div>
                  {m.id === settings.selected_model && <Check size={18} strokeWidth={1.5} className="text-sage" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Currency Picker Modal */}
      {showCurrencyPicker && (
        <div className="fixed inset-0 bg-forest/20 backdrop-blur-sm flex items-end md:items-center justify-center z-40" onClick={() => setShowCurrencyPicker(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-8 border-t border-stone/50" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-stone rounded-full mx-auto mb-6" />
            <h2 className="font-serif text-2xl font-semibold text-forest mb-6">Currency Symbol</h2>
            <div className="grid grid-cols-5 gap-3">
              {CURRENCIES.map(c => (
                <button key={c} onClick={() => { updateSetting('currency_symbol', c); setShowCurrencyPicker(false); }} className={`py-4 rounded-2xl text-xl font-serif font-medium transition-all duration-300 ${c === settings.currency_symbol ? 'bg-forest text-white shadow-botanical-md' : 'bg-cream text-forest hover:bg-stone/50'}`}>{c}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-forest/20 backdrop-blur-sm flex items-end md:items-center justify-center z-40" onClick={() => setShowApiKeyModal(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-8 border-t border-stone/50" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-stone rounded-full mx-auto mb-6" />
            <h2 className="font-serif text-2xl font-semibold text-forest mb-2">Gemini API Key</h2>
            <p className="text-sm text-mushroom mb-6">Get your key from Google AI Studio</p>
            <input type="password" value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} className="input-botanical mb-6" placeholder="AIza..." />
            <div className="flex gap-3">
              <button onClick={() => setShowApiKeyModal(false)} className="btn-botanical-secondary flex-1">Cancel</button>
              <button onClick={() => { updateSetting('gemini_api_key', apiKeyInput); setShowApiKeyModal(false); }} className="btn-botanical flex-1">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-forest/20 backdrop-blur-sm flex items-end md:items-center justify-center z-40" onClick={() => setShowBudgetModal(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-8 border-t border-stone/50" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-stone rounded-full mx-auto mb-6" />
            <h2 className="font-serif text-2xl font-semibold text-forest mb-6">Monthly Budget</h2>
            <div className="relative mb-6">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-mushroom">{settings.currency_symbol}</span>
              <input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} className="input-botanical pl-12" placeholder="0" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { updateSetting('budget_limit', 0); setShowBudgetModal(false); }} className="btn-botanical-secondary flex-1 text-terracotta border-terracotta/30 hover:bg-terracotta/5">Remove</button>
              <button onClick={() => { const v = parseFloat(budgetInput); if (!isNaN(v) && v > 0) updateSetting('budget_limit', v); setShowBudgetModal(false); }} className="btn-botanical flex-1">Save</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
