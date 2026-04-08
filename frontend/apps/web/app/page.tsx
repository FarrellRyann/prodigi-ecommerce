"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { resolveImageUrl } from "@/lib/image";
import { formatIDR } from "@/lib/currency";
import { useCart } from "@/context/CartContext";
import Hero from "@/components/Hero";
import CategoryBento from "@/components/CategoryBento";
import FeaturedProducts from "@/components/FeaturedProducts";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import {
  Loader2, Library, ShoppingBag, Package,
  ArrowRight, Sparkles, ChevronRight, Zap, Download,
  Monitor, FileBadge, CheckCircle2, ShoppingCart, TrendingUp,
  Star, Clock
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
  imageUrl: string | null; category: { name: string }; productType: string;
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, href, accent }: {
  label: string; value: string | number; icon: React.ReactNode;
  href: string; accent: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-${accent}-500/30 hover:bg-white/[0.04] transition-all`}
    >
      <div className={`w-10 h-10 rounded-2xl bg-${accent}-500/10 flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-grow min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">{label}</p>
        <p className="text-xl font-black text-white tracking-tight">{value}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors flex-shrink-0" />
    </Link>
  );
}

// ─── Quick Access Shelf ───────────────────────────────────────────────────────
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
    <section className="px-6 pb-14">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Recent Purchases</h2>
          </div>
          <Link href="/library" className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:text-indigo-400 transition-colors">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {items.slice(0, 4).map((item, i) => (
            <motion.div
              key={item.productId}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.075 }}
            >
              <Link
                href={`/library`}
                className="group block rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] hover:border-indigo-500/20 transition-all"
              >
                <div className="aspect-video bg-white/[0.03] overflow-hidden relative">
                  <img
                    src={resolveImageUrl(item.product.imageUrl) || "https://images.unsplash.com/photo-1614850523296-d8c1af03d400?auto=format&fit=crop&q=80&w=400"}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2">
                    <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border", typeColor(item.product.productType))}>
                      {typeIcon(item.product.productType)}
                      {item.product.productType === "FILE" ? "DL" : item.product.productType === "COURSE" ? "Course" : "Sub"}
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
      </div>
    </section>
  );
}

