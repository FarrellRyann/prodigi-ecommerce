"use client";

import React from "react";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import Grainient from "./Grainient";
import SplitText from "./SplitText";
import StarBorder from "./StarBorder";

export default function Hero({ 
  title, 
  subtitle 
}: { 
  title?: string;
  subtitle?: string; 
} = {}) {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Grainient Background Layer */}
      <div className="absolute inset-0 z-0">
        <Grainient
          color1="#241f31"
          color2="#5227FF"
          color3="#B19EEF"
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl pt-32 pb-24">
        {/* Badge */}
        <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2 group hover:border-indigo-500/30 transition-colors">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/70">
              Next-Gen Digital Assets
            </span>
            <Sparkles className="w-3 h-3 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* Headline */}
        <div className="mb-8">
          <SplitText
            text={title || "Elevate Your Digital Realm"}
            className="text-5xl md:text-8xl font-black font-heading tracking-tight text-white leading-tight"
            delay={40}
            duration={0.8}
            splitType="chars"
            from={{ opacity: 0, y: 50, rotateX: -90 }}
            to={{ opacity: 1, y: 0, rotateX: 0 }}
            tag="h1"
          />
        </div>

        {/* Subheadline */}
        <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-200 fill-mode-forwards">
          {subtitle || "Discover curated premium assets for modern creators. High-quality 3D components, UI kits, and artistic templates to supercharge your workflow."}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-300 fill-mode-forwards">
          <Link href="/login">
            <StarBorder
              color="#6366f1"
              speed="4s"
              className="group transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-600/20"
            >
              <div className="flex items-center gap-2 font-bold">
                Start Exploring
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </StarBorder>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-2xl h-14 px-8 text-md font-bold flex items-center gap-2 backdrop-blur-xl group transition-all hover:border-white/20">
              <ShoppingBag className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
              Join now
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="mt-16 pt-12 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 animate-in fade-in delay-500 fill-mode-forwards">
          {[
            { label: "Active Creators", value: "12K+" },
            { label: "Premium Assets", value: "250K+" },
            { label: "Weekly Downloads", value: "1M+" },
            { label: "Customer Satisfaction", value: "99.9%" },
          ].map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
              <span className="text-2xl md:text-3xl font-black text-white/90 tracking-tighter">
                {stat.value}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
