"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatIDR } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  ArrowLeft, ShoppingCart, ShieldCheck, Package, FileBox,
  Zap, Star, Download, CheckCircle2, Loader2, Tag
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";
import Recommendations from "@/components/Recommendations";

interface Category { id: string; name: string; }
interface Product {
  id: string; name: string; description: string; price: number;
  imageUrl: string | null; productType: string; category: Category;
  downloadUrl?: string | null; accessUrl?: string | null;
  tags: string[];
}

const TYPE_META: Record<string, { label: string; color: string }> = {
  FILE:        { label: "Digital Download", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  COURSE:      { label: "Live Course",      color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  SUBSCRIPTION:{ label: "Membership",       color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  LICENSE_KEY: { label: "License Key",      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
};

const INCLUDES = [
  { icon: <FileBox className="w-4 h-4 text-indigo-400" />, title: "Source Files", desc: "All source files in original format" },
  { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, title: "Commercial License", desc: "Use in unlimited personal & commercial projects" },
  { icon: <Zap className="w-4 h-4 text-amber-400" />, title: "Lifetime Updates", desc: "Get all future versions for free" },
  { icon: <Download className="w-4 h-4 text-violet-400" />, title: "Instant Access", desc: "Available immediately after payment" },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { addItem, items } = useCart();
  const { user } = useAuth();
  const { owned: toastOwned } = useToast();
  const [added, setAdded] = React.useState(false);

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => (await api.get(`/products/${id}`)).data,
  });

  // Check if already in user's library
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

  const isOwned = (libraryData ?? []).some(l => l.productId === id);
  const isInCart = items.some(item => item.id === id);

  const handleAddToCart = () => {
    if (isOwned) {
      toastOwned(product?.name);
      return;
    }
    if (product && !isInCart) {
      addItem({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl ?? "" });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 p-6">
        <Package className="w-12 h-12 text-gray-700" />
        <h1 className="text-2xl font-black text-white">Product Not Found</h1>
        <Link href="/shop" className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl text-sm uppercase tracking-widest">
          Back to Shop
        </Link>
      </div>
    );
  }

  const imgSrc = resolveImageUrl(product.imageUrl) || "https://images.unsplash.com/photo-1614850523296-d8c1af03d400?auto=format&fit=crop&q=80&w=1200";
  const typeMeta = TYPE_META[product.productType] ?? { label: product.productType, color: "text-gray-400 bg-white/5 border-white/10" };

  return (
    <div className="min-h-screen bg-black">

      {/* Hero Image — Fullscreen with gradient */}
      <div className="relative h-[55vh] min-h-[400px] w-full overflow-hidden">
        <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-8 left-6 flex items-center gap-2 text-white/80 hover:text-white bg-black/40 backdrop-blur-sm border border-white/10 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-black/60"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 -mt-24 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* LEFT — Product Info */}
          <div className="lg:col-span-7 space-y-10">
            {/* Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest", typeMeta.color)}>
                <Tag className="w-3 h-3" /> {typeMeta.label}
              </span>
              {product.category && (
                <span className="px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {product.category.name}
                </span>
              )}
            </div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight"
            >
              {product.name}
            </motion.h1>

            {/* Rating (decorative) */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
                <span className="text-sm font-bold text-white ml-2">5.0</span>
                <span className="text-gray-600 text-[11px] font-medium ml-1">(48 reviews)</span>
              </div>
              <div className="h-4 w-[1px] bg-white/10" />
              <div className="flex items-center gap-1.5 text-gray-500 text-[11px] font-bold">
                <Download className="w-3.5 h-3.5" /> 1.2k downloads
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-gray-400 font-medium leading-relaxed text-base">
                {product.description || "Unlock the full potential of your creative workflow with this premium digital asset. Crafted with precision for modern artists and developers."}
              </p>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map(tag => (
                    <Link
                      key={tag}
                      href={`/shop?tag=${encodeURIComponent(tag)}`}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] font-bold text-gray-500 uppercase tracking-wide hover:text-indigo-400 hover:border-indigo-500/20 transition-all"
                    >
                      <Tag className="w-2.5 h-2.5" />{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* What's Included */}
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-5">What&apos;s Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {INCLUDES.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{item.title}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest border-t border-white/5 pt-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
              {product.category && (
                <>
                  <span>/</span>
                  <span className="text-gray-500">{product.category.name}</span>
                </>
              )}
              <span>/</span>
              <span className="text-white">{product.name}</span>
            </div>
          </div>

          {/* RIGHT — Purchase Card (Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-3xl bg-white/[0.03] border border-white/5 overflow-hidden"
            >
              {/* Price Area */}
              <div className="p-8 space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">Single License</p>
                  <p className="text-4xl font-black text-white tracking-tight">{formatIDR(product.price)}</p>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={(!isOwned && isInCart) || added}
                    className={cn(
                      "w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95",
                      (isInCart && !isOwned) || added
                        ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 cursor-default"
                        : "bg-white text-black hover:bg-gray-100 shadow-xl shadow-white/5"
                    )}
                  >
                    {added ? (
                      <><CheckCircle2 className="w-5 h-5" /> Added!</>
                    ) : (isInCart && !isOwned) ? (
                      <><CheckCircle2 className="w-5 h-5" /> In Cart</>
                    ) : (
                      <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                    )}
                  </button>
                  {isInCart && !isOwned && (
                    <Link href="/checkout" className="block w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                      Go to Cart → Checkout
                    </Link>
                  )}
                </div>

                {/* Trust */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  {[
                    { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "Secure Payment" },
                    { icon: <Zap className="w-3.5 h-3.5" />, label: "Instant Access" },
                  ].map((badge, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                      <span className="text-emerald-400">{badge.icon}</span> {badge.label}
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-gray-600 text-center leading-relaxed border-t border-white/5 pt-4">
                  30-day money-back guarantee. No questions asked.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-24">
          <Recommendations />
        </div>
      </div>
    </div>
  );
}
