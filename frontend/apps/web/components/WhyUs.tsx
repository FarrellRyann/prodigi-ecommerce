"use client";

import React from "react";
import { Zap, Star, CheckCircle2, Package } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: <Zap className="w-5 h-5 text-amber-400" />,
    bg: "bg-amber-500/10",
    title: "Instant Access",
    desc: "Get immediate access to all purchased assets right after payment. No waiting.",
  },
  {
    icon: <Star className="w-5 h-5 text-indigo-400" />,
    bg: "bg-indigo-500/10",
    title: "Premium Quality",
    desc: "Every asset is curated and verified by our editorial team for top-tier standards.",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    bg: "bg-emerald-500/10",
    title: "Lifetime License",
    desc: "One purchase, unlimited use. No recurring fees on digital files.",
  },
  {
    icon: <Package className="w-5 h-5 text-violet-400" />,
    bg: "bg-violet-500/10",
    title: "Growing Library",
    desc: "New products added weekly to keep your creative toolkit fresh.",
  },
];

export default function WhyUs() {
  return (
    <section className="py-20 px-6 bg-black">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-14 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Why ProDigi</p>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
            Built for Creators,{" "}
            <span className="text-white/25 italic">by Creators.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] hover:-translate-y-1 transition-all duration-300 group space-y-4"
            >
              <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1.5">{f.title}</h3>
                <p className="text-[11px] text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
