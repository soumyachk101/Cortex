'use client';

import Link from 'next/link';
import { ArrowRight, Leaf } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-16 sm:py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 md:px-12">
        <div className="relative gradient-botanical rounded-card p-8 sm:p-12 md:p-16 text-center overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute top-8 left-8 opacity-10">
            <Leaf size={48} className="text-white" strokeWidth={1} />
          </div>

          <div className="relative">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-tight mb-3 sm:mb-4 px-2">
              Start managing your
              <br />
              finances with AI
            </h2>
            <p className="text-white/60 max-w-md mx-auto mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base px-2">
              Free forever. No credit card required. Your data stays private and encrypted.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-forest rounded-full font-medium text-xs sm:text-sm tracking-widest uppercase hover:bg-white/90 transition-all duration-300 shadow-botanical-xl group"
            >
              Get Started Free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
