'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { GEMINI_MODELS, GROQ_MODELS, ALL_MODELS, CURRENCIES } from '@/constants';
import { useTheme } from 'next-themes';
import { Moon, Sun, Key, Bot, Wallet, Info, Check, ChevronRight, Zap } from 'lucide-react';

// Encode provider into model: "groq:llama-3.3-70b-versatile" or "gemini-2.0-flash"
function parseModel(raw: string) {
  if (raw?.startsWith('groq:')) return { provider: 'groq', modelId: raw.replace('groq:', '') };
  return { provider: 'gemini', modelId: raw || 'gemini-2.0-flash' };
}
function encodeModel(provider: string, modelId: string) {
  return provider === 'groq' ? `groq:${modelId}` : modelId;
}

// Parse API keys from gemini_api_key column (may be JSON or plain string)
function parseKeys(raw: string): { gemini: string; groq: string } {
  if (!raw) return { gemini: '', groq: '' };
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      return { gemini: parsed.gemini || '', groq: parsed.groq || '' };
    }
  } catch {}
  // Legacy: plain string = gemini key
  return { gemini: raw, groq: '' };
}
function encodeKeys(gemini: string, groq: string): string {
  return JSON.stringify({ gemini, groq });
}

export default function SettingsPage() {
  const [userId, setUserId] = useState<string>();
  const [currency, setCurrency] = useState('₹');
  const [budget, setBudget] = useState(0);
  const [geminiKey, setGeminiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [provider, setProvider] = useState('gemini');
  const [modelId, setModelId] = useState('gemini-2.0-flash');
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
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/signin'); return; }
      setUserId(user.id);

      // Ensure row exists
      await supabase.from('user_settings').upsert(
        { user_id: user.id },
        { onConflict: 'user_id', ignoreDuplicates: true }
      );

      // Load settings
      const { data } = await supabase
        .from('user_settings')
        .select('currency_symbol, budget_limit, gemini_api_key, selected_model, theme')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setCurrency(data.currency_symbol || '₹');
        setBudget(data.budget_limit || 0);
        const keys = parseKeys(data.gemini_api_key || '');
        setGeminiKey(keys.gemini);
        setGroqKey(keys.groq);
        const parsed = parseModel(data.selected_model || 'gemini-2.0-flash');
        setProvider(parsed.provider);
        setModelId(parsed.modelId);
      }
    });
  }, []);

  async function saveKeys(newGemini: string, newGroq: string) {
    if (!userId) return;
    const encoded = encodeKeys(newGemini, newGroq);
    console.log('Saving keys:', { userId, encoded });
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({ user_id: userId, gemini_api_key: encoded }, { onConflict: 'user_id' })
      .select();
    if (error) {
      console.error('Save keys error:', error);
      alert(`Error saving API key: ${error.message}`);
    } else {
      console.log('Keys saved successfully:', data);
    }
  }

  async function save(key: string, value: any) {
    if (!userId) return;
    console.log('Saving setting:', { key, value, userId });
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({ user_id: userId, [key]: value }, { onConflict: 'user_id' })
      .select();
    if (error) {
      console.error('Save error:', error);
      alert(`Error saving: ${error.message}`);
    } else {
      console.log('Saved successfully:', data);
    }
  }

  if (!userId) return null;

  const currentModel = ALL_MODELS.find(m => m.id === modelId) || ALL_MODELS[0];
  const currentKey = provider === 'groq' ? groqKey : geminiKey;
  const hasApiKey = !!currentKey;

  function SettingRow({ icon: Icon, iconBg, label, value, onClick }: any) {
    return (
      <button onClick={onClick} className="flex items-center justify-between p-4 sm:p-5 w-full hover:bg-cream/50 transition-colors duration-300 group">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={18} strokeWidth={1.5} />
          </div>
          <div className="text-left min-w-0">
            <p className="font-medium text-forest text-sm sm:text-base">{label}</p>
            <p className="text-xs sm:text-sm text-mushroom mt-0.5 truncate">{value}</p>
          </div>
        </div>
        <ChevronRight size={18} strokeWidth={1.5} className="text-mushroom flex-shrink-0 group-hover:text-sage transition-colors duration-300" />
      </button>
    );
  }

  return (
    <AppShell>
      <div className="p-4 sm:p-6 md:p-10 max-w-2xl mx-auto">
        <div className="mb-8 sm:mb-10">
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-forest">Settings</h1>
          <p className="text-text-secondary mt-1 tracking-wide text-sm sm:text-base">Customize your experience</p>
        </div>

        {/* Appearance */}
        <h2 className="text-[10px] sm:text-xs font-semibold text-sage mb-3 sm:mb-4 tracking-[0.2em] uppercase">Appearance</h2>
        <div className="bg-white rounded-card border border-stone/50 mb-6 sm:mb-8 overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-cream flex items-center justify-center">
                {theme === 'dark' ? <Moon size={18} strokeWidth={1.5} className="text-forest" /> : <Sun size={18} strokeWidth={1.5} className="text-terracotta" />}
              </div>
              <div>
                <p className="font-medium text-forest text-sm sm:text-base">Dark Mode</p>
                <p className="text-xs sm:text-sm text-mushroom mt-0.5">Switch between light and dark</p>
              </div>
            </div>
            <button onClick={() => { const next = theme === 'dark' ? 'light' : 'dark'; setTheme(next); save('theme', next); }} className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${theme === 'dark' ? 'bg-sage' : 'bg-stone'}`}>
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Currency */}
        <h2 className="text-[10px] sm:text-xs font-semibold text-sage mb-3 sm:mb-4 tracking-[0.2em] uppercase">Currency</h2>
        <div className="bg-white rounded-card border border-stone/50 mb-6 sm:mb-8 overflow-hidden">
          <SettingRow icon={Wallet} iconBg="bg-sage/10 text-sage" label="Currency Symbol" value={currency} onClick={() => setShowCurrencyPicker(true)} />
        </div>

        {/* Budget */}
        <h2 className="text-[10px] sm:text-xs font-semibold text-sage mb-3 sm:mb-4 tracking-[0.2em] uppercase">Budget</h2>
        <div className="bg-white rounded-card border border-stone/50 mb-6 sm:mb-8 overflow-hidden">
          <SettingRow icon={Wallet} iconBg="bg-terracotta/10 text-terracotta" label="Monthly Budget Limit" value={budget > 0 ? `${currency}${budget}` : 'Not set'} onClick={() => { setBudgetInput(budget > 0 ? budget.toString() : ''); setShowBudgetModal(true); }} />
        </div>

        {/* AI Provider */}
        <h2 className="text-[10px] sm:text-xs font-semibold text-sage mb-3 sm:mb-4 tracking-[0.2em] uppercase">AI Provider</h2>
        <div className="bg-white rounded-card border border-stone/50 mb-6 sm:mb-8 overflow-hidden">
          <div className="p-4 sm:p-5">
            <p className="font-medium text-forest mb-3 text-sm sm:text-base">Provider</p>
            <div className="flex gap-2 p-1 bg-cream rounded-full">
              <button
                onClick={() => {
                  setProvider('gemini');
                  setModelId('gemini-2.0-flash');
                  save('selected_model', 'gemini-2.0-flash');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${provider === 'gemini' ? 'bg-white text-forest shadow-botanical' : 'text-text-secondary'}`}
              >
                <Bot size={16} /> Gemini
              </button>
              <button
                onClick={() => {
                  setProvider('groq');
                  setModelId('llama-3.3-70b-versatile');
                  save('selected_model', 'groq:llama-3.3-70b-versatile');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${provider === 'groq' ? 'bg-white text-forest shadow-botanical' : 'text-text-secondary'}`}
              >
                <Zap size={16} /> Groq
              </button>
            </div>
          </div>
          <div className="h-px bg-stone/50 mx-5" />
          <SettingRow
            icon={Key}
            iconBg="bg-sage/10 text-sage"
            label={`${provider === 'groq' ? 'Groq' : 'Gemini'} API Key`}
            value={currentKey ? `${currentKey.substring(0, 12)}...` : 'Not set'}
            onClick={() => { setApiKeyInput(currentKey || ''); setShowApiKeyModal(true); }}
          />
          <div className="h-px bg-stone/50 mx-5" />
          <SettingRow
            icon={Bot}
            iconBg="bg-clay/50 text-forest"
            label="AI Model"
            value={currentModel.name}
            onClick={() => setShowModelPicker(true)}
          />
        </div>

        {/* About */}
        <h2 className="text-[10px] sm:text-xs font-semibold text-sage mb-3 sm:mb-4 tracking-[0.2em] uppercase">About</h2>
        <div className="bg-white rounded-card border border-stone/50 overflow-hidden">
          <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-cream flex items-center justify-center">
              <Info size={18} strokeWidth={1.5} className="text-mushroom" />
            </div>
            <div>
              <p className="font-medium text-forest text-sm sm:text-base">Version</p>
              <p className="text-xs sm:text-sm text-mushroom mt-0.5">1.0.0</p>
            </div>
          </div>
          <div className="h-px bg-stone/50 mx-5" />
          <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-cream flex items-center justify-center">
              <Bot size={18} strokeWidth={1.5} className="text-mushroom" />
            </div>
            <div>
              <p className="font-medium text-forest text-sm sm:text-base">AI Status</p>
              <p className="text-xs sm:text-sm text-mushroom mt-0.5">{hasApiKey ? `Ready (${currentModel.name})` : 'Not configured'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Picker Modal */}
      {showModelPicker && (
        <div className="fixed inset-0 bg-forest/20 backdrop-blur-sm flex items-end md:items-center justify-center z-40" onClick={() => setShowModelPicker(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-6 sm:p-8 border-t border-stone/50" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-stone rounded-full mx-auto mb-6" />
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-forest mb-6">Select {provider === 'groq' ? 'Groq' : 'Gemini'} Model</h2>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {(provider === 'groq' ? GROQ_MODELS : GEMINI_MODELS).map(m => (
                <button key={m.id} onClick={() => {
                  setModelId(m.id);
                  save('selected_model', encodeModel(provider, m.id));
                  setShowModelPicker(false);
                }} className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl transition-all duration-300 ${m.id === modelId ? 'bg-sage/10 border border-sage/30' : 'hover:bg-cream'}`}>
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center ${m.id === modelId ? 'bg-sage/20' : 'bg-cream'}`}>
                    {provider === 'groq' ? <Zap size={18} strokeWidth={1.5} className={m.id === modelId ? 'text-sage' : 'text-mushroom'} /> : <Bot size={18} strokeWidth={1.5} className={m.id === modelId ? 'text-sage' : 'text-mushroom'} />}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-forest text-sm sm:text-base">{m.name}</p>
                    <p className="text-[10px] sm:text-xs text-mushroom mt-0.5">{m.description}</p>
                  </div>
                  {m.id === modelId && <Check size={18} strokeWidth={1.5} className="text-sage" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Currency Picker Modal */}
      {showCurrencyPicker && (
        <div className="fixed inset-0 bg-forest/20 backdrop-blur-sm flex items-end md:items-center justify-center z-40" onClick={() => setShowCurrencyPicker(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-6 sm:p-8 border-t border-stone/50" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-stone rounded-full mx-auto mb-6" />
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-forest mb-6">Currency Symbol</h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {CURRENCIES.map(c => (
                <button key={c} onClick={() => { setCurrency(c); save('currency_symbol', c); setShowCurrencyPicker(false); }} className={`py-3 sm:py-4 rounded-2xl text-lg sm:text-xl font-serif font-medium transition-all duration-300 ${c === currency ? 'bg-forest text-white shadow-botanical-md' : 'bg-cream text-forest active:bg-stone/50'}`}>{c}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-forest/20 backdrop-blur-sm flex items-end md:items-center justify-center z-40" onClick={() => setShowApiKeyModal(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-6 sm:p-8 border-t border-stone/50" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-stone rounded-full mx-auto mb-6" />
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-forest mb-2">{provider === 'groq' ? 'Groq' : 'Gemini'} API Key</h2>
            <p className="text-sm text-mushroom mb-6">
              {provider === 'groq' ? 'Get your key from console.groq.com' : 'Get your key from Google AI Studio'}
            </p>
            <input type="password" value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} className="input-botanical mb-6" placeholder={provider === 'groq' ? 'gsk_...' : 'AIza...'} />
            <div className="flex gap-3">
              <button onClick={() => setShowApiKeyModal(false)} className="btn-botanical-secondary flex-1">Cancel</button>
              <button onClick={() => {
                if (provider === 'groq') {
                  setGroqKey(apiKeyInput);
                  saveKeys(geminiKey, apiKeyInput);
                } else {
                  setGeminiKey(apiKeyInput);
                  saveKeys(apiKeyInput, groqKey);
                }
                setShowApiKeyModal(false);
              }} className="btn-botanical flex-1">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-forest/20 backdrop-blur-sm flex items-end md:items-center justify-center z-40" onClick={() => setShowBudgetModal(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-6 sm:p-8 border-t border-stone/50" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-stone rounded-full mx-auto mb-6" />
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-forest mb-6">Monthly Budget</h2>
            <div className="relative mb-6">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-mushroom">{currency}</span>
              <input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} className="input-botanical pl-12" placeholder="0" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setBudget(0); save('budget_limit', 0); setShowBudgetModal(false); }} className="btn-botanical-secondary flex-1 text-terracotta border-terracotta/30">Remove</button>
              <button onClick={() => { const v = parseFloat(budgetInput); if (!isNaN(v) && v > 0) { setBudget(v); save('budget_limit', v); } setShowBudgetModal(false); }} className="btn-botanical flex-1">Save</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
