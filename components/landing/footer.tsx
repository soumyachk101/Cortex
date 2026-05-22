'use client';

import Link from 'next/link';
import { Leaf, Github, ArrowUpRight } from 'lucide-react';

const LINKS = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'AI Assistant', href: '#ai-showcase' },
    { label: 'FAQ', href: '/faq' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="relative bg-forest overflow-hidden">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-sage/30 to-transparent" />

      {/* Decorative circles */}
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-sage/5" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-terracotta/5" />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 md:px-12 py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-12 gap-8 sm:gap-10 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-5">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Leaf size={18} className="text-sage" strokeWidth={1.5} />
              </div>
              <span className="font-serif text-xl sm:text-2xl font-semibold text-white">Cortex</span>
            </Link>
            <p className="text-white/40 text-xs sm:text-sm leading-relaxed max-w-xs mb-5 sm:mb-6">
              AI-powered personal finance and productivity. Botanical calm meets computational power.
            </p>
            <a
              href="https://github.com/soumyachk101"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors duration-300"
            >
              <Github size={16} strokeWidth={1.5} />
              soumyachk101
            </a>
          </div>

          {/* Link Columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title} className="md:col-span-2">
              <h4 className="text-[10px] sm:text-xs font-semibold text-white/30 tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-3 sm:mb-5">{title}</h4>
              <ul className="space-y-2 sm:space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-xs sm:text-sm text-white/50 hover:text-white transition-colors duration-300 inline-flex items-center gap-1 group">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] sm:text-xs text-white/20">
            &copy; {new Date().getFullYear()} Cortex. Built by{' '}
            <a href="https://github.com/soumyachk101" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/60 transition-colors">
              Soumya Chakraborty
            </a>
          </p>
          <div className="flex items-center gap-6">
            <a href="https://github.com/soumyachk101" target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/50 transition-colors duration-300">
              <Github size={18} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
