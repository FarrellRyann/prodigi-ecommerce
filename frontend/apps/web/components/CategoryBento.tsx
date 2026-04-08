"use client";

import React from "react";
import { 
  Box, 
  Layers, 
  Palette, 
  Code, 
  Smartphone, 
  ArrowUpRight,
  GraduationCap,
  CreditCard,
  Target,
  Zap,
  Star
} from "lucide-react";
import GlassSurface from "./GlassSurface";

import BorderGlow from "./BorderGlow";

export default function CategoryBento() {
  return (
    <section className="py-24 relative overflow-hidden bg-black isolate">
      <div className="container mx-auto px-6">
        <div className="mb-12 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 font-bold tracking-[0.2em] uppercase text-[10px]">
             Marketplace Hub
          </div>
          <h2 className="text-4xl md:text-6xl font-black font-heading tracking-tighter text-white">
            Everything you need <br />
            <span className="text-white/20 italic">for the digital age.</span>
          </h2>
        </div>

        {/* The Outer Bento Card Container with BorderGlow */}
        <BorderGlow
          borderRadius={56}
          glowColor="250 80 80"
          className="relative shadow-2xl overflow-hidden"
        >
          {/* Subtle Internal Glow Overlay */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[100px] -z-10" />

          <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-4 h-auto md:h-[600px] p-4 md:p-8">
            {/* 1. Main Featured Component (Large) */}
            <div className="md:col-span-7 md:row-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] relative overflow-hidden group">
              <div className="h-full p-8 flex flex-col justify-between relative">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none">
                   <div className="w-full h-full bg-gradient-to-l from-indigo-500/20 to-transparent" />
                </div>
                
                <div className="relative z-10">
                  <Star className="w-14 h-14 text-indigo-400 group-hover:scale-110 group-hover:text-indigo-300 transition-all duration-500" />
                </div>

                <div className="space-y-6 relative z-10">
                  <div>
                    <h3 className="text-4xl font-black text-white tracking-tight leading-tight">
                      Premium <br />
                      Marketplace Assets
                    </h3>
                    <p className="text-gray-400 font-medium max-w-sm mt-4 text-sm leading-relaxed">
                      Access over 120,000+ top-tier icons, illustrations, and 3D mockups curated for high-performance creative teams.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-[1px] bg-indigo-500/50" />
                      <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">Latest Updates Weekly</span>
                    </div>
                    <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                       Available in Cloud
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Premium Courses (Medium) */}
            <div className="md:col-span-5 md:row-span-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between cursor-pointer group hover:bg-white/[0.08] transition-all">
              <GraduationCap className="w-12 h-12 text-purple-400 group-hover:scale-110 group-hover:text-purple-300 transition-all duration-500 shrink-0" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">Expert Courses</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-sm">Boost your skills with 200+ hours of premium video content.</p>
              </div>
            </div>

            {/* 3. Pro Subscription (Small/Square) */}
            <div className="md:col-span-2 md:row-span-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between cursor-pointer group hover:bg-white/[0.08] transition-all">
              <CreditCard className="w-8 h-8 text-emerald-400 group-hover:scale-110 group-hover:text-emerald-300 transition-all duration-500" />
              <div className="space-y-1">
                <h3 className="text-[14px] font-bold text-white">Pro Plan</h3>
                <p className="text-[11px] text-gray-600 font-medium">All-access pass.</p>
              </div>
            </div>

            {/* 4. API & Integration (Small/Square) */}
            <div className="md:col-span-3 md:row-span-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between cursor-pointer group hover:bg-white/[0.08] transition-all">
              <div className="flex justify-between items-start">
                <Code className="w-8 h-8 text-blue-400 group-hover:scale-110 group-hover:text-blue-300 transition-all duration-500" />
                <div className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[9px] font-black uppercase text-blue-400">Stable</div>
              </div>
              <div className="space-y-1">
                <h3 className="text-[14px] font-bold text-white">Developer API</h3>
                <p className="text-[11px] text-gray-600 font-medium">Power your apps.</p>
              </div>
            </div>
          </div>
        </BorderGlow>
      </div>
    </section>
  );
}
