'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Leaf, Menu, X, Github, ChevronDown } from 'lucide-react';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navBg = scrolled
    ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_3px_rgba(45,58,49,0.08)] border-b border-stone/20'
    : 'bg-transparent';

  const textColor = scrolled ? 'text-forest' : 'text-white';
  const mutedColor = scrolled ? 'text-text-secondary' : 'text-white/50';
  const hoverColor = scrolled ? 'hover:text-forest' : 'hover:text-white';
  const iconBg = scrolled ? 'bg-cream/80' : 'bg-white/[0.06]';
  const iconHover = scrolled ? 'hover:bg-stone/50' : 'hover:bg-white/[0.12]';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${navBg}`}>
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${scrolled ? 'bg-sage/10' : 'bg-white/10'} group-hover:scale-105`}>
              <Leaf size={16} className={`transition-colors duration-500 ${scrolled ? 'text-sage' : 'text-white/80'}`} strokeWidth={1.5} />
            </div>
            <span className={`font-serif text-lg font-semibold transition-colors duration-500 ${textColor}`}>
              Cortex
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <a href="#features" className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors duration-300 ${mutedColor} ${hoverColor}`}>
              Features
            </a>
            <a href="#how-it-works" className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors duration-300 ${mutedColor} ${hoverColor}`}>
              How It Works
            </a>
            <a href="#ai-showcase" className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors duration-300 ${mutedColor} ${hoverColor}`}>
              AI Assistant
            </a>
            <Link href="/pricing" className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors duration-300 ${mutedColor} ${hoverColor}`}>
              Pricing
            </Link>
            <Link href="/faq" className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors duration-300 ${mutedColor} ${hoverColor}`}>
              FAQ
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="https://github.com/soumyachk101"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${iconBg} ${mutedColor} ${iconHover} hover:${textColor}`}
            >
              <Github size={16} strokeWidth={1.5} />
            </a>
            <div className={`w-px h-5 ${scrolled ? 'bg-stone/40' : 'bg-white/10'} mx-1`} />
            <Link href="/signin" className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors duration-300 ${mutedColor} ${hoverColor}`}>
              Sign In
            </Link>
            <Link
              href="/signup"
              className={`px-5 py-2 rounded-lg text-[13px] font-semibold tracking-wide transition-all duration-500 ${
                scrolled
                  ? 'bg-forest text-white hover:bg-forest/90 shadow-sm'
                  : 'bg-white text-forest hover:bg-white/90'
              }`}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${iconBg} ${textColor}`}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 ${mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white/95 backdrop-blur-xl border-t border-stone/20 px-6 py-4 space-y-1">
          <a href="#features" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-forest hover:bg-cream transition-colors">Features</a>
          <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-forest hover:bg-cream transition-colors">How It Works</a>
          <a href="#ai-showcase" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-forest hover:bg-cream transition-colors">AI Assistant</a>
          <Link href="/pricing" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-forest hover:bg-cream transition-colors">Pricing</Link>
          <Link href="/faq" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-forest hover:bg-cream transition-colors">FAQ</Link>
          <a href="https://github.com/soumyachk101" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-forest hover:bg-cream transition-colors">
            <Github size={16} /> GitHub
          </a>
          <div className="pt-3 mt-2 border-t border-stone/20 flex flex-col gap-2">
            <Link href="/signin" className="text-center py-2.5 text-sm text-text-secondary font-medium hover:text-forest transition-colors">Sign In</Link>
            <Link href="/signup" className="btn-botanical text-center text-xs py-3">Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
