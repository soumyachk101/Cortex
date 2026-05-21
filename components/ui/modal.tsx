'use client';
import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Content */}
      <div
        className={cn(
          'relative w-full max-w-lg bg-surface-light dark:bg-surface-dark rounded-t-2xl md:rounded-2xl p-6',
          'animate-in slide-in-from-bottom md:fade-in-0 md:zoom-in-95',
          className
        )}
      >
        {/* Handle bar (mobile) */}
        <div className="w-10 h-1 bg-border-light dark:bg-border-dark rounded-full mx-auto mb-4 md:hidden" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X size={18} className="text-text-secondary" />
        </button>

        {/* Title */}
        {title && (
          <h2 className="text-lg font-bold mb-4 pr-8">{title}</h2>
        )}

        {/* Body */}
        {children}
      </div>
    </div>
  );
}
