"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { resolveImageUrl } from "@/lib/image";
import { formatIDR } from "@/lib/currency";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import Hero from "@/components/Hero";
import CategoryBento from "@/components/CategoryBento";
import FeaturesSection from "@/components/FeaturesSection";
import WhyUs from "@/components/WhyUs";
import CTASection from "@/components/CTASection";
import {
  Loader2, Library, ShoppingBag, Package,
  ArrowRight, Sparkles, ChevronRight, Zap, Download,
  Monitor, FileBadge, CheckCircle2, ShoppingCart, TrendingUp,
  Star, Clock, ChevronLeft, Play, Pause, Tag
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";

interface LibraryItem {
  productId: string;
  purchasedAt: string;
  product: { id: string; name: string; imageUrl: string | null; productType: string };
}

interface Product {
  id: string; name: string; price: number; description: string;
  imageUrl: string | null; category: { name: string }; productType: string; tags: string[];
}

// ─── Hero Carousel (Fullscreen) ───────────────────────────────────────────────
const CAROUSEL_INTERVAL = 4500;

const FALLBACK_SLIDES = [
  {
    id: "s1", tag: "Featured Drop", title: "Premium UI Kits", subtitle: "Crafted for modern products",
    description: "Pixel-perfect components built for speed. Figma + code ready.",
    cta: "Explore Now", href: "/shop",
    gradient: "from-indigo-900/80 via-indigo-950/60 to-black/90",
    accent: "from-indigo-400 to-violet-400", badge: "bg-indigo-500/15 border-indigo-500/25 text-indigo-300",
    img: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1400",
  },
  {
    id: "s2", tag: "Top Seller", title: "Design Templates", subtitle: "Ready in seconds",
    description: "Professionally designed templates to launch faster than ever.",
    cta: "Browse Templates", href: "/shop",
    gradient: "from-violet-900/80 via-purple-950/60 to-black/90",
    accent: "from-violet-400 to-purple-400", badge: "bg-violet-500/15 border-violet-500/25 text-violet-300",
    img: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&q=80&w=1400",
  },
  {
    id: "s3", tag: "New Arrival", title: "Digital Courses", subtitle: "Learn from the best",
    description: "Level up your skills with expert-led courses on design & code.",
    cta: "Start Learning", href: "/shop",
    gradient: "from-emerald-900/80 via-teal-950/60 to-black/90",
    accent: "from-emerald-400 to-teal-400", badge: "bg-emerald-500/15 border-emerald-500/25 text-emerald-300",
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1400",
  },
];

function HeroCarousel({ products }: { products: Product[] }) {
  const slides = products.length >= 3
    ? products.slice(0, 3).map((p, i) => ({
        id: p.id,
        tag: p.category?.name ?? "Featured",
        title: p.name,
        subtitle: formatIDR(p.price),
        description: p.description,
        cta: "View Product",
        href: `/shop/${p.id}`,
        gradient: FALLBACK_SLIDES[i]!.gradient,
        accent: FALLBACK_SLIDES[i]!.accent,
        badge: FALLBACK_SLIDES[i]!.badge,
        img: resolveImageUrl(p.imageUrl) || FALLBACK_SLIDES[i]!.img,
      }))
    : FALLBACK_SLIDES;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setIndex(prev => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex(prev => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, CAROUSEL_INTERVAL);
    return () => clearInterval(t);
  }, [paused, next]);

  const slide = slides[index];
  if (!slide) return null;

  const variants = {
    enter: (_d: number) => ({ opacity: 0, scale: 1.03 }),
    center: { opacity: 1, scale: 1 },
    exit: (_d: number) => ({ opacity: 0, scale: 0.98 }),
  };

  return (
    <div
      className="relative w-full h-screen min-h-[560px] max-h-[800px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
        >
          {/* Background image */}
          <img
            src={slide.img}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlays */}
          <div className={cn("absolute inset-0 bg-gradient-to-r", slide.gradient)} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />

          {/* Content */}
          <div className="absolute inset-0 flex items-end pb-24 px-6 md:px-12 lg:px-16">
            <div className="w-full max-w-7xl mx-auto">
              <div className="max-w-2xl space-y-5">
                <motion.span
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest", slide.badge)}
                >
                  <Zap className="w-2.5 h-2.5" /> {slide.tag}
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9]"
                >
                  {slide.title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
                  className={cn("text-sm font-black uppercase tracking-[0.2em] bg-gradient-to-r bg-clip-text text-transparent", slide.accent)}
                >
                  {slide.subtitle}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
                  className="text-sm text-gray-400 max-w-md leading-relaxed"
                >
                  {slide.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="flex items-center gap-3 pt-1"
                >
                  <Link
                    href={slide.href}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black text-xs font-black rounded-xl uppercase tracking-widest transition-all hover:bg-gray-100 hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/40"
                  >
                    {slide.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/shop"
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/15 text-white text-xs font-black rounded-xl uppercase tracking-widest transition-all hover:bg-white/20"
                  >
                    Browse All
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev/Next */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/50 transition-all"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/50 transition-all"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* Bottom controls */}
      <div className="absolute bottom-8 left-6 md:left-12 lg:left-16 z-20">
        <div className="max-w-7xl w-full flex items-center gap-4">
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === index ? "w-8 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
          </div>
          <button
            onClick={() => setPaused(p => !p)}
            className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center hover:bg-white/20 transition-all"
          >
            {paused ? <Play className="w-2.5 h-2.5 text-white" /> : <Pause className="w-2.5 h-2.5 text-white" />}
          </button>
          <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
            {index + 1} / {slides.length}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, href, accent }: {
  label: string; value: string | number; icon: React.ReactNode;
  href: string; accent: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04] transition-all"
    >
      <div className={`w-9 h-9 rounded-xl bg-${accent}-500/10 flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-grow min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">{label}</p>
        <p className="text-lg font-black text-white tracking-tight leading-tight">{value}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </Link>
  );
}

// ─── Library Shelf ────────────────────────────────────────────────────────────
function LibraryShelf({ items }: { items: LibraryItem[] }) {
  const typeIcon = (type: string) => {
    if (type === "COURSE") return <Monitor className="w-3 h-3" />;
    if (type === "SUBSCRIPTION") return <FileBadge className="w-3 h-3" />;
    return <Download className="w-3 h-3" />;
  };
  const typeColor = (type: string) => {
    if (type === "COURSE") return "text-violet-300 bg-violet-500/20 border-violet-500/30";
    if (type === "SUBSCRIPTION") return "text-amber-300 bg-amber-500/20 border-amber-500/30";
    return "text-indigo-300 bg-indigo-500/20 border-indigo-500/30";
  };

  return (
    <section className="pb-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-indigo-400" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-widest text-white">Recent Purchases</h2>
        </div>
        <Link href="/library" className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:text-indigo-400 transition-colors">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.slice(0, 4).map((item, i) => (
          <motion.div
            key={item.productId}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
          >
            <Link
              href="/library"
              className="group block rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] hover:border-indigo-500/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="aspect-video bg-white/[0.03] overflow-hidden relative">
                <img
                  src={resolveImageUrl(item.product.imageUrl) || "https://images.unsplash.com/photo-1614850523296-d8c1af03d400?auto=format&fit=crop&q=80&w=400"}
                  alt={item.product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-1.5 left-1.5">
                  <span className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border", typeColor(item.product.productType))}>
                    {typeIcon(item.product.productType)}
                    {item.product.productType === "FILE" ? "File" : item.product.productType === "COURSE" ? "Course" : "Sub"}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[11px] font-bold text-white truncate group-hover:text-indigo-300 transition-colors">{item.product.name}</p>
                <p className="text-[9px] text-gray-600 mt-0.5 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {new Date(item.purchasedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── New Arrivals — Horizontal scroll ─────────────────────────────────────────
function NewArrivals({ products, ownedIds }: { products: Product[]; ownedIds: Set<string> }) {
  const { addItem, items } = useCart();
  const { owned: toastOwned } = useToast();
  const isInCart = (id: string) => items.some(i => i.id === id);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "right" ? 280 : -280, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section className="pb-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-violet-500/15 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-violet-400" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-widest text-white">New Arrivals</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll("left")} className="w-6 h-6 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/10 transition-all">
            <ChevronLeft className="w-3 h-3 text-gray-400" />
          </button>
          <button onClick={() => scroll("right")} className="w-6 h-6 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/10 transition-all">
            <ChevronRight className="w-3 h-3 text-gray-400" />
          </button>
          <Link href="/shop" className="flex items-center gap-1 text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:text-violet-400 transition-colors ml-1">
            All <ArrowRight className="w-2.5 h-2.5" />
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className="flex-shrink-0 w-56 group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] hover:border-violet-500/20 hover:-translate-y-0.5 transition-all duration-300"
            style={{ scrollSnapAlign: "start" }}
          >
            <Link href={`/shop/${product.id}`}>
              <div className="aspect-[4/3] overflow-hidden bg-white/[0.03] relative">
                <img
                  src={resolveImageUrl(product.imageUrl) || "https://images.unsplash.com/photo-1614850523296-d8c1af03d400?auto=format&fit=crop&q=80&w=400"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-1.5 left-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-violet-500/20 border border-violet-500/30 text-[7px] font-black uppercase tracking-widest text-violet-300">New</span>
                </div>
              </div>
              <div className="p-3 space-y-1.5">
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest truncate">{product.category?.name}</p>
                <h3 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors truncate">{product.name}</h3>
                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[7px] font-bold text-gray-500 uppercase tracking-wide">
                        <Tag className="w-2 h-2" />{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.06]">
                  <span className="text-xs font-black text-white">{formatIDR(product.price)}</span>
                  <button
                    onClick={e => {
                      e.preventDefault();
                      if (ownedIds.has(product.id)) toastOwned(product.name);
                      else if (!isInCart(product.id)) addItem({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl ?? "" });
                    }}
                    className={cn(
                      "p-1.5 rounded-lg border transition-all",
                      isInCart(product.id)
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-white/[0.04] border-white/10 text-gray-600 hover:bg-violet-600 hover:border-violet-600 hover:text-white"
                    )}
                  >
                    {isInCart(product.id) ? <CheckCircle2 className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
        <div className="flex-shrink-0 w-1" />
      </div>
    </section>
  );
}

// ─── Promo Banner ─────────────────────────────────────────────────────────────
function PromoBanner() {
  return (
    <section className="pb-10">
      <div className="relative rounded-2xl overflow-hidden border border-indigo-500/10 bg-gradient-to-br from-indigo-600/10 via-violet-600/5 to-transparent p-7 md:p-10">
        <div className="absolute right-0 top-0 w-72 h-72 bg-indigo-600/12 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest text-indigo-400">
              <Zap className="w-2.5 h-2.5" /> Curated Picks
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Explore the Full{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Digital Marketplace.</span>
            </h2>
            <p className="text-gray-500 text-xs max-w-sm">Hundreds of premium assets — UI kits, courses, templates and more.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 flex-shrink-0">
            <Link href="/shop" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl uppercase tracking-widest transition-all hover:scale-[1.02] whitespace-nowrap">
              Browse All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/library" className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.04] border border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.08] text-xs font-black rounded-xl uppercase tracking-widest transition-all whitespace-nowrap">
              <Library className="w-3.5 h-3.5" /> My Library
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Main LoggedIn Page ────────────────────────────────────────────────────────
function LoggedInHome({ email }: { email: string }) {
  const { items } = useCart();

  const { data: library } = useQuery<LibraryItem[]>({
    queryKey: ["library-home"],
    queryFn: async () => (await api.get("/library")).data.data ?? [],
  });
  const { data: products } = useQuery<Product[]>({
    queryKey: ["featured-products"],
    queryFn: async () => (await api.get("/products")).data,
  });

  const ownedIds = new Set((library ?? []).map(l => l.productId));
  const firstName = email.split("@")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-black">
      {/* Fullscreen Hero Carousel */}
      <HeroCarousel products={products ?? []} />

      {/* Main content — tighter horizontal padding */}
      <div className="px-4 md:px-8 lg:px-10 max-w-7xl mx-auto">

        {/* Greeting + stats */}
        <section className="pt-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"
          >
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-indigo-400 mb-1">{greeting}</p>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">{firstName}.</span>
              </h2>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link href="/shop" className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl uppercase tracking-widest transition-all hover:scale-[1.02]">
                Browse <ArrowRight className="w-3 h-3" />
              </Link>
              <Link href="/library" className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.04] border border-white/[0.06] text-gray-300 hover:text-white text-[10px] font-black rounded-xl uppercase tracking-widest transition-all hover:bg-white/[0.08]">
                <Library className="w-3 h-3" /> Library
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <StatCard label="Library Items"  value={library?.length ?? "—"}  icon={<Library    className="w-4 h-4 text-indigo-400" />} href="/library"  accent="indigo" />
            <StatCard label="Items in Cart"  value={items.length}            icon={<ShoppingBag className="w-4 h-4 text-violet-400" />} href="/checkout" accent="violet" />
            <StatCard label="Total Catalog"  value={products?.length ?? "—"} icon={<Package    className="w-4 h-4 text-emerald-400" />} href="/shop"    accent="emerald" />
          </motion.div>
        </section>

        {/* Recent Library */}
        {(library?.length ?? 0) > 0 && <LibraryShelf items={library!} />}

        {/* New Arrivals */}
        {(products?.length ?? 0) > 0 && <NewArrivals products={products!} ownedIds={ownedIds} />}

        {/* Promo Banner */}
        <PromoBanner />
      </div>
    </div>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────
export default function Page() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700">Loading</p>
        </div>
      </div>
    );
  }

  if (user) return <LoggedInHome email={user.email} />;

  // Guest landing
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Hero />
      <CategoryBento />
      <FeaturesSection />
      <WhyUs />
      <CTASection />
    </div>
  );
}
