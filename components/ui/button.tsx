import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'terracotta' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-alabaster disabled:opacity-50 disabled:cursor-not-allowed tracking-widest uppercase text-sm';

    const variants = {
      primary: 'bg-forest text-white hover:bg-forest/90 hover:shadow-botanical-md focus:ring-sage',
      secondary: 'bg-transparent text-sage border border-sage hover:bg-sage/10 focus:ring-sage',
      terracotta: 'bg-terracotta text-white hover:bg-terracotta/90 hover:shadow-botanical-md focus:ring-terracotta',
      ghost: 'text-text-secondary hover:bg-cream hover:text-forest focus:ring-sage',
      danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
    };

    const sizes = {
      sm: 'px-5 py-2 text-xs',
      md: 'px-7 py-3 text-sm',
      lg: 'px-9 py-4 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, type ButtonProps };
