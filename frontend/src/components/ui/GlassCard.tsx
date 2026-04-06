'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  hoverGlow?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hoverGlow = true, intensity = 'low', children, ...props }, ref) => {
    
    const intensities = {
      low: 'bg-white/5 border-white/10',
      medium: 'bg-white/10 border-white/20',
      high: 'bg-white/20 border-white/30',
    };

    return (
      <motion.div
        ref={ref}
        whileHover={hoverGlow ? { 
          y: -5,
          boxShadow: '0 0 25px rgba(0, 242, 255, 0.1)',
          borderColor: 'rgba(0, 242, 255, 0.3)'
        } : {}}
        className={cn(
          'relative overflow-hidden rounded-2xl backdrop-blur-xl transition-colors duration-500',
          intensities[intensity],
          className
        )}
        {...props}
      >
        {/* Subtle inner gradient shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        
        {/* Content wrapper */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
);
GlassCard.displayName = 'GlassCard';

export { GlassCard };