// ─── New Arrivals Carousel ─────────────────────────────────────────────────────
function NewArrivals({ products }: { products: Product[] }) {
  const { addItem, items } = useCart();
  const isInCart = (id: string) => items.some(i => i.id === id);

  if (!products.length) return null;

  return (
    <section className="px-6 pb-14">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">New Arrivals</h2>
          </div>
          <Link href="/shop" className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:text-violet-400 transition-colors">
            All assets <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.slice(0, 3).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="group rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] hover:border-violet-500/20 hover:-translate-y-1 transition-all duration-300"
            >
              <Link href={`/shop/${product.id}`}>
                <div className="aspect-[16/9] overflow-hidden bg-white/[0.03] relative">
                  <img
                    src={resolveImageUrl(product.imageUrl) || "https://images.unsplash.com/photo-1614850523296-d8c1af03d400?auto=format&fit=crop&q=80&w=600"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-md bg-violet-500/20 border border-violet-500/30 text-[8px] font-black uppercase tracking-widest text-violet-300">
                      New
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{product.category?.name}</p>
                  <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors truncate">{product.name}</h3>
                  <p className="text-[11px] text-gray-600 line-clamp-1">{product.description}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-sm font-black text-white">{formatIDR(product.price)}</span>
                    <button
                      onClick={e => {
                        e.preventDefault();
                        if (!isInCart(product.id)) addItem({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl ?? "" });
                      }}
                      className={cn(
                        "p-1.5 rounded-lg border transition-all",
                        isInCart(product.id)
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-white/[0.04] border-white/10 text-gray-600 hover:bg-violet-600 hover:border-violet-600 hover:text-white"
                      )}
                    >
                      {isInCart(product.id) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Promo Banner ─────────────────────────────────────────────────────────────
function PromoBanner() {
  return (
    <section className="px-6 pb-14">
      <div className="container mx-auto max-w-6xl">
        <div className="relative rounded-3xl overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-indigo-600/15 via-violet-600/10 to-transparent p-8 md:p-12">
          {/* Decorative orb */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] -z-0" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                <Zap className="w-3 h-3" /> Limited Time
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Explore the Full<br />
                <span className="text-indigo-400">Digital Marketplace.</span>
              </h2>
              <p className="text-gray-400 text-sm max-w-sm">
                Discover hundreds of premium assets — UI kits, courses, templates and more. All in one place.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                href="/shop"
                className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-2xl uppercase tracking-widest transition-all hover:scale-[1.02] whitespace-nowrap"
              >
                Browse All <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/search"
                className="flex items-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-sm font-black rounded-2xl uppercase tracking-widest transition-all whitespace-nowrap"
              >
                Search Assets
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Why ProDigi (Mini features) ──────────────────────────────────────────────
function WhyUs() {
  const features = [
    { icon: <Zap className="w-5 h-5 text-amber-400" />, title: "Instant Access", desc: "Get immediate access to all purchased assets right after payment." },
    { icon: <Star className="w-5 h-5 text-indigo-400" />, title: "Premium Quality", desc: "Every asset is curated and verified by our editorial team." },
    { icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, title: "Lifetime License", desc: "One purchase, unlimited use. No recurring fees on digital files." },
    { icon: <Package className="w-5 h-5 text-violet-400" />, title: "Growing Library", desc: "New products added weekly, keeping your toolkit fresh." },
  ];

  return (
    <section className="px-6 pb-20">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                {f.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">{f.title}</h3>
                <p className="text-[11px] text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Hero Banner for logged-in user ───────────────────────────────────────────
function UserHero({ name, greeting }: { name: string; greeting: string }) {
  return (
    <div className="relative pt-32 pb-14 px-6 overflow-hidden">
      {/* Gradient mesh */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-950/30 to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[130px] -z-10" />
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="space-y-4 mb-10"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-indigo-400">{greeting}</p>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
            Welcome back, <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              {name}.
            </span>
          </h1>
          <p className="text-gray-500 font-medium text-sm max-w-md">
            Your digital library and marketplace dashboard. Ready to discover something new?
          </p>
          <div className="flex items-center gap-4 pt-2">
            <Link
              href="/shop"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl uppercase tracking-widest transition-all hover:scale-[1.02]"
            >
              Browse Assets <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/library"
              className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.05] border border-white/10 text-gray-300 hover:text-white text-xs font-black rounded-xl uppercase tracking-widest transition-all hover:bg-white/10"
            >
              <Library className="w-3.5 h-3.5" /> My Library
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
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

  const firstName = email.split("@")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-black">
      {/* Big hero greeting */}
      <UserHero name={firstName} greeting={greeting} />

      {/* Stats row */}
      <section className="px-6 pb-12">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <StatCard label="Library Items" value={library?.length ?? "—"} icon={<Library className="w-5 h-5 text-indigo-400" />} href="/library" accent="indigo" />
            <StatCard label="Items in Cart" value={items.length} icon={<ShoppingBag className="w-5 h-5 text-violet-400" />} href="/checkout" accent="violet" />
            <StatCard label="Total Catalog" value={products?.length ?? "—"} icon={<Package className="w-5 h-5 text-emerald-400" />} href="/shop" accent="emerald" />
          </motion.div>
        </div>
      </section>

      {/* Recent Library shelf */}
      {(library?.length ?? 0) > 0 && <LibraryShelf items={library!} />}

      {/* New Arrivals */}
      {(products?.length ?? 0) > 0 && <NewArrivals products={products!} />}

      {/* Promo Banner */}
      <PromoBanner />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Why ProDigi */}
      <WhyUs />
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
      <FeaturedProducts />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}
