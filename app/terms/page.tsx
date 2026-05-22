import Link from 'next/link';
import { Leaf, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
          <h1 className="font-serif text-4xl font-bold text-forest tracking-tight">Terms of Service</h1>
          <p className="text-text-secondary mt-2">Last updated: May 2026</p>
        </div>

        <div className="bg-white rounded-card border border-stone/50 p-8 md:p-10 space-y-8">
          <section>
            <h2 className="font-serif text-xl font-semibold text-forest mb-3">Service</h2>
            <p className="text-sm text-text-secondary leading-relaxed">Cortex is a personal finance and productivity application. It provides expense tracking, task management, notes, reminders, and AI-powered assistance. The service is provided as-is, free of charge.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-forest mb-3">Your Responsibility</h2>
            <p className="text-sm text-text-secondary leading-relaxed">You are responsible for maintaining the security of your account and API keys. You are responsible for the accuracy of the financial data you enter.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-forest mb-3">AI Disclaimer</h2>
            <p className="text-sm text-text-secondary leading-relaxed">AI-generated responses are for informational purposes only. They should not be considered financial advice. Always verify important financial decisions independently.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-forest mb-3">Limitation of Liability</h2>
            <p className="text-sm text-text-secondary leading-relaxed">Cortex is provided without warranties. We are not liable for any financial decisions made based on AI suggestions or data displayed in the application.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-forest mb-3">Changes</h2>
            <p className="text-sm text-text-secondary leading-relaxed">We may update these terms from time to time. Continued use of the service constitutes acceptance of the updated terms.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
