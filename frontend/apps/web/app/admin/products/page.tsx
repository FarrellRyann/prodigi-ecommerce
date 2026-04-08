"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import AdminSidebar from "@/components/AdminSidebar";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ExternalLink,
  Loader2,
  Package,
  Filter,
  LayoutGrid,
  List,
  Tag,
  TrendingUp,
  Download,
  Star
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatIDR } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/image";

interface Category { id: string; name: string; }
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: Category;
  createdAt: string;
  description?: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["admin", "products"],
    queryFn: async () => { const res = await api.get("/products"); return res.data; },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["admin", "categories"],
    queryFn: async () => { const res = await api.get("/categories"); return res.data; },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/products/${id}`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });

  const filtered = products?.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || p.category?.name === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex min-h-screen bg-black overflow-hidden isolate">
      <div className="absolute top-0 left-72 w-[500px] h-[400px] bg-indigo-600/5 blur-[200px] -z-10" />
      <AdminSidebar />
      <main className="flex-grow ml-72 h-screen overflow-y-auto scrollbar-hide py-12 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Header */}
          <div className="flex items-center justify-between pb-8 border-b border-white/5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400">
                <Package size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Asset Registry</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter">
                Product <span className="text-indigo-500 italic">Library.</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-white"}`}
                >
                  <List size={14} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-white"}`}
                >
                  <LayoutGrid size={14} />
                </button>
              </div>
              <Button
                asChild
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 px-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
              >
                <Link href="/admin/products/new">
                  <Plus size={14} /> New Asset
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-5">
            {[
              { label: "Total Assets", value: products?.length ?? 0, color: "text-white" },
              { label: "Categories", value: categories?.length ?? 0, color: "text-indigo-400" },
              { label: "Avg. Price", value: products?.length ? formatIDR(products.reduce((a, p) => a + p.price, 0) / products.length) : "—", color: "text-emerald-400" },
            ].map(s => (
              <div key={s.label} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">{s.label}</p>
                <p className={`text-3xl font-black tracking-tighter ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow max-w-sm">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCategoryFilter("All")}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${categoryFilter === "All" ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white/[0.02] border-white/5 text-gray-500 hover:text-white hover:border-white/20"}`}
              >
                All
              </button>
              {categories?.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.name)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${categoryFilter === cat.name ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white/[0.02] border-white/5 text-gray-500 hover:text-white hover:border-white/20"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="text-indigo-500 animate-spin" />
            </div>
          )}

          {/* GRID VIEW */}
          {!isLoading && viewMode === "grid" && (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence>
                {filtered?.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.04 }}
                    className="group rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden hover:border-indigo-500/30 transition-all"
                  >
                    <div className="relative h-40 bg-white/[0.03] overflow-hidden">
                      {product.imageUrl ? (
                        <img src={resolveImageUrl(product.imageUrl)!} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={24} className="text-gray-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                          className="p-2 rounded-xl bg-black/60 backdrop-blur-sm text-white hover:bg-indigo-600 transition-all border border-white/10"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => { if (confirm("Delete this product?")) deleteMutation.mutate(product.id); }}
                          className="p-2 rounded-xl bg-black/60 backdrop-blur-sm text-white hover:bg-red-500 transition-all border border-white/10"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-xs font-bold text-white line-clamp-1">{product.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-black uppercase tracking-widest">{product.category?.name}</span>
                        <span className="text-sm font-black text-white">{formatIDR(product.price)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* LIST VIEW */}
          {!isLoading && viewMode === "list" && (
            <div className="rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-white/5 bg-white/[0.01]">
                {[["Asset", 4], ["Category", 2], ["Price", 2], ["Created", 2], ["", 2]].map(([label, span], i) => (
                  <span key={i} className={`col-span-${span} text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] ${i === 4 ? "text-right" : ""}`}>{label}</span>
                ))}
              </div>
              <div className="divide-y divide-white/[0.03]">
                {!filtered?.length ? (
                  <div className="text-center py-20 text-gray-600 text-[10px] font-black uppercase tracking-widest">No products found</div>
                ) : filtered.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="grid grid-cols-12 gap-4 px-8 py-5 hover:bg-white/[0.02] transition-colors items-center group"
                  >
                    <div className="col-span-4 flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-white/[0.03] border border-white/5 flex-shrink-0">
                        {product.imageUrl 
                          ? <img src={resolveImageUrl(product.imageUrl)!} alt={product.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-gray-600" /></div>
                        }
                      </div>
                      <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">{product.name}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/10 text-[9px] font-black uppercase tracking-widest text-indigo-400">
                        {product.category?.name ?? "—"}
                      </span>
                    </div>
                    <span className="col-span-2 text-sm font-black text-white">{product.price != null ? formatIDR(product.price) : "Free"}</span>
                    <span className="col-span-2 text-[11px] font-medium text-gray-600">{new Date(product.createdAt).toLocaleDateString()}</span>
                    <div className="col-span-2 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                        className="p-2 rounded-xl bg-white/5 border border-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => { if (confirm("Delete this product?")) deleteMutation.mutate(product.id); }}
                        className="p-2 rounded-xl bg-red-500/5 border border-red-500/5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
