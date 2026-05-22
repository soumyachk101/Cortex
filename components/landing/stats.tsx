'use client';

import { Github, Leaf, ExternalLink } from 'lucide-react';

export function BuiltBy() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 gradient-botanical" />
      <div className="absolute inset-0 opacity-5 paper-grain" />

      {/* Decorative */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5" />

      <div className="relative max-w-4xl mx-auto px-6 md:px-12 text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <Leaf size={16} className="text-white/40" />
          <span className="text-xs text-white/40 font-medium tracking-[0.2em] uppercase">Open Source</span>
        </div>

        <h2 className="font-serif text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
          Built in the open
        </h2>
        <p className="text-white/40 max-w-lg mx-auto mb-10 leading-relaxed">
          Cortex is built with Next.js, Supabase, and Gemini AI.
          Star the repo, fork it, or contribute.
        </p>

        <a
          href="https://github.com/soumyachk101"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 border border-white/10 rounded-full text-white text-sm font-medium tracking-widest uppercase hover:bg-white/15 hover:border-white/20 transition-all duration-500 backdrop-blur-sm group"
        >
          <Github size={18} strokeWidth={1.5} />
          View on GitHub
          <ExternalLink size={14} className="opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
        </a>
      </div>
    </section>
  );
}
