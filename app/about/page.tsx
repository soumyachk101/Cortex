import Link from 'next/link';
import { Leaf, ArrowLeft, Github, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-alabaster">
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-forest transition-colors mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Leaf size={16} className="text-sage" />
            <span className="text-xs text-sage font-medium tracking-[0.2em] uppercase">About</span>
          </div>
          <h1 className="font-serif text-4xl font-bold text-forest tracking-tight mb-4">About Cortex</h1>
        </div>

        <div className="bg-white rounded-card border border-stone/50 p-8 md:p-10 space-y-8">
          <section>
            <h2 className="font-serif text-xl font-semibold text-forest mb-3">The Idea</h2>
            <p className="text-sm text-text-secondary leading-relaxed">Cortex was born from a simple need: a clean, calm personal finance app with an AI that actually helps. Most finance apps are either too complex or too basic. Cortex aims for the sweet spot — powerful enough to manage real finances, simple enough to use daily.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-forest mb-3">Design Philosophy</h2>
            <p className="text-sm text-text-secondary leading-relaxed">The Botanical design system draws from nature — earthy colors, organic shapes, and a paper-like texture. The goal is to make financial management feel calm, not stressful. Every interaction is designed to feel intentional and refined.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-forest mb-3">Tech Stack</h2>
            <ul className="text-sm text-text-secondary leading-relaxed space-y-2">
              <li><strong className="text-forest">Framework:</strong> Next.js 16 (App Router)</li>
              <li><strong className="text-forest">Database:</strong> Supabase (PostgreSQL + Auth)</li>
              <li><strong className="text-forest">AI:</strong> Google Gemini + Groq (user&apos;s own API keys)</li>
              <li><strong className="text-forest">Styling:</strong> Tailwind CSS</li>
              <li><strong className="text-forest">Charts:</strong> Recharts</li>
              <li><strong className="text-forest">Deployment:</strong> Vercel</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-forest mb-3">Open Source</h2>
            <p className="text-sm text-text-secondary leading-relaxed">Cortex is open source. Built by Soumya Chakraborty.</p>
            <a
              href="https://github.com/soumyachk101"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-sage hover:text-forest transition-colors"
            >
              <Github size={16} /> github.com/soumyachk101
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
