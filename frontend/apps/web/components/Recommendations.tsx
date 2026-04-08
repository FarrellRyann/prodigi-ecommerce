"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles,
  ArrowRight,
  Zap,
  Star,
  Loader2
} from "lucide-react";
import GlassSurface from "./GlassSurface";
import api from "@/lib/api";
import { formatIDR } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/image";

type Product = {
  id: string;
  name: string;
  category: { name: string };
  imageUrl: string | null;
  price: number;
};

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await api.get("/products/recommendations");
        setRecommendations(response.data);
      } catch (error) {
        console.error("Failed to fetch recommendations", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden bg-black isolate">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Driven Suggestions
             </div>
             <h2 className="text-4xl font-black font-heading tracking-tighter text-white">
               Recommended <span className="text-white/20 italic">for you.</span>
             </h2>
          </div>
          
          <button className="flex items-center gap-2 text-indigo-400 font-bold text-[11px] uppercase tracking-widest group hover:text-indigo-300 transition-colors">
            See all suggestions <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recommendations.map((item) => (
            <GlassSurface
              key={item.id}
              width="100%"
              height="auto"
              borderRadius={40}
              blur={15}
              opacity={0.3}
              brightness={30}
              className="p-6 border border-white/5 group hover:border-indigo-500/30 transition-all duration-500"
            >
               <div className="aspect-video rounded-3xl overflow-hidden mb-6 relative bg-white/5">
                  <img 
                    src={resolveImageUrl(item.imageUrl) || "https://images.unsplash.com/photo-1614850523296-d8c1af03d400?auto=format&fit=crop&q=80&w=600"} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-green-400">
                     98% Match
                  </div>
               </div>

               <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{item.category.name}</div>
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight truncate">{item.name}</h3>
                  </div>
                  
                  <div className="flex items-center justify-between">
                     <div className="text-lg font-black text-white">
                        {formatIDR(item.price)}
                     </div>
                     <button className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black transition-all">
                        <Zap className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            </GlassSurface>
          ))}
        </div>
      </div>
    </section>
  );
}
