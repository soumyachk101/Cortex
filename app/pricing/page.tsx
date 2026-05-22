import Link from 'next/link';
import { Leaf, ArrowLeft, Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Everything you need to get started',
    features: ['Unlimited expenses', 'Unlimited tasks', 'Unlimited notes', 'AI assistant (bring your own API key)', 'Calendar view', 'Focus timer', 'Analytics dashboard', 'Dark mode'],
    cta: 'Get Started',
    href: '/signup',
    popular: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-alabaster">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-forest transition-colors mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Leaf size={16} className="text-sage" />
            <span className="text-xs text-sage font-medium tracking-[0.2em] uppercase">Pricing</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-forest tracking-tight mb-4">
            Free Forever
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto">
            Cortex is free. You bring your own AI API key (Gemini or Groq). No subscriptions, no hidden fees.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          {PLANS.map(plan => (
            <div key={plan.name} className="relative bg-white rounded-card shadow-botanical-lg border border-sage/30 p-8">
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-sage text-white text-xs font-medium tracking-wider uppercase rounded-full">
                  Recommended
                </div>
              )}
              <h3 className="font-serif text-2xl font-semibold text-forest">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="font-serif text-4xl font-bold text-forest">{plan.price}</span>
                <span className="text-text-secondary text-sm ml-1">/{plan.period}</span>
              </div>
              <p className="text-sm text-text-secondary mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-forest">
                    <Check size={16} className="text-sage flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className="btn-botanical w-full text-center block">
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 text-sm text-text-secondary">
          <p>AI usage requires your own API key from <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-sage hover:text-forest">Google AI Studio</a> or <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-sage hover:text-forest">Groq Console</a>.</p>
          <p className="mt-2">Both offer free tiers with generous limits.</p>
        </div>
      </div>
    </div>
  );
}
