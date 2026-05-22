import Link from 'next/link';
import { Leaf, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-alabaster">
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-forest transition-colors mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Leaf size={16} className="text-sage" />
            <span className="text-xs text-sage font-medium tracking-[0.2em] uppercase">Legal</span>
          </div>
          <h1 className="font-serif text-4xl font-bold text-forest tracking-tight">Privacy Policy</h1>
          <p className="text-text-secondary mt-2">Last updated: May 2026</p>
        </div>

        <div className="bg-white rounded-card border border-stone/50 p-8 md:p-10 space-y-8">
          <section>
            <h2 className="font-serif text-xl font-semibold text-forest mb-3">Your Data</h2>
            <p className="text-sm text-text-secondary leading-relaxed">Your financial data (expenses, tasks, notes) is stored in your personal Supabase database. Row Level Security ensures only you can access your data. We never sell or share your data with third parties.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-forest mb-3">API Keys</h2>
            <p className="text-sm text-text-secondary leading-relaxed">Your AI API keys (Gemini, Groq) are stored encrypted in your database. They are only used to process your AI requests and are never logged or shared.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-forest mb-3">Chat History</h2>
            <p className="text-sm text-text-secondary leading-relaxed">AI conversation history is stored in your database for context continuity. You can delete chat sessions at any time.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-forest mb-3">Authentication</h2>
            <p className="text-sm text-text-secondary leading-relaxed">Authentication is handled by Supabase Auth. We support email/password and Google OAuth. Passwords are hashed and never stored in plain text.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-forest mb-3">Cookies</h2>
            <p className="text-sm text-text-secondary leading-relaxed">We use essential cookies for authentication session management. No tracking or advertising cookies are used.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
