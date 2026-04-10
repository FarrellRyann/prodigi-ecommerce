"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { formatIDR } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { SkeletonCard } from "@/components/SkeletonCard";
import {
  Search, X, SlidersHorizontal, ShoppingCart,
  LayoutGrid, List, Package, CheckCircle2, ArrowUpDown, Tag
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";

interface Category { id: string; name: string; }
interface Product {
  id: string; name: string; description: string;
  price: number; imageUrl: string | null; category: Category; productType: string;
  tags: string[];
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "name_asc", label: "Name A → Z" },
];

const TYPE_FILTERS = [
  { value: "", label: "All" },
  { value: "FILE", label: "Downloads" },
  { value: "COURSE", label: "Courses" },
  { value: "SUBSCRIPTION", label: "Membership" },
  { value: "LICENSE_KEY", label: "Keys" },
];

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { addItem, items } = useCart();

  // Read ?tag= from URL on mount
  useEffect(() => {
    const tagParam = searchParams?.get("tag");
    if (tagParam) setSelectedTag(decodeURIComponent(tagParam));
  }, [searchParams]);
  const { user } = useAuth();
  const { owned } = useToast();

  // Fetch owned library product IDs
  const { data: libraryData } = useQuery<{ productId: string }[]>({
    queryKey: ["library-ids"],
    queryFn: async () => {
      const res = await api.get("/library");
      const items = res.data?.data ?? res.data ?? [];
      return items.map((item: any) => ({ productId: item.productId ?? item.product?.id }));
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  const ownedProductIds = new Set((libraryData ?? []).map(l => l.productId));
  const isOwned = (id: string) => ownedProductIds.has(id);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  const { data: rawProducts, isLoading } = useQuery<Product[]>({
    queryKey: ["products", selectedCategory, debouncedSearch],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (selectedCategory) p.set("categoryId", selectedCategory);
      if (debouncedSearch) p.set("search", debouncedSearch);
      return (await api.get(`/products?${p}`)).data;
    },
  });

  // Client-side sort + type + tag filter
  const products = React.useMemo(() => {
    let list = rawProducts ?? [];
    if (selectedType) list = list.filter(p => p.productType === selectedType);
    if (selectedTag) list = list.filter(p => p.tags?.includes(selectedTag));
    if (sortBy === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === "name_asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [rawProducts, selectedType, selectedTag, sortBy]);

  // Collect all unique tags from fetched products
  const allTags = React.useMemo(() => {
    const set = new Set<string>();
    (rawProducts ?? []).forEach(p => p.tags?.forEach(t => set.add(t)));
    return [...set].sort();
  }, [rawProducts]);

  const isInCart = (id: string) => items.some(i => i.id === id);
  const hasFilters = selectedCategory || selectedType || selectedTag || debouncedSearch;

  return (
    <div className="min-h-screen bg-black pt-24 pb-24">
      <div className="container mx-auto px-6">

        {/* Page Header */}
        <div className="mb-10 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Marketplace</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
            Digital <span className="text-white/20 italic">Assets.</span>
          </h1>
          <p className="text-gray-500 font-medium">Browse {rawProducts?.length ?? "…"} premium assets, UI kits, courses & more.</p>
        </div>

        {/* Search Bar + Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-11 pr-10 py-3.5 text-sm font-medium text-white placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-600 hover:text-white transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none bg-white/[0.03] border border-white/5 rounded-2xl pl-4 pr-10 py-3.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-black">{o.label}</option>)}
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
            </div>
            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5">
              <button onClick={() => setViewMode("grid")} className={cn("p-2.5 rounded-lg transition-all", viewMode === "grid" ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-white")}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("list")} className={cn("p-2.5 rounded-lg transition-all", viewMode === "list" ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-white")}>
                <List className="w-4 h-4" />
              </button>
            </div>
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="sm:hidden flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-xs font-bold text-gray-400 hover:text-white transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters — Desktop */}
          <aside className={cn(
            "w-56 flex-shrink-0 space-y-6 hidden sm:block"
          )}>
            {/* Type Filter */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-3">Asset Type</p>
              <div className="space-y-1">
                {TYPE_FILTERS.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setSelectedType(t.value)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                      selectedType === t.value
                        ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                        : "text-gray-500 hover:text-white hover:bg-white/[0.03]"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Category Filter */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-3">Category</p>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={cn("w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                    selectedCategory === "" ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20" : "text-gray-500 hover:text-white hover:bg-white/[0.03]")}
                >All Categories</button>
                {categories?.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn("w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                      selectedCategory === cat.id ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20" : "text-gray-500 hover:text-white hover:bg-white/[0.03]")}
                  >{cat.name}</button>
                ))}
              </div>
            </div>
            {/* Clear Filters */}
            {hasFilters && (
              <button
                onClick={() => { setSelectedCategory(""); setSelectedType(""); setSelectedTag(""); setSearch(""); }}
                className="w-full px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-red-400 border border-white/5 hover:border-red-500/20 transition-all"
              >
                Clear All Filters
              </button>
            )}

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-3">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide transition-all border",
                        selectedTag === tag
                          ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                          : "bg-white/[0.02] border-white/5 text-gray-600 hover:text-white hover:border-white/10"
                      )}
                    >
                      <Tag className="w-2.5 h-2.5" />{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Product Area */}
          <div className="flex-grow min-w-0">
            {/* Results count */}
            {!isLoading && (
              <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-6">
                {products.length} asset{products.length !== 1 ? "s" : ""}{hasFilters ? " matching filters" : ""}
              </p>
            )}

            {/* Loading Skeletons */}
            {isLoading && (
              <div className={cn("gap-5", viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col")}>
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* GRID VIEW */}
            {!isLoading && viewMode === "grid" && (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                initial="hidden" animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
              >
                <AnimatePresence>
                  {products.map(product => (
                    <motion.div
                      key={product.id}
                      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
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
                            <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest text-white/80">
                              {product.productType === "FILE" ? "Download" : product.productType === "COURSE" ? "Course" : "Membership"}
                            </span>
                          </div>
                        </div>
                        <div className="p-5 space-y-3">
                          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">{product.category?.name}</p>
                          <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">{product.name}</h3>
                          <p className="text-[11px] text-gray-600 line-clamp-2 min-h-[2rem]">{product.description}</p>
                          {product.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {product.tags.slice(0, 3).map(tag => (
                                <button
                                  key={tag}
                                  onClick={e => { e.preventDefault(); setSelectedTag(selectedTag === tag ? "" : tag); }}
                                  className={cn(
                                    "flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border transition-all",
                                    selectedTag === tag
                                      ? "bg-indigo-600/20 border-indigo-500/30 text-indigo-300"
                                      : "bg-white/[0.03] border-white/5 text-gray-600 hover:text-indigo-400 hover:border-indigo-500/20"
                                  )}
                                >
                                  <Tag className="w-2 h-2" />{tag}
                                </button>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className="text-base font-black text-white">{formatIDR(product.price)}</span>
                            <button
                              onClick={e => {
                                e.preventDefault();
                                if (isOwned(product.id)) {
                                  owned(product.name);
                                } else if (!isInCart(product.id)) {
                                  addItem({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl ?? "" });
                                }
                              }}
                              className={cn(
                                "p-2 rounded-xl border transition-all",
                                isInCart(product.id)
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                  : "bg-white/5 border-white/10 text-gray-500 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white"
                              )}
                            >
                              {isInCart(product.id) ? <CheckCircle2 className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* LIST VIEW */}
            {!isLoading && viewMode === "list" && (
              <div className="rounded-3xl border border-white/5 overflow-hidden bg-white/[0.02]">
                {products.length === 0 ? (
                  <div className="text-center py-16 text-gray-600 text-[10px] font-black uppercase tracking-widest">No assets found</div>
                ) : products.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                    className="flex items-center gap-5 px-6 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-0 group"
                  >
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/[0.04] flex-shrink-0 border border-white/5">
                      <img
                        src={resolveImageUrl(product.imageUrl) || "https://images.unsplash.com/photo-1614850523296-d8c1af03d400?auto=format&fit=crop&q=80&w=200"}
                        alt={product.name} className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <Link href={`/shop/${product.id}`}>
                        <p className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">{product.name}</p>
                      </Link>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        <p className="text-[10px] text-gray-600 font-medium">{product.category?.name} · {product.productType}</p>
                        {product.tags?.slice(0, 2).map(tag => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                            className={cn(
                              "flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border transition-all",
                              selectedTag === tag
                                ? "bg-indigo-600/20 border-indigo-500/30 text-indigo-300"
                                : "bg-white/[0.03] border-white/5 text-gray-500 hover:text-indigo-400"
                            )}
                          >
                            <Tag className="w-2 h-2" />{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm font-black text-white flex-shrink-0">{formatIDR(product.price)}</span>
                    <button
                      onClick={() => {
                        if (isOwned(product.id)) {
                          owned(product.name);
                        } else if (!isInCart(product.id)) {
                          addItem({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl ?? "" });
                        }
                      }}
                      className={cn(
                        "p-2 rounded-xl border transition-all flex-shrink-0",
                        isInCart(product.id)
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-white/[0.03] border-white/5 text-gray-600 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white"
                      )}
                    >
                      {isInCart(product.id) ? <CheckCircle2 className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/5 rounded-3xl gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                  <Package className="w-7 h-7 text-gray-700" />
                </div>
                <p className="text-gray-500 font-bold text-sm">No assets found</p>
                {hasFilters && (
                  <button onClick={() => { setSelectedCategory(""); setSelectedType(""); setSearch(""); }} className="text-indigo-400 hover:text-indigo-300 text-xs font-bold transition-colors">
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
