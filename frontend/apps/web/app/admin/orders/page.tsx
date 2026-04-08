"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import AdminSidebar from "@/components/AdminSidebar";
import { 
  ShoppingBag, 
  Search, 
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Download,
  TrendingUp,
  AlertCircle,
  RefreshCcw,
  Ban
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { motion } from "framer-motion";
import { formatIDR } from "@/lib/currency";

// ─── Types ───────────────────────────────────────────────
interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: { id: string; name: string };
}

interface Payment {
  status: string;
  paidAt: string | null;
}

interface Order {
  id: string;
  totalAmount: number;
  status: "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  user: { id: string; email: string };
  items: OrderItem[];
  payment: Payment | null;
}

// ─── Constants ───────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PAID:      { label: "Paid",       color: "text-emerald-400", bg: "bg-emerald-500/10", icon: <CheckCircle2 size={11} /> },
  COMPLETED: { label: "Completed",  color: "text-emerald-400", bg: "bg-emerald-500/10", icon: <CheckCircle2 size={11} /> },
  PENDING:   { label: "Pending",    color: "text-amber-400",   bg: "bg-amber-500/10",   icon: <Clock size={11} /> },
  CANCELLED: { label: "Cancelled",  color: "text-red-400",     bg: "bg-red-500/10",     icon: <XCircle size={11} /> },
};

