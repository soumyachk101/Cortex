'use client';

import { Bot, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const DEMO_MESSAGES = [
  { role: 'user', text: 'Add 350 for Uber to transport' },
  { role: 'ai', text: 'Done! Added ₹350 to Transport for Uber. Your transport total this month is ₹1,240.', tool: 'addExpense' },
  { role: 'user', text: 'How much did I spend this week?' },
  { role: 'ai', text: 'This week you spent ₹4,830 across 12 transactions:\n\n• **Food:** ₹2,100 (43%)\n• **Transport:** ₹1,240 (26%)\n• **Shopping:** ₹890 (18%)\n• **Bills:** ₹600 (13%)', tool: 'getExpenseSummary' },
  { role: 'user', text: 'Create a task to pay electricity bill by Friday' },
  { role: 'ai', text: 'Task created: **"Pay electricity bill"** with high priority, due this Friday.', tool: 'addTask' },
];

export function AIShowcase() {
  return (
    <section id="ai-showcase" className="section-botanical relative overflow-hidden bg-alabaster">
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-sage/[0.03] blur-[120px]" />

      <div className="relative max-w-6xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-20">
          <p className="text-xs text-sage font-medium tracking-[0.25em] uppercase mb-5">AI Assistant</p>
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-forest tracking-tight mb-5">
            Talk to your
            <br />
            <span className="bg-gradient-to-r from-sage to-terracotta bg-clip-text text-transparent">finances</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto leading-relaxed text-lg">
            No menus, no forms. Just tell Cortex what you need in plain English.
          </p>
        </div>

        {/* Chat Demo */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-card shadow-botanical-xl border border-stone/50 p-6 md:p-8 relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sage/30 to-transparent" />

            {/* Chat Header */}
            <div className="flex items-center gap-3 pb-6 border-b border-stone/30 mb-6">
              <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
                <Sparkles size={18} className="text-sage" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-serif font-semibold text-forest">Cortex AI</p>
                <p className="text-xs text-mushroom">Powered by Gemini · Tool Calling</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-sage animate-pulse" />
                <span className="text-[10px] text-sage font-medium tracking-wider">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4">
              {DEMO_MESSAGES.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-5 py-3.5 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-forest text-white rounded-br-md'
                        : 'bg-cream border border-stone/30 text-forest rounded-bl-md'
                    }`}
                  >
                    {msg.role === 'ai' && msg.tool && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-5 h-5 rounded-full bg-sage/10 flex items-center justify-center">
                          <Sparkles size={10} className="text-sage" />
                        </div>
                        <span className="text-[10px] text-sage font-medium tracking-wider uppercase">{msg.tool}</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Preview */}
            <div className="mt-6 pt-6 border-t border-stone/30">
              <div className="flex items-center gap-3 px-5 py-3.5 bg-cream rounded-full border border-stone/30">
                <span className="text-sm text-mushroom flex-1">Ask Cortex anything...</span>
                <div className="w-9 h-9 rounded-full bg-forest flex items-center justify-center">
                  <ArrowRight size={16} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link href="/signup" className="btn-botanical inline-flex items-center gap-2 group">
              Try It Free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
