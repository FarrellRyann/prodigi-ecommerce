"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Users,
  Search,
  Shield,
  User,
  Loader2,
  AlertCircle,
  RefreshCcw,
  Download,
  TrendingUp,
  ShoppingBag,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";
import { formatIDR } from "@/lib/currency";

// ─── Types ───────────────────────────────────────────────
interface UserRecord {
  id: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

// ─── Helpers ─────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-indigo-600", "bg-purple-600", "bg-emerald-600",
  "bg-amber-600",  "bg-rose-600",   "bg-cyan-600", "bg-orange-600",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function avatarColor(email: string) {
  const idx = email.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ─── Component ───────────────────────────────────────────
export default function CustomerBasePage() {
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [sortBy, setSortBy]         = useState<"joined" | "orders" | "spent">("joined");

  const { data, isLoading, isError, refetch, isFetching } = useQuery<{ data: UserRecord[] }>({
    queryKey: ["admin", "users", "all"],
    queryFn: async () => {
      const res = await api.get("/auth/admin/users");
      return res.data;
    },
  });

  const users = data?.data ?? [];

  // ── Derived ──────────────────────────────────────────
  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      const matchSearch = u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
      const matchRole   = roleFilter === "All" || u.role === roleFilter;
      return matchSearch && matchRole;
    })
    .sort((a, b) => {
      if (sortBy === "orders") return b.orderCount - a.orderCount;
      if (sortBy === "spent")  return b.totalSpent - a.totalSpent;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const stats = {
    total:     users.length,
    customers: users.filter(u => u.role === "CUSTOMER").length,
    admins:    users.filter(u => u.role === "ADMIN").length,
    revenue:   users.reduce((acc, u) => acc + u.totalSpent, 0),
  };

  const handleExport = () => {
    const csv = [
      ["ID", "Email", "Role", "Orders", "Total Spent", "Joined"],
      ...filtered.map(u => [u.id, u.email, u.role, u.orderCount, u.totalSpent, formatDate(u.createdAt)]),
    ].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "customers.csv"; a.click();
  };

  return (
    <div className="flex min-h-screen bg-black overflow-hidden isolate">
      <div className="absolute bottom-0 left-72 w-[500px] h-[400px] bg-amber-600/5 blur-[200px] -z-10" />
      <AdminSidebar />

      <main className="flex-grow ml-72 h-screen overflow-y-auto scrollbar-hide py-12 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-8 border-b border-white/5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400">
                <Users size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Identity Ledger</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter">
                Customer <span className="text-amber-500 italic">Base.</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all hover:border-white/20 disabled:opacity-50"
              >
                <RefreshCcw size={13} className={isFetching ? "animate-spin" : ""} /> Refresh
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all hover:border-white/20"
              >
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Users",    value: stats.total,     color: "text-white",      icon: <Users size={16} className="text-white/30" /> },
              { label: "Customers",      value: stats.customers, color: "text-amber-400",  icon: <User size={16} className="text-amber-500/40" /> },
              { label: "Admins",         value: stats.admins,    color: "text-indigo-400", icon: <Shield size={16} className="text-indigo-500/40" /> },
              { label: "Lifetime Rev.",  value: formatIDR(stats.revenue), color: "text-emerald-400", icon: <DollarSign size={16} className="text-emerald-500/40" /> },
            ].map(s => (
              <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  {s.icon}
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">{s.label}</p>
                </div>
                <p className={`text-2xl font-black tracking-tighter ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Filters ── */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-grow max-w-sm">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                placeholder="Search by email or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>

            {/* Role filter */}
            <div className="flex gap-2">
              {["All", "CUSTOMER", "ADMIN"].map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    roleFilter === r
                      ? "bg-amber-600 border-amber-600 text-white"
                      : "bg-white/[0.02] border-white/5 text-gray-500 hover:text-white hover:border-white/20"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex gap-2 ml-auto">
              <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest self-center">Sort:</span>
              {(["joined", "orders", "spent"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    sortBy === s
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-white/[0.02] border-white/5 text-gray-600 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* ── Table ── */}
          <div className="rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden">

            {/* Head */}
            <div className="grid grid-cols-12 gap-3 px-8 py-5 border-b border-white/5 bg-white/[0.01]">
              {[
                ["User",         "col-span-4"],
                ["Role",         "col-span-2"],
                ["Orders",       "col-span-2"],
                ["Total Spent",  "col-span-2"],
                ["Joined",       "col-span-2"],
              ].map(([label, span]) => (
                <span key={label} className={`${span} text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]`}>{label}</span>
              ))}
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 size={28} className="text-amber-500 animate-spin" />
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Loading Identity Ledger...</p>
              </div>
            )}

            {/* Error */}
            {isError && (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <AlertCircle size={28} className="text-red-500" />
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Failed to load users</p>
                <button onClick={() => refetch()} className="text-[10px] font-black text-amber-400 hover:text-amber-300 uppercase tracking-widest underline">
                  Retry
                </button>
              </div>
            )}

            {/* Empty */}
            {!isLoading && !isError && filtered.length === 0 && (
              <div className="text-center py-24 text-gray-600 text-[10px] font-black uppercase tracking-widest">
                {search || roleFilter !== "All" ? "No users match your filters" : "No users yet"}
              </div>
            )}

            {/* Rows */}
            {!isLoading && !isError && (
              <div className="divide-y divide-white/[0.03]">
                {filtered.map((user, idx) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.025 }}
                    className="grid grid-cols-12 gap-3 px-8 py-4 hover:bg-white/[0.02] transition-colors items-center group"
                  >
                    {/* User */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${avatarColor(user.email)} flex items-center justify-center text-xs font-black text-white flex-shrink-0`}>
                        {user.email[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{user.email}</p>
                        <p className="text-[10px] text-gray-600 font-mono">{user.id.slice(0, 8)}…</p>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        user.role === "ADMIN"
                          ? "bg-indigo-500/10 text-indigo-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {user.role === "ADMIN" ? <Shield size={10} /> : <User size={10} />}
                        {user.role}
                      </span>
                    </div>

                    {/* Orders */}
                    <div className="col-span-2 flex items-center gap-2">
                      <ShoppingBag size={13} className="text-gray-700 flex-shrink-0" />
                      <span className="text-sm font-black text-white">{user.orderCount}</span>
                    </div>

                    {/* Total Spent */}
                    <div className="col-span-2 flex items-center gap-1.5">
                      <span className={`text-sm font-black ${user.totalSpent > 0 ? "text-emerald-400" : "text-gray-600"}`}>
                        {formatIDR(user.totalSpent)}
                      </span>
                    </div>

                    {/* Joined */}
                    <span className="col-span-2 text-[10px] font-bold text-gray-600">
                      {formatDate(user.createdAt)}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer count */}
          {!isLoading && filtered.length > 0 && (
            <p className="text-center text-[10px] font-black text-gray-700 uppercase tracking-widest">
              Showing {filtered.length} of {users.length} users
            </p>
          )}

        </div>
      </main>
    </div>
  );
}
