'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative w-full group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-accent transition-colors">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-11 w-full rounded-xl bg-surface/50 border border-white/10 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent/40 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300',
            icon && 'pl-10',
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="absolute inset-0 rounded-xl bg-accent/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500" />
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
