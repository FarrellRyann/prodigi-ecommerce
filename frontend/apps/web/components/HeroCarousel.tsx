"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Sparkles, ShoppingBag } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import Grainient from "./Grainient";

const slides = [
  {
    id: 1,
    badge: "Limited Edition",
    title: "Vortex UI Collection",
    subtitle: "A hyperspace-inspired design system with 200+ unique components for the next generation of web applications.",
    color: "#5227FF",
    image: "https://images.unsplash.com/photo-1614850523296-d8c1af03d400?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: 2,
    badge: "Trending Now",
    title: "Synthwave Audio Kit",
    subtitle: "High-fidelity modular samples and loops designed to evoke the retro-futuristic essence of the 80s neon grid.",
    color: "#FF278D",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: 3,
    badge: "Staff Pick",
    title: "Isometric City Engine",
    subtitle: "Complete 3D construction kit for building sprawling low-poly digital metropolises with realistic lighting.",
    color: "#00F0FF",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200",
  }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  const currentSlide = (slides[current] || slides[0]) as typeof slides[0];

  return (
    <section className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {/* Background Layer */}
          <div className="absolute inset-0 z-0">
            <img 
              src={currentSlide.image} 
              alt={currentSlide.title} 
              className="w-full h-full object-cover opacity-60 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            
            {/* Dynamic Grainient Overlay matching slide color */}
            <div className="absolute inset-0 opacity-30 mix-blend-overlay">
               <Grainient 
                 color1={currentSlide.color}
                 color2="#000000"
                 color3="#111111"
                 timeSpeed={0.1}
               />
            </div>
          </div>

          {/* Content Layer */}
          <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center max-w-5xl">
             <div className="space-y-8">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/80">
                    {currentSlide.badge}
                  </span>
                </motion.div>

                <motion.h1 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-5xl md:text-8xl font-black font-heading tracking-tight text-white leading-none"
                >
                  {currentSlide.title.split(' ').map((word: string, i: number) => (
                    <span key={i} className={i === 0 ? "block mb-2" : "text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20"}>
                      {word}{' '}
                    </span>
                  ))}
                </motion.h1>

                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-400 text-lg md:text-xl font-medium max-w-xl leading-relaxed"
                >
                  {currentSlide.subtitle}
                </motion.p>

                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-wrap gap-4 pt-4"
                >
                  <Button className="bg-white text-black hover:bg-gray-200 rounded-2xl h-14 px-10 text-md font-bold flex items-center gap-2 group transition-all hover:scale-105 active:scale-95 shadow-2xl">
                    Get Started <Zap className="w-5 h-5 fill-current" />
                  </Button>
                  <Button variant="outline" className="bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-2xl h-14 px-10 text-md font-bold flex items-center gap-2 backdrop-blur-xl group">
                    View Details <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
             </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-12 right-12 z-20 flex items-center gap-4">
        <button 
          onClick={prevSlide}
          className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-12 left-12 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              current === i ? "w-12 bg-white" : "w-4 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
