import Link from 'next/link';
import { Leaf, ArrowLeft, MapPin, Clock, Briefcase } from 'lucide-react';

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-alabaster">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-forest transition-colors mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Leaf size={16} className="text-sage" />
            <span className="text-xs text-sage font-medium tracking-[0.2em] uppercase">Careers</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-forest tracking-tight mb-4">
            Build with us
          </h1>
          <p className="text-text-secondary max-w-xl">
            Cortex is an open-source project. We&apos;re looking for contributors who are passionate about clean design, AI, and personal finance.
          </p>
        </div>

        <div className="bg-white rounded-card border border-stone/50 p-8 md:p-10 mb-8">
          <h2 className="font-serif text-2xl font-semibold text-forest mb-6">Why Contribute?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
                <Briefcase size={18} className="text-sage" />
              </div>
              <div>
                <h3 className="font-medium text-forest mb-1">Real Impact</h3>
                <p className="text-sm text-text-secondary">Your code ships to real users managing real money.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
                <Leaf size={18} className="text-sage" />
              </div>
              <div>
                <h3 className="font-medium text-forest mb-1">Modern Stack</h3>
                <p className="text-sm text-text-secondary">Next.js 16, Supabase, Tailwind, Gemini/Groq AI.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={18} className="text-sage" />
              </div>
              <div>
                <h3 className="font-medium text-forest mb-1">Remote First</h3>
                <p className="text-sm text-text-secondary">Work from anywhere. Async communication.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-sage" />
              </div>
              <div>
                <h3 className="font-medium text-forest mb-1">Flexible</h3>
                <p className="text-sm text-text-secondary">Contribute at your own pace. Open source, no deadlines.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-card border border-stone/50 p-8 md:p-10 mb-8">
          <h2 className="font-serif text-2xl font-semibold text-forest mb-6">Open Roles</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-cream/50 rounded-xl border border-stone/30">
              <div>
                <h3 className="font-medium text-forest">Frontend Developer</h3>
                <p className="text-sm text-text-secondary mt-0.5">React, Next.js, Tailwind CSS</p>
              </div>
              <span className="text-xs text-sage bg-sage/10 px-3 py-1.5 rounded-full font-medium">Open</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-cream/50 rounded-xl border border-stone/30">
              <div>
                <h3 className="font-medium text-forest">AI/ML Engineer</h3>
                <p className="text-sm text-text-secondary mt-0.5">Gemini, Groq, Tool Calling, Prompt Engineering</p>
              </div>
              <span className="text-xs text-sage bg-sage/10 px-3 py-1.5 rounded-full font-medium">Open</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-cream/50 rounded-xl border border-stone/30">
              <div>
                <h3 className="font-medium text-forest">UI/UX Designer</h3>
                <p className="text-sm text-text-secondary mt-0.5">Design systems, botanical aesthetics</p>
              </div>
              <span className="text-xs text-sage bg-sage/10 px-3 py-1.5 rounded-full font-medium">Open</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-text-secondary mb-4">Interested? Contribute on GitHub or reach out.</p>
          <a href="https://github.com/soumyachk101" target="_blank" rel="noopener noreferrer" className="btn-botanical">
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
