"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2, ArrowRight, Library, ShoppingBag, Sparkles,
  Loader2, Package, Mail, XCircle, RefreshCw, AlertTriangle
} from "lucide-react";
import api from "@/lib/api";
import { formatIDR } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  product: { name: string; imageUrl: string | null; productType: string };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  payment: { status: string; paidAt: string | null } | null;
}

const CONFETTI_COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899"];

function ConfettiPiece({ color, style }: { color: string; style: React.CSSProperties }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-sm"
      style={{ background: color, ...style }}
      initial={{ opacity: 1, y: 0, rotate: 0 }}
      animate={{ opacity: 0, y: 300, rotate: 360 }}
      transition={{ duration: 2.5, ease: "easeOut" }}
    />
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("PENDING");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // On mount: fetch the order then immediately do one sync call.
  // Xendit only redirects here after payment, so sync almost always returns PAID.
  useEffect(() => {
    if (!orderId) { setLoading(false); return; }

    const init = async () => {
      // 1. Load order data
      try {
        const res = await api.get(`/orders/${orderId}`);
        const o = res.data?.data ?? res.data;
        setOrder(o);
        const status: string = o?.status ?? "PENDING";
        setOrderStatus(status);

        // Already final — no need to sync
        if (["PAID", "COMPLETED", "CANCELLED", "EXPIRED"].includes(status)) {
          if (status === "PAID" || status === "COMPLETED") setShowConfetti(true);
          setLoading(false);
          return;
        }
      } catch {
        setLoading(false);
        return;
      }

      // 2. Sync with Xendit once
      setSyncing(true);
      try {
        const syncRes = await api.post(`/orders/${orderId}/sync`);
        const newStatus: string = syncRes.data?.status ?? "PENDING";
        setOrderStatus(newStatus);

        if (newStatus === "PAID" || newStatus === "COMPLETED") {
          // Re-fetch to get full order with items
          const updated = await api.get(`/orders/${orderId}`);
          const o = updated.data?.data ?? updated.data;
          setOrder(o);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3500);
        }
      } catch {
        // Sync failed — show whatever we already have
      } finally {
        setSyncing(false);
        setLoading(false);
      }
    };

    init();
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Manual re-check (fallback if sync somehow missed)
  const handleManualSync = async () => {
    if (!orderId || syncing) return;
    setSyncing(true);
    try {
      const res = await api.post(`/orders/${orderId}/sync`);
      const newStatus: string = res.data?.status ?? orderStatus;
      setOrderStatus(newStatus);
      if (newStatus === "PAID" || newStatus === "COMPLETED") {
        const updated = await api.get(`/orders/${orderId}`);
        const o = updated.data?.data ?? updated.data;
        setOrder(o);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500);
      }
    } catch { /* silent */ }
    finally { setSyncing(false); }
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!orderId || cancelling) return;
    setCancelling(true);
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      setOrderStatus("CANCELLED");
      try {
        const updated = await api.get(`/orders/${orderId}`);
        setOrder(updated.data?.data ?? updated.data);
      } catch { /* use existing */ }
    } catch (err) {
      console.error("Failed to cancel order:", err);
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

  const isPaid = orderStatus === "PAID" || orderStatus === "COMPLETED";
  const isCancelled = orderStatus === "CANCELLED" || orderStatus === "EXPIRED";
  const isPending = !isPaid && !isCancelled;

  const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length] as string,
    style: {
      left: `${Math.random() * 100}%`,
      top: "-20px",
      transform: `rotate(${Math.random() * 360}deg)`,
    } as React.CSSProperties,
    key: i,
  }));

  if (!orderId) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 p-6">
        <Package className="w-12 h-12 text-gray-700" />
        <p className="text-gray-500 font-bold">No order ID found</p>
        <Link href="/shop" className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl text-sm uppercase tracking-widest">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-24 relative overflow-hidden flex flex-col items-center justify-center px-6">
      {/* Background glow */}
      <div className={`absolute inset-0 -z-10 transition-all duration-1000 ${
        isPaid ? "bg-emerald-500/5" : isCancelled ? "bg-red-500/5" : "bg-indigo-500/5"
      }`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[180px] -z-10 transition-all duration-1000 ${
        isPaid ? "bg-emerald-500/10" : isCancelled ? "bg-red-500/10" : "bg-indigo-500/10"
      }`} />

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && confettiPieces.map(p => (
          <ConfettiPiece key={p.key} color={p.color} style={p.style} />
        ))}
      </AnimatePresence>

      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-white/[0.03] border border-white/5 overflow-hidden"
        >
          {/* Status Header */}
          <div className={`p-10 text-center border-b border-white/5 space-y-6 transition-all duration-500 ${
            isPaid ? "bg-emerald-500/5" : isCancelled ? "bg-red-500/5" : "bg-indigo-500/5"
          }`}>
            <div className="flex justify-center">
              <motion.div
                key={orderStatus}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`w-20 h-20 rounded-3xl flex items-center justify-center ${
                  isPaid
                    ? "bg-emerald-500/15 border border-emerald-500/25"
                    : isCancelled
                    ? "bg-red-500/15 border border-red-500/25"
                    : "bg-indigo-500/15 border border-indigo-500/25"
                }`}
              >
                {loading || syncing ? (
                  <Loader2 className="w-9 h-9 text-indigo-400 animate-spin" />
                ) : isPaid ? (
                  <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                ) : isCancelled ? (
                  <XCircle className="w-9 h-9 text-red-400" />
                ) : (
                  <Loader2 className="w-9 h-9 text-indigo-400 animate-spin" />
                )}
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={orderStatus + String(loading)}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {loading || syncing ? (
                  <>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-indigo-500/10 border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading…
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                      Confirming <span className="text-indigo-400">Order…</span>
                    </h1>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Fetching your order details, just a moment.
                    </p>
                  </>
                ) : (
                  <>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                      isPaid
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : isCancelled
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}>
                      {isPaid ? <><Sparkles className="w-3 h-3" /> Payment Confirmed</> :
                       isCancelled ? <><XCircle className="w-3 h-3" /> Order Cancelled</> :
                       <><Loader2 className="w-3 h-3 animate-spin" /> Awaiting Confirmation</>}
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                      {isPaid ? <>Welcome to the <span className="text-emerald-400">Future.</span></> :
                       isCancelled ? <>Order <span className="text-red-400">Cancelled.</span></> :
                       <>Payment <span className="text-amber-400">Pending.</span></>}
                    </h1>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {isPaid
                        ? "Your assets have been unlocked and added to your library. Ready to download."
                        : isCancelled
                        ? "This order has been cancelled."
                        : "Your payment may still be processing. Use the button below to check."}
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Order Details */}
          {order && !loading && !syncing && (
            <div className="p-8 space-y-6">
              {/* Order Meta */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Order ID</p>
                  <p className="font-mono font-bold text-white">#{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Date</p>
                  <p className="font-bold text-gray-400">{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {order.items?.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/[0.04] flex-shrink-0">
                      {item.product?.imageUrl ? (
                        <img src={resolveImageUrl(item.product.imageUrl) || ""} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-700" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-bold text-white truncate">{item.product?.name}</p>
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mt-0.5">
                        {item.product?.productType === "FILE" ? "Digital Download" :
                         item.product?.productType === "COURSE" ? "Course Access" : "Membership"}
                      </p>
                    </div>
                    <p className="text-sm font-black text-white flex-shrink-0">{formatIDR(item.price)}</p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Paid</span>
                <span className="text-xl font-black text-white">{formatIDR(order.totalAmount)}</span>
              </div>

              {/* Fallback: still PENDING after sync — let user retry manually or cancel */}
              {isPending && (
                <div className="space-y-3">
                  <button
                    onClick={handleManualSync}
                    disabled={syncing}
                    className="w-full h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-500/15 transition-all disabled:opacity-50"
                  >
                    {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {syncing ? "Checking…" : "Check Payment Status"}
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={cancelling}
                    className="w-full h-11 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-red-500/20 hover:bg-red-500/5 text-gray-500 hover:text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Cancel Order
                  </button>
                </div>
              )}

              {/* Email note */}
              {isPaid && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <p className="text-[11px] text-gray-500">A confirmation email has been sent to your inbox.</p>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {isPaid ? (
                  <>
                    <Link
                      href="/library"
                      className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-[11px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    >
                      <Library className="w-4 h-4" /> Access Library
                    </Link>
                    <Link
                      href="/shop"
                      className="flex-1 h-12 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white font-black text-[11px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" /> Continue Shopping
                    </Link>
                  </>
                ) : isCancelled ? (
                  <Link href="/shop" className="flex-1 h-12 bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
                    Browse Again <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link href="/profile" className="flex-1 h-12 bg-white/[0.04] border border-white/10 text-gray-400 font-black text-[11px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:text-white transition-all">
                    View Order History
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {(loading || syncing) && (
            <div className="p-10 flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                {syncing ? "Confirming payment…" : "Loading order…"}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => !cancelling && setShowCancelModal(false)}
            />
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
                  <h3 className="text-xl font-black text-white">Cancel This Order?</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    This will cancel your order and expire the payment link. This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    disabled={cancelling}
                    className="flex-1 h-12 bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    Keep Order
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="flex-1 h-12 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    {cancelling ? "Cancelling…" : "Yes, Cancel"}
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

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
