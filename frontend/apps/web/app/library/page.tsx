"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatIDR } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/image";
import { useAuth } from "@/context/AuthContext";
import {
  Download, ExternalLink, Clock, BookOpen, Sparkles, Loader2,
  Package, Library, ArrowRight, Search, CheckCircle2, FileBadge, Monitor
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";
import { resolveImageUrl as resolveImg } from "@/lib/image";

interface LibraryItem {
  id: string;
  productId: string;
  purchasedAt: string;
  expiresAt: string | null;
  downloadUrlSnapshot?: string | null;
  accessUrlSnapshot?: string | null;
  product: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    productType: "COURSE" | "FILE" | "SUBSCRIPTION";
    downloadUrl?: string | null;
    accessUrl?: string | null;
  };
}

const TYPE_TABS = [
  { value: "", label: "All", icon: <Package className="w-3.5 h-3.5" /> },
  { value: "FILE", label: "Downloads", icon: <Download className="w-3.5 h-3.5" /> },
  { value: "COURSE", label: "Courses", icon: <Monitor className="w-3.5 h-3.5" /> },
  { value: "SUBSCRIPTION", label: "Membership", icon: <FileBadge className="w-3.5 h-3.5" /> },
];

export default function LibraryPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: libraryItems, isLoading } = useQuery<LibraryItem[]>({
    queryKey: ["library"],
    queryFn: async () => (await api.get("/library")).data.data,
    enabled: !!user,
  });

  const handleDownload = async (productId: string, item: LibraryItem) => {
    setDownloadingId(productId);
    try {
      const res = await api.get(`/library/${productId}/download`);
      const url = res.data?.data?.downloadUrl || res.data?.downloadUrl || item.downloadUrlSnapshot || item.product.downloadUrl;
      if (url) window.open(url, "_blank");
    } catch {
      // fallback to snapshot
      const fallback = item.downloadUrlSnapshot || item.product.downloadUrl;
      if (fallback) window.open(fallback, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleAccess = (item: LibraryItem) => {
    const url = item.accessUrlSnapshot || item.product.accessUrl;
    if (url) window.open(url, "_blank");
  };

  const filtered = libraryItems?.filter(item => {
    const matchSearch = item.product.name.toLowerCase().includes(search.toLowerCase());
    const matchType = !activeType || item.product.productType === activeType;
    return matchSearch && matchType;
  });

  const totalByType = (type: string) => libraryItems?.filter(i => !type || i.product.productType === type).length ?? 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Library className="w-10 h-10 text-gray-600 mx-auto" />
          <p className="text-gray-500 font-bold">Sign in to access your library</p>
          <Link href="/login" className="inline-block px-6 py-3 bg-indigo-600 text-white text-sm font-black rounded-xl uppercase tracking-widest">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-28 pb-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[250px] -z-10" />

      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" /> Your Collection
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              Digital <span className="text-white/20 italic">Library.</span>
            </h1>
            <p className="text-gray-500 font-medium text-sm">
              {libraryItems?.length ?? "…"} asset{(libraryItems?.length ?? 0) !== 1 ? "s" : ""} in your collection
            </p>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search library..."
              className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-white placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
        </div>

        {/* Type Tabs */}
        <div className="flex items-center gap-2 mb-10 p-1.5 rounded-2xl bg-white/[0.03] border border-white/5 w-fit">
          {TYPE_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveType(tab.value)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeType === tab.value
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-gray-500 hover:text-white"
              )}
            >
              {tab.icon}
              {tab.label}
              <span className={cn(
                "ml-1 px-1.5 py-0.5 rounded-md text-[9px] font-black",
                activeType === tab.value ? "bg-white/20 text-white" : "bg-white/[0.05] text-gray-600"
              )}>
                {totalByType(tab.value)}
              </span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02] animate-pulse">
                <div className="h-48 bg-white/[0.04]" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-white/[0.06] rounded w-3/4" />
                  <div className="h-3 bg-white/[0.04] rounded w-full" />
                  <div className="h-9 bg-white/[0.05] rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {!isLoading && (filtered?.length ?? 0) > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          >
            <AnimatePresence>
              {filtered!.map((item) => {
                const img = resolveImageUrl(item.product.imageUrl);
                const isCourse = item.product.productType === "COURSE";
                const isSub = item.product.productType === "SUBSCRIPTION";
                const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date();

                return (
                  <motion.div
                    key={item.productId}
                    variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                    className="group rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02] hover:border-indigo-500/20 transition-all duration-300 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-white/[0.03]">
                      <img
                        src={img || "https://images.unsplash.com/photo-1614850523296-d8c1af03d400?auto=format&fit=crop&q=80&w=600"}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Type badge */}
                      <div className="absolute top-3 left-3">
                        <span className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest backdrop-blur-sm",
                          isCourse ? "bg-violet-500/20 border border-violet-500/30 text-violet-300"
                            : isSub ? "bg-amber-500/20 border border-amber-500/30 text-amber-300"
                            : "bg-indigo-500/20 border border-indigo-500/30 text-indigo-300"
                        )}>
                          {isCourse ? <Monitor className="w-3 h-3" /> : isSub ? <FileBadge className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                          {isCourse ? "Course" : isSub ? "Membership" : "Download"}
                        </span>
                      </div>
                      {/* Expiry */}
                      {isExpired && (
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-[9px] font-black text-red-400 uppercase tracking-widest">
                          Expired
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors leading-tight">
                          {item.product.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[10px] text-gray-600 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(item.purchasedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-600 line-clamp-2 flex-grow">
                        {item.product.description || "Secure digital asset with lifetime access."}
                      </p>

                      {/* Actions */}
                      <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-3">
                        {isCourse || isSub ? (
                          <button
                            onClick={() => handleAccess(item)}
                            className="flex-1 h-10 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                          >
                            <BookOpen className="w-3.5 h-3.5" /> Access Now
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDownload(item.productId, item)}
                            disabled={downloadingId === item.productId || !!isExpired}
                            className="flex-1 h-10 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 transition-all disabled:opacity-50"
                          >
                            {downloadingId === item.productId
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Download className="w-3.5 h-3.5" />
                            }
                            Download
                          </button>
                        )}
                        <Link
                          href={`/shop/${item.product.id}`}
                          className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && (filtered?.length ?? 0) === 0 && (
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/5 rounded-3xl gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.03] flex items-center justify-center">
              <Library className="w-8 h-8 text-gray-700" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-white font-bold">
                {search ? "No assets match your search" : "Your library is empty"}
              </p>
              <p className="text-gray-600 text-sm">
                {search ? "Try a different keyword" : "Purchase assets to see them here"}
              </p>
            </div>
            {!search && (
              <Link href="/shop" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-black rounded-xl uppercase tracking-widest hover:bg-indigo-700 transition-all">
                Browse Marketplace <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