function shortId(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Component ───────────────────────────────────────────
export default function OrderHubPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await api.patch(`/orders/admin/${orderId}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "all"] });
    },
  });

  const handleCancel = (orderId: string, email: string) => {
    if (!confirm(`Cancel order from ${email}?\nThis cannot be undone.`)) return;
    cancelMutation.mutate(orderId);
  };
  const { data, isLoading, isError, refetch, isFetching } = useQuery<{ data: Order[] }>({
    queryKey: ["admin", "orders", "all"],
    queryFn: async () => {
      const res = await api.get("/orders/admin/all");
      return res.data;
    },
  });

  const orders = data?.data ?? [];

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch =
      o.user.email.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.items.some(i => i.product.name.toLowerCase().includes(q));
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ─── Stats ─────────────────────────────────────────────
  const stats = {
    total:     orders.length,
    paid:      orders.filter(o => o.status === "PAID" || o.status === "COMPLETED").length,
    pending:   orders.filter(o => o.status === "PENDING").length,
    cancelled: orders.filter(o => o.status === "CANCELLED").length,
    revenue:   orders.filter(o => o.status === "PAID" || o.status === "COMPLETED")
                     .reduce((acc, o) => acc + o.totalAmount, 0),
  };

  return (
    <div className="flex min-h-screen bg-black overflow-hidden isolate">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[180px] -z-10" />
      <AdminSidebar />

      <main className="flex-grow ml-72 h-screen overflow-y-auto scrollbar-hide py-12 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-8 border-b border-white/5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400">
                <ShoppingBag size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Transaction Registry</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter">
                Order <span className="text-indigo-500 italic">Hub.</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all hover:border-white/20 disabled:opacity-50"
              >
                <RefreshCcw size={13} className={isFetching ? "animate-spin" : ""} />
                Refresh
              </button>
              <Button
                onClick={() => {
                  const csv = [
                    ["Order ID", "Customer", "Products", "Amount", "Status", "Date"],
                    ...filtered.map(o => [
                      o.id,
                      o.user.email,
                      o.items.map(i => i.product.name).join(" | "),
                      o.totalAmount,
                      o.status,
                      formatDate(o.createdAt),
                    ]),
                  ].map(r => r.join(",")).join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = "orders.csv"; a.click();
                }}
                className="flex items-center gap-2 px-4 py-2.5 h-auto rounded-xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all hover:border-white/20"
              >
                <Download size={13} /> Export CSV
              </Button>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Total Orders",  value: stats.total,     color: "text-white"      },
              { label: "Paid",          value: stats.paid,      color: "text-emerald-400" },
              { label: "Pending",       value: stats.pending,   color: "text-amber-400"  },
              { label: "Cancelled",     value: stats.cancelled, color: "text-red-400"    },
              { label: "Total Revenue", value: formatIDR(stats.revenue), color: "text-indigo-400" },
            ].map(s => (
              <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">{s.label}</p>
                <p className={`text-2xl font-black tracking-tighter ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Filters ── */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow max-w-sm">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                placeholder="Search by email, order ID, or product..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["All", "PAID", "PENDING", "CANCELLED"].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    statusFilter === s
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-white/[0.02] border-white/5 text-gray-500 hover:text-white hover:border-white/20"
                  }`}
                >
                  {s === "All" ? "All" : STATUS_CONFIG[s]?.label ?? s}
                </button>
              ))}
            </div>
          </div>

          {/* ── Table ── */}
          <div className="rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden">

            {/* Table Head */}
            <div className="grid grid-cols-12 gap-3 px-8 py-5 border-b border-white/5 bg-white/[0.01]">
              {[
                ["Order ID", "col-span-2"],
                ["Customer", "col-span-2"],
                ["Products", "col-span-3"],
                ["Amount", "col-span-1"],
                ["Status", "col-span-2"],
                ["Date", "col-span-1"],
                ["Action", "col-span-1"],
              ].map(([label, span]) => (
                <span key={label} className={`${span} text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]`}>{label}</span>
              ))}
            </div>

            {/* States */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 size={28} className="text-indigo-500 animate-spin" />
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Syncing Order Registry...</p>
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <AlertCircle size={28} className="text-red-500" />
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Failed to load orders</p>
                <button onClick={() => refetch()} className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest underline">
                  Try Again
                </button>
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <div className="text-center py-24 text-gray-600 text-[10px] font-black uppercase tracking-widest">
                {search || statusFilter !== "All" ? "No orders match your filters" : "No orders yet"}
              </div>
            )}

            {/* Rows */}
            {!isLoading && !isError && (
              <div className="divide-y divide-white/[0.03]">
                {filtered.map((order, idx) => {
                  const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["PENDING"];
                  const productNames = order.items.map(i => i.product.name).join(", ");
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.025 }}
                      className="grid grid-cols-12 gap-3 px-8 py-5 hover:bg-white/[0.02] transition-colors items-center group"
                    >
                      {/* Order ID */}
                      <span className="col-span-2 text-xs font-black text-white font-mono tracking-tight">
                        {shortId(order.id)}
                      </span>

                      {/* Customer */}
                      <div className="col-span-2 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
                          {order.user.email[0]?.toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-gray-300 truncate">{order.user.email}</span>
                      </div>

                      {/* Products */}
                      <span className="col-span-3 text-xs font-bold text-gray-500 truncate" title={productNames}>
                        {productNames || "—"}
                      </span>

                      {/* Amount */}
                      <span className="col-span-1 text-sm font-black text-white">
                        {formatIDR(order.totalAmount)}
                      </span>

                      {/* Status */}
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${sc?.bg ?? "bg-white/10"} ${sc?.color ?? "text-gray-400"}`}>
                          {sc?.icon} {sc?.label ?? order.status}
                        </span>
                      </div>

                      {/* Date */}
                      <span className="col-span-1 text-[10px] font-bold text-gray-600 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </span>

                      {/* Cancel Action */}
                      <div className="col-span-1 flex justify-end">
                        {order.status === "PENDING" && (
                          <button
                            onClick={() => handleCancel(order.id, order.user.email)}
                            disabled={cancelMutation.isPending && cancelMutation.variables === order.id}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all disabled:opacity-50"
                            title="Cancel order"
                          >
                            {cancelMutation.isPending && cancelMutation.variables === order.id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Ban className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Pagination hint ── */}
          {!isLoading && filtered.length > 0 && (
            <p className="text-center text-[10px] font-black text-gray-700 uppercase tracking-widest">
              Showing {filtered.length} of {orders.length} orders
            </p>
          )}

        </div>
      </main>
    </div>
  );
}
