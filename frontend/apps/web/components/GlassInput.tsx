"use client";

import React from "react";
import { cn } from "@workspace/ui/lib/utils";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            {...props}
            ref={ref}
            className={cn(
              "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all group-hover:border-white/20",
              error && "border-red-500/50 focus:ring-red-500/30",
              className
            )}
          />
          {/* Subtle Glow on Focus */}
          <div className="absolute inset-0 rounded-2xl bg-indigo-500/5 blur opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
        </div>
        {error && <p className="text-[10px] font-medium text-red-400 ml-1 italic">{error}</p>}
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";

export default GlassInput;
