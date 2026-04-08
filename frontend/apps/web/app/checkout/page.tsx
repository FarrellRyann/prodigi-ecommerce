"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatIDR } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trash2, ShieldCheck, Lock,
  ShoppingBag, ArrowLeft, Package, Zap, ArrowRight, CheckCircle2, Minus, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const { items, removeItem, totalPrice, itemCount } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleProceedToCheckout = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push("/checkout/confirm");
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 gap-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-28 h-28 rounded-[2rem] bg-white/[0.03] border border-white/5 flex items-center justify-center"
        >
          <ShoppingBag className="w-12 h-12 text-gray-700" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center space-y-3"
        >
          <h1 className="text-3xl font-black text-white tracking-tight">Your Cart is Empty</h1>
          <p className="text-gray-500 font-medium text-sm max-w-sm mx-auto leading-relaxed">
            Discover premium digital assets and build your collection. Your next masterpiece awaits.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-4"
        >
          <Link
            href="/shop"
            className="flex items-center gap-2 px-7 py-3.5 bg-white text-black text-sm font-black rounded-2xl uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5"
          >
            <Package className="w-4 h-4" /> Browse Marketplace
          </Link>
          <Link href="/" className="flex items-center gap-2 px-6 py-3.5 bg-white/[0.04] border border-white/5 text-gray-400 hover:text-white text-sm font-black rounded-2xl uppercase tracking-widest transition-all">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-28 pb-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/5 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[200px] -z-10" />

      <div className="container mx-auto px-6 max-w-5xl">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 space-y-1.5"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Shopping Cart</p>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Your <span className="text-white/25 italic">Collection.</span>
          </h1>
          <p className="text-gray-600 text-sm font-medium">{itemCount} {itemCount === 1 ? "item" : "items"} in your cart</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* LEFT — Cart Items */}
          <div className="lg:col-span-7 space-y-4">
            <AnimatePresence>
              {items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group flex items-center gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/[0.04] border border-white/5 flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={resolveImageUrl(item.imageUrl) || item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-700" />
                      </div>
                    )}
                  </div>
                  {/* Details */}
                  <div className="flex-grow min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{item.name}</h3>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Digital License</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-600 font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      Instant delivery after payment
                    </div>
                  </div>
                  {/* Price + Remove */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span className="text-sm font-black text-white">{formatIDR(item.price)}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue Shopping */}
            <Link
              href="/shop"
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-400 text-[11px] font-bold uppercase tracking-widest transition-colors mt-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
            </Link>
          </div>

          {/* RIGHT — Order Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-3xl bg-white/[0.03] border border-white/5 overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-white/5">
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Order Summary</h2>
              </div>
              <div className="p-8 space-y-6">
                {/* Line Items */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Subtotal ({items.length} {items.length === 1 ? "item" : "items"})</span>
                    <span className="text-white font-bold">{formatIDR(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Platform Fee</span>
                    <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Tax</span>
                    <span className="text-gray-500 font-medium">Included</span>
                  </div>
                </div>

                <div className="h-[1px] bg-white/5" />

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Total</span>
                  <span className="text-3xl font-black text-white tracking-tight">{formatIDR(totalPrice)}</span>
                </div>

                {/* CTA */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full h-14 bg-white text-black rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5"
                  >
                    Proceed to Checkout <ArrowRight className="w-5 h-5" />
                  </button>

                  {!user && (
                    <Link
                      href="/login"
                      className="w-full h-12 bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600/20 transition-all"
                    >
                      Sign in to checkout <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-5 pt-2">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Lock className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">SSL Encrypted</span>
                  </div>
                  <div className="w-[1px] h-3 bg-white/10" />
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                  </div>
                  <div className="w-[1px] h-3 bg-white/10" />
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Zap className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Instant Access</span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-600 text-center leading-relaxed">
                  By completing purchase, you agree to our Terms of Service.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
