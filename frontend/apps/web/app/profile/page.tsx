"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatIDR } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/image";
import { useRouter } from "next/navigation";
import {
  User, Mail, Shield, LogOut, Library, ShoppingBag,
  Wallet, Calendar, ChevronRight, Loader2, Package, Clock, CheckCircle2, XCircle, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface OrderItem {
  quantity: number;
  price: number;
  product: { name: string; imageUrl: string | null };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface ProfileData {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  orderCount: number;
  libraryCount: number;
  totalSpent: number;
  recentOrders: Order[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:   { label: "Pending",   color: "text-amber-400 bg-amber-500/10 border-amber-500/20",   icon: <Clock className="w-3 h-3" /> },
  PAID:      { label: "Paid",      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: <CheckCircle2 className="w-3 h-3" /> },
  PROCESSED: { label: "Processed", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", icon: <CheckCircle2 className="w-3 h-3" /> },
  COMPLETED: { label: "Completed", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: <CheckCircle2 className="w-3 h-3" /> },
  CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-500/10 border-red-500/20",         icon: <XCircle className="w-3 h-3" /> },
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ["profile"],
    queryFn: async () => (await api.get("/auth/profile")).data,
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <User className="w-10 h-10 text-gray-600 mx-auto" />
          <p className="text-gray-500 font-bold">Please sign in to view your profile</p>
          <Link href="/login" className="inline-block px-6 py-3 bg-indigo-600 text-white text-sm font-black rounded-xl uppercase tracking-widest">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const initials = user.email.split("@")[0].slice(0, 2).toUpperCase();
  const memberSince = profile ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "—";

  return (
    <div className="min-h-screen bg-black pt-28 pb-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[200px] -z-10" />
      <div className="container mx-auto px-6 max-w-5xl">

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/5 mb-8 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-600/30">
              <span className="text-2xl font-black text-white">{initials}</span>
            </div>
            {/* Info */}
            <div className="flex-grow space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-white tracking-tight">{user.email.split("@")[0]}</h1>
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                  user.role === "ADMIN"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                }`}>
                  {user.role === "ADMIN" ? <Shield className="w-3 h-3 inline mr-1" /> : <User className="w-3 h-3 inline mr-1" />}
                  {user.role}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Mail className="w-3.5 h-3.5" />
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">Member since {memberSince}</span>
              </div>
            </div>
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/10 hover:border-red-500/20 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8"
        >
          {[
            { icon: <ShoppingBag className="w-5 h-5 text-indigo-400" />, label: "Total Orders", value: isLoading ? "—" : String(profile?.orderCount ?? 0), bg: "indigo" },
            { icon: <Library className="w-5 h-5 text-violet-400" />, label: "Library Items", value: isLoading ? "—" : String(profile?.libraryCount ?? 0), bg: "violet" },
            { icon: <Wallet className="w-5 h-5 text-emerald-400" />, label: "Total Spent", value: isLoading ? "—" : formatIDR(profile?.totalSpent ?? 0), bg: "emerald" },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className={`w-10 h-10 rounded-2xl bg-${stat.bg}-500/10 flex items-center justify-center`}>
                {stat.icon}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">{stat.label}</p>
              {isLoading
                ? <div className="h-7 bg-white/[0.05] rounded-lg w-20 animate-pulse" />
                : <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
              }
            </div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          <Link href="/library" className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all group">
            <div className="flex items-center gap-3">
              <Library className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-sm font-bold text-white">My Library</p>
                <p className="text-[10px] text-gray-600">Access your purchased assets</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
          </Link>
          <Link href="/shop" className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all group">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-violet-400" />
              <div>
                <p className="text-sm font-bold text-white">Browse Marketplace</p>
                <p className="text-[10px] text-gray-600">Discover new digital assets</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
          </Link>
        </motion.div>

        {/* Order History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Order History</h2>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Recent 10</span>
          </div>

          {isLoading ? (
            <div className="divide-y divide-white/[0.03]">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-8 py-5 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05]" />
                  <div className="flex-grow space-y-2">
                    <div className="h-3 bg-white/[0.05] rounded w-1/3" />
                    <div className="h-2.5 bg-white/[0.03] rounded w-1/4" />
                  </div>
                  <div className="h-4 bg-white/[0.05] rounded w-16" />
                </div>
              ))}
            </div>
          ) : !profile?.recentOrders?.length ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-10 h-10 text-gray-700 mx-auto" />
              <p className="text-gray-600 text-sm font-bold">No orders yet</p>
              <Link href="/shop" className="text-indigo-400 hover:text-indigo-300 text-xs font-bold transition-colors">
                Start shopping →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {profile.recentOrders.map((order) => {
                const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                const firstItem = order.items[0];
                return (
                  <div key={order.id} className="flex items-center gap-4 px-8 py-5 hover:bg-white/[0.02] transition-colors">
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] overflow-hidden flex-shrink-0 border border-white/5">
                      {firstItem?.product?.imageUrl ? (
                        <img src={resolveImageUrl(firstItem.product.imageUrl)!} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-700" /></div>
                      )}
                    </div>
                    {/* Details */}
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {order.items.length === 1 ? firstItem?.product?.name : `${order.items.length} items`}
                      </p>
                      <p className="text-[10px] text-gray-600 font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    {/* Status */}
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${st.color}`}>
                      {st.icon} {st.label}
                    </span>
                    {/* Amount */}
                    <span className="text-sm font-black text-white ml-2 flex-shrink-0">{formatIDR(order.totalAmount)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
