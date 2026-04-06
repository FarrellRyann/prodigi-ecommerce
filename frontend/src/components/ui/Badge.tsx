'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'outline' | 'glass';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    
    const variants = {
      default: 'bg-primary/20 text-blue-400 border border-primary/30 shadow-[0_0_10px_rgba(42,103,255,0.2)]',
      success: 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]',
      warning: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
      error: 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
      outline: 'bg-transparent border border-white/20 text-white',
      glass: 'glass text-white text-[10px] px-2 py-0.5',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-tight whitespace-nowrap',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
