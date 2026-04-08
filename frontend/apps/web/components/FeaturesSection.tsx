"use client";

import React from "react";
import { 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Wallet,
  Award,
  Smartphone,
  Zap
} from "lucide-react";

import BorderGlow from "./BorderGlow";

export default function FeaturesSection() {
  const features = [
    {
      title: "Lightning Fast Delivery",
      description: "Instant access to your digital assets the moment your purchase is confirmed. No waiting, no hassle.",
      icon: <Cpu className="w-8 h-8" />,
      glowColor: "40 80 80",
    },
    {
      title: "Secure Transactions",
      description: "Multi-layered encryption and industry-standard security protocols to keep your data safe and private.",
      icon: <ShieldCheck className="w-8 h-8" />,
      glowColor: "220 80 80",
    },
    {
      title: "Endless Options",
      description: "Access a massive library of thousands of premium assets, templates, and digital resources.",
      icon: <Layers className="w-8 h-8" />,
      glowColor: "280 80 80",
    },
    {
      title: "Mobile Ready",
      description: "Manage your library and browse our marketplace from any device with our fully responsive interface.",
      icon: <Smartphone className="w-8 h-8" />,
      glowColor: "160 80 80",
    },
    {
      title: "Verified Quality",
      description: "Every asset in our marketplace is manually vetted by our quality control team to ensure top-tier standards.",
      icon: <Award className="w-8 h-8" />,
      glowColor: "250 80 80",
    },
    {
      title: "Flexible Payments",
      description: "Support for multiple payment methods and regional currencies for a global purchasing experience.",
      icon: <Wallet className="w-8 h-8" />,
      glowColor: "340 80 80",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-black isolate">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[160px] -z-10" />

      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-2 text-indigo-400 font-bold tracking-[0.2em] uppercase text-xs">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            Core Features
          </div>
          <h2 className="text-4xl md:text-5xl font-black font-heading tracking-tighter text-white">
            Engineered For <br />
            <span className="text-white/30 italic">Modern Creators.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {features.map((feature, idx) => (
            <BorderGlow
              key={idx}
              borderRadius={32}
              glowColor={feature.glowColor}
              className="transition-all duration-500 hover:-translate-y-2 group"
            >
              <div 
                className="p-8 h-full"
              >
                <div className="text-white mb-6 group-hover:scale-110 group-hover:text-indigo-400 transition-all duration-500 origin-left">
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </BorderGlow>
          ))}
        </div>
      </div>
    </section>
  );
}
