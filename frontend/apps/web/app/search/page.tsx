"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatIDR } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/image";
import { useCart } from "@/context/CartContext";
import { Search, X, SlidersHorizontal, ShoppingCart, ArrowRight, Package } from "lucide-react";
import { SkeletonCard } from "@/components/SkeletonCard";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Category { id: string; name: string; }
interface Product {
  id: string; name: string; description: string; price: number;
  imageUrl: string | null; category: Category; productType: string;
}

const TYPES = [
  { value: "", label: "All Types" },
  { value: "FILE", label: "Downloads" },
  { value: "COURSE", label: "Courses" },
  { value: "SUBSCRIPTION", label: "Membership" },
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [debouncedQ, setDebouncedQ] = useState(initialQ);
  const [selectedType, setSelectedType] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const { addItem, items } = useCart();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (debouncedQ) {
      router.replace(`/search?q=${encodeURIComponent(debouncedQ)}`, { scroll: false });
    }
  }, [debouncedQ, router]);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["search", debouncedQ, selectedType, selectedCat],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (debouncedQ) p.set("search", debouncedQ);
      if (selectedType) p.set("type", selectedType);
      if (selectedCat) p.set("categoryId", selectedCat);
      return (await api.get(`/products?${p}`)).data;
    },
    enabled: true,
  });

  const isInCart = (id: string) => items.some(i => i.id === id);

  return (
    <div className="min-h-screen bg-black pt-28 pb-24">
      {/* Search Hero */}
      <div className="container mx-auto px-6 mb-10">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4">Search</p>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search digital assets, courses, templates..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-14 pr-14 py-5 text-lg font-medium text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.06] transition-all"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-10">
          {/* Type Filter */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/5">
            {TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedType === t.value ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {/* Category Filter */}
          {categories?.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(prev => prev === cat.id ? "" : cat.id)}
              className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedCat === cat.id
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-white/[0.02] border-white/5 text-gray-500 hover:text-white hover:border-white/20"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results info */}
        {!isLoading && debouncedQ && (
          <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-8">
            {products?.length ?? 0} result{products?.length !== 1 ? "s" : ""} for &ldquo;{debouncedQ}&rdquo;
          </p>
        )}

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products && products.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            <AnimatePresence>
              {products.map(product => (
                <motion.div
                  key={product.id}
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  className="group relative rounded-3xl overflow-hidden border border-white/5 bg-white/[0.03] hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300"
                >
                  <Link href={`/shop/${product.id}`}>
                    <div className="aspect-[4/3] overflow-hidden bg-white/[0.03]">
                      <img
                        src={resolveImageUrl(product.imageUrl) || "https://images.unsplash.com/photo-1614850523296-d8c1af03d400?auto=format&fit=crop&q=80&w=600"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5 space-y-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">{product.category?.name}</p>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">{product.name}</h3>
                      <p className="text-[11px] text-gray-500 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-base font-black text-white">{formatIDR(product.price)}</span>
                        <button
                          onClick={e => {
                            e.preventDefault();
                            if (!isInCart(product.id)) {
                              addItem({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl ?? "" });
                            }
                          }}
                          className={`p-2 rounded-xl border transition-all ${
                            isInCart(product.id)
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : "bg-white/5 border-white/10 text-gray-400 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white"
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/5 rounded-3xl gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.03] flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-700" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-white font-bold">No results found</p>
              <p className="text-gray-600 text-sm">Try a different keyword or remove filters</p>
            </div>
            <Link href="/shop" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-bold transition-colors">
              Browse all assets <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
