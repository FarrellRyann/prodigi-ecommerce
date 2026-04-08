"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { formatIDR } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard, ShieldCheck, Lock,
  Loader2, ArrowLeft, Package, Zap, ArrowRight,
  CheckCircle2, XCircle, AlertTriangle, Receipt, User, Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type CheckoutStep = "review" | "processing" | "error";

export default function CheckoutConfirmPage() {
  const { items, totalPrice, clearCart, itemCount } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>("review");
  const [error, setError] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && step === "review") {
      router.push("/checkout");
    }
  }, [items.length, step, router]);

  const handleConfirmCheckout = async () => {
    if (!user) { router.push("/login"); return; }
    setStep("processing");
    setError("");
    try {
      // Sync local cart with backend
      const productIds = items.map(item => item.id);
      await api.post("/cart/sync", { productIds });

      // Create order and get payment URL
      const response = await api.post("/orders/checkout");
      if (response.data.paymentUrl) {
        clearCart();
        window.location.href = response.data.paymentUrl;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Checkout failed. Please try again.");
      setStep("error");
    }
  };

  const handleCancelOrder = () => {
    setShowCancelConfirm(false);
    router.push("/checkout");
  };

  if (!user || (items.length === 0 && step === "review")) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Processing state
  if (step === "processing") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 gap-8">
        <div className="absolute inset-0 bg-indigo-500/5 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[200px] -z-10" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-24 h-24 rounded-3xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center"
        >
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-3"
        >
          <h1 className="text-2xl font-black text-white tracking-tight">Processing Your Order</h1>
          <p className="text-gray-400 text-sm font-medium max-w-md leading-relaxed">
            Creating your order and preparing the payment gateway. You'll be redirected to Xendit shortly.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-indigo-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-28 pb-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-600/5 rounded-full blur-[180px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[200px] -z-10" />

      <div className="container mx-auto px-6 max-w-5xl">

        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-8 text-[11px] font-bold uppercase tracking-widest"
        >
          <Link href="/checkout" className="text-gray-600 hover:text-gray-400 transition-colors">Cart</Link>
          <ArrowRight className="w-3 h-3 text-gray-700" />
          <span className="text-indigo-400">Confirm & Pay</span>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-10 space-y-1.5"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Checkout</p>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Confirm <span className="text-white/25 italic">Your Order.</span>
          </h1>
          <p className="text-gray-600 text-sm font-medium">Review your items before proceeding to payment</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* LEFT — Order Review */}
          <div className="lg:col-span-7 space-y-6">
            {/* User Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-3">Billing Account</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{user.email.split("@")[0]}</p>
                  <div className="flex items-center gap-1.5 text-gray-500 mt-0.5">
                    <Mail className="w-3 h-3" />
                    <span className="text-[11px] font-medium">{user.email}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Items */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Order Items</p>
                <span className="text-[10px] font-bold text-gray-600">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/[0.04] border border-white/5 flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={resolveImageUrl(item.imageUrl) || item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-700" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Digital License</span>
                        <span className="text-[10px] text-gray-700">•</span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-600 font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Instant delivery
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-black text-white flex-shrink-0">{formatIDR(item.price)}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Payment Method Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-3">Payment Method</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-bold text-white">Xendit Payment Gateway</p>
                  <p className="text-[10px] text-gray-600 font-medium mt-0.5">
                    QRIS • Bank Transfer • E-Wallet • Credit Card
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Secure</span>
                </div>
              </div>
            </motion.div>

            {/* Back to Cart */}
            <Link
              href="/checkout"
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-400 text-[11px] font-bold uppercase tracking-widest transition-colors mt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
            </Link>
          </div>

          {/* RIGHT — Order Total & CTA */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl bg-white/[0.03] border border-white/5 overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-white/5">
                <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-400" /> Payment Summary
                </h2>
              </div>
              <div className="p-8 space-y-6">
                {/* Line Items */}
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium truncate max-w-[60%]">{item.name}</span>
                      <span className="text-white font-bold">{formatIDR(item.price)}</span>
                    </div>
                  ))}
                </div>

                <div className="h-[1px] bg-white/5" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="text-white font-bold">{formatIDR(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Platform Fee</span>
                    <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Free</span>
                  </div>
                </div>

                <div className="h-[1px] bg-white/5" />

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Total</span>
                  <span className="text-3xl font-black text-white tracking-tight">{formatIDR(totalPrice)}</span>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-bold text-red-400">{error}</p>
                        <button
                          onClick={() => { setError(""); setStep("review"); }}
                          className="text-[10px] font-bold text-red-300 hover:text-red-200 underline mt-1"
                        >
                          Try again
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTAs */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleConfirmCheckout}
                    className="w-full h-14 bg-white text-black rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5"
                  >
                    <CreditCard className="w-5 h-5" /> Confirm & Pay
                  </button>

                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full h-11 bg-white/[0.03] border border-white/5 hover:border-red-500/20 hover:bg-red-500/5 text-gray-500 hover:text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                  >
                    <XCircle className="w-4 h-4" /> Cancel Order
                  </button>
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
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowCancelConfirm(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md rounded-3xl bg-[#0a0a0a] border border-white/10 overflow-hidden"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white">Cancel Checkout?</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Your items will remain in your cart. You can come back and checkout anytime.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 h-12 bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                  >
                    Keep Shopping
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    className="flex-1 h-12 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                  >
                    Yes, Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
