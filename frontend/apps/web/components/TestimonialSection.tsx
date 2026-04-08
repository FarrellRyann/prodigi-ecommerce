"use client";

import React from "react";
import { 
  Quote, 
  Star,
  CheckCircle2
} from "lucide-react";

import BorderGlow from "./BorderGlow";

export default function TestimonialSection() {
  const testimonials = [
    {
      id: 1,
      quote: "ProDigi changed how I build my digital products. The quality of UI kits here is unparalleled.",
      author: "Sarah Jenkins",
      role: "Lead UI Designer @ FutureLab",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
    },
    {
      id: 2,
      quote: "The 3D assets are a game-changer for my game dev projects. Incredible workflow boost.",
      author: "Alex Rivera",
      role: "Independent Game Developer",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    },
    {
      id: 3,
      quote: "Secure, fast, and a huge selection. Literally the only place I source my assets now.",
      author: "Maya Chen",
      role: "Creative Director",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-black isolate">
      {/* Dynamic Background Glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[160px] -z-10" />

      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-2 text-pink-400 font-bold tracking-[0.2em] uppercase text-[10px]">
             Trusted by Experts
          </div>
          <h2 className="text-4xl md:text-5xl font-black font-heading tracking-tighter text-white">
            Built For <br />
            <span className="text-white/30 italic">High Performance Teams.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <BorderGlow
              key={idx}
              borderRadius={40}
              glowColor="330 80 80"
              colors={['#ec4899', '#d946ef', '#8b5cf6']}
              className="transition-all duration-500 hover:-translate-y-2"
            >
              <div 
                className="relative p-8 h-full"
              >
                <div className="absolute top-8 right-8 text-pink-500/20 group-hover:text-pink-500/40 transition-colors">
                  <Quote className="w-12 h-12" />
                </div>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    ))}
                  </div>

                  <p className="text-lg font-medium text-white/90 leading-relaxed group-hover:text-white transition-colors">
                    &quot;{test.quote}&quot;
                  </p>

                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 group-hover:border-pink-500/30 transition-colors shadow-lg shadow-black/50">
                      <img src={test.image} alt={test.author} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white group-hover:text-pink-400 transition-colors flex items-center gap-1.5">
                        {test.author}
                        <CheckCircle2 className="w-3 h-3 text-blue-400" />
                      </h4>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 group-hover:text-gray-400 transition-colors">
                        {test.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </BorderGlow>
          ))}
        </div>
      </div>
    </section>
  );
}
