'use client';

import Link from 'next/link';
import { Leaf, ArrowLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const FAQS = [
  {
    q: 'Is Cortex really free?',
    a: 'Yes. Cortex is completely free. You bring your own AI API key (Gemini or Groq), both of which offer generous free tiers. No subscriptions, no hidden fees.',
  },
  {
    q: 'Which AI providers are supported?',
    a: 'Cortex supports Google Gemini and Groq. You can switch between them in Settings. Gemini offers models like 2.0 Flash and 2.5 Pro. Groq offers Llama 3.3, Mixtral, and Gemma 2 with ultra-fast inference.',
  },
  {
    q: 'How do I get an API key?',
    a: 'For Gemini: visit aistudio.google.com, sign in with Google, and create a key. For Groq: visit console.groq.com, create an account, and generate a key. Both are free.',
  },
  {
    q: 'Is my financial data secure?',
    a: 'Yes. All data is stored in your personal Supabase database with Row Level Security enabled. Only you can access your data. API keys are stored encrypted. We never sell or share your data.',
  },
  {
    q: 'What can the AI assistant do?',
    a: 'The AI can add expenses, create tasks, write notes, set reminders, query your spending, and provide summaries. It uses tool calling to interact with your data directly — no manual forms needed.',
  },
  {
    q: 'Can I export my data?',
    a: 'Yes. The Expenses page has a CSV export feature. You can also access your data directly through the Supabase dashboard.',
  },
  {
    q: 'Does Cortex work on mobile?',
    a: 'Yes. Cortex is fully responsive with a mobile-optimized bottom navigation bar. Works on any screen size.',
  },
  {
    q: 'Can I use Cortex without AI?',
    a: 'Yes. All features (expenses, tasks, notes, reminders, calendar, analytics, focus timer) work without an AI API key. The AI assistant is an optional enhancement.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone/30 last:border-b-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left group">
        <span className="font-medium text-forest pr-4 group-hover:text-sage transition-colors duration-300">{q}</span>
        <ChevronDown size={18} className={`text-mushroom flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-5 pr-8">
          <p className="text-sm text-text-secondary leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-alabaster">
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-forest transition-colors mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Leaf size={16} className="text-sage" />
            <span className="text-xs text-sage font-medium tracking-[0.2em] uppercase">Support</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-forest tracking-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-text-secondary">
            Everything you need to know about Cortex
          </p>
        </div>

        <div className="bg-white rounded-card border border-stone/50 p-6 md:p-8">
          {FAQS.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-text-secondary mb-4">Still have questions?</p>
          <a href="https://github.com/soumyachk101" target="_blank" rel="noopener noreferrer" className="btn-botanical-secondary text-xs">
            Contact on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
