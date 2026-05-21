import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-5 py-3.5 bg-cream border border-stone/50 rounded-full',
            'text-forest placeholder:text-mushroom',
            'focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20',
            'transition-all duration-300',
            error && 'border-terracotta focus:ring-terracotta/20',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-terracotta">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, type InputProps };
