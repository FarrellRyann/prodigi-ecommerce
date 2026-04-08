"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatIDR } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/image";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, CheckCircle2, Loader2, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";

interface Product {
  id: string; name: string; description: string;
  price: number; imageUrl: string | null; category: { name: string };
}

export default function FeaturedProducts() {
  const { addItem, items } = useCart();
  const isInCart = (id: string) => items.some(i => i.id === id);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const res = await api.get("/products?limit=6");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02] animate-pulse">
                <div className="aspect-[4/3] bg-white/[0.04]" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-white/[0.06] rounded w-3/4" />
                  <div className="h-3 bg-white/[0.04] rounded w-full" />
                  <div className="h-8 bg-white/[0.05] rounded-xl mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products?.length) return null;

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Featured</p>
            <h2 className="text-3xl font-black text-white tracking-tighter">
              Trending <span className="text-white/25 italic">Assets.</span>
            </h2>
          </div>
          <Link href="/shop" className="flex items-center gap-2 text-gray-500 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {products.slice(0, 6).map(product => (
            <motion.div
              key={product.id}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="group rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02] hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300"
            >
              <Link href={`/shop/${product.id}`}>
                <div className="aspect-[4/3] overflow-hidden bg-white/[0.03] relative">
                  <img
                    src={resolveImageUrl(product.imageUrl) || "https://images.unsplash.com/photo-1614850523296-d8c1af03d400?auto=format&fit=crop&q=80&w=600"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest text-white/80 border border-white/10">
                      {product.category?.name || "Digital"}
                    </span>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">{product.name}</h3>
                  <p className="text-[11px] text-gray-600 line-clamp-2 min-h-[2rem]">{product.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-base font-black text-white">{formatIDR(product.price)}</span>
                    <button
                      onClick={e => {
                        e.preventDefault();
                        if (!isInCart(product.id)) addItem({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl ?? "" });
                      }}
                      className={cn(
                        "p-2 rounded-xl border transition-all",
                        isInCart(product.id)
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-white/[0.04] border-white/10 text-gray-500 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white"
                      )}
                    >
                      {isInCart(product.id) ? <CheckCircle2 className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
