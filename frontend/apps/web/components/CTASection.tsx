"use client";

import React from "react";
import { 
  Rocket, 
  ArrowRight, 
  Star,
  Users,
  ShieldCheck,
  Zap
} from "lucide-react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import GlassSurface from "./GlassSurface";
import StarBorder from "./StarBorder";

export default function CTASection() {
  return (
    <section className="pt-32 pb-16 relative overflow-hidden bg-black isolate text-center">
      {/* Heavy Background Glow Nodes */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[180px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[180px] -z-10" />

      <div className="container mx-auto px-6 max-w-5xl">
        <div className="relative z-10 space-y-16">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-indigo-600 shadow-2xl shadow-indigo-600/40 flex items-center justify-center text-white scale-110 group-hover:scale-125 transition-transform duration-700 animate-bounce-subtle">
              <Rocket className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-5xl md:text-8xl font-black font-heading tracking-tighter text-white leading-tight">
              Ready to Fuel <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 drop-shadow-sm">
                Your Creativity?
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto">
              Join 12,000+ creators who are building the future with ProDigi. Instant access to the world&apos;s most curated digital asset library.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Link href="/register">
              <StarBorder
                color="#6366f1"
                speed="3.5s"
                className="group transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-600/20"
              >
                <div className="flex items-center gap-2 h-14 px-8 text-lg font-bold">
                  Join now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </StarBorder>
            </Link>

            <Link href="/login" className="group relative transition-all hover:scale-105 active:scale-95">
              <GlassSurface 
                borderRadius={9999}
                blur={15}
                opacity={0.1}
                brightness={30}
                className="h-14 px-10 border border-white/10 flex items-center justify-center gap-2 text-lg font-bold text-white group-hover:border-white/20 transition-all font-sans"
              >
                Sign In
              </GlassSurface>
            </Link>
          </div>

          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5">
            {[
              { icon: <Users className="w-4 h-4" />, text: "12K Creators" },
              { icon: <Star className="w-4 h-4" />, text: "Top-Rated Items" },
              { icon: <ShieldCheck className="w-4 h-4" />, text: "Verified Assets" },
              { icon: <Zap className="w-4 h-4" />, text: "Instant Access" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-center gap-2 text-gray-500 font-bold tracking-widest text-[10px] uppercase">
                {item.icon}
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
