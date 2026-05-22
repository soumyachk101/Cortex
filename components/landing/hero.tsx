'use client';

import Link from 'next/link';
import { Leaf, ArrowRight, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-forest" />
      <div className="absolute inset-0 bg-gradient-to-b from-forest via-forest/95 to-alabaster" />

      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-sage/8 blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-terracotta/6 blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-clay/5 blur-[150px] animate-float" style={{ animationDelay: '5s' }} />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating Leaves */}
      <div className="absolute top-[15%] left-[10%] opacity-[0.07] animate-float" style={{ animationDelay: '1s' }}>
        <Leaf size={80} className="text-white" strokeWidth={0.8} />
      </div>
      <div className="absolute top-[60%] right-[8%] opacity-[0.05] animate-float" style={{ animationDelay: '4s' }}>
        <Leaf size={60} className="text-white rotate-45" strokeWidth={0.8} />
      </div>
      <div className="absolute bottom-[20%] left-[20%] opacity-[0.04] animate-float" style={{ animationDelay: '2s' }}>
        <Leaf size={44} className="text-white -rotate-12" strokeWidth={0.8} />
      </div>

      {/* Horizontal Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sage/20 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 text-center pt-24 pb-32">
        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm mb-10 animate-fade-up">
          <Sparkles size={14} className="text-sage" strokeWidth={1.5} />
          <span className="text-xs text-white/60 font-medium tracking-[0.2em] uppercase">AI-Powered Personal Finance</span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-6xl md:text-8xl lg:text-[7rem] font-bold text-white tracking-tight leading-[1.05] mb-8 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          Your Money.
          <br />
          <span className="bg-gradient-to-r from-sage via-clay to-terracotta bg-clip-text text-transparent">Your Tasks.</span>
          <br />
          Your AI.
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed mb-12 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          Expense tracking, task management, and smart notes — unified by an AI
          that actually understands your data. Built with botanical calm.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.45s' }}>
          <Link href="/signup" className="inline-flex items-center gap-2.5 px-10 py-4 bg-white text-forest rounded-full text-sm font-semibold tracking-widest uppercase hover:bg-white/90 transition-all duration-500 shadow-botanical-xl group">
            Get Started Free
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
          <a href="#features" className="inline-flex items-center gap-2 px-10 py-4 bg-transparent text-white/60 border border-white/10 rounded-full text-sm font-medium tracking-widest uppercase hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-500">
            Explore Features
          </a>
        </div>

        {/* Trust Line */}
        <p className="mt-16 text-xs text-white/25 tracking-[0.15em] uppercase animate-fade-up" style={{ animationDelay: '0.6s' }}>
          No credit card required · Free forever · Your data stays yours
        </p>
      </div>

      {/* Bottom Fade to Alabaster */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-alabaster to-transparent" />
    </section>
  );
}
