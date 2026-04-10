"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Package,
  Plus,
  Activity,
  Server,
  Network,
  Cpu,
  MoreHorizontal,
  ChevronRight,
  Clock,
  ArrowUpRight,
  Zap,
  Layers,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import BorderGlow from "@/components/BorderGlow";
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatIDR } from "@/lib/currency";

const CHART_DATA = [40, 70, 45, 90, 65, 80, 55, 75, 40, 60, 85, 50, 70, 95, 60, 75, 40, 80, 50, 65, 90, 45, 70, 55];

const RECENT_LOGS = [
  { id: "#OX-2840", user: "Marvin McKinney", op: "Checkout", status: "Success", time: "2m ago" },
  { id: "#OX-2839", user: "Jane Cooper",     op: "Register", status: "Success", time: "14m ago" },
  { id: "#OX-2838", user: "Cody Fisher",     op: "Product Upload", status: "Pending", time: "1h ago" },
  { id: "#OX-2837", user: "Leslie Alexander",op: "Refund",   status: "Success", time: "3h ago" },
];

const QUICKLINKS = [
  { label: "New Product", href: "/admin/products/new", icon: <Plus size={15} />, color: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20" },
  { label: "Orders", href: "/admin/orders", icon: <ShoppingBag size={15} />, color: "bg-white/[0.03] hover:bg-white/[0.06] border border-white/5" },
  { label: "Analytics", href: "/admin/analytics", icon: <TrendingUp size={15} />, color: "bg-white/[0.03] hover:bg-white/[0.06] border border-white/5" },
  { label: "Categories", href: "/admin/categories", icon: <Layers size={15} />, color: "bg-white/[0.03] hover:bg-white/[0.06] border border-white/5" },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const { data: products } = useQuery({
    queryKey: ["admin", "products", user?.id],
    queryFn: async () => { const res = await api.get("/products/admin/mine"); return res.data; },
  });

  const { data: categories } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => { const res = await api.get("/categories"); return res.data; },
  });

  const maxBar = Math.max(...CHART_DATA);

  return (
    <div className="flex min-h-screen bg-black overflow-hidden relative isolate">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[200px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[200px] -z-10" />

      <AdminSidebar />

      <main className="flex-grow ml-72 h-screen overflow-y-auto scrollbar-hide py-12 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* ── HEADER ── */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400">
                <Activity size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Operational Nexus Hub</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter">
                Command <span className="text-indigo-500 italic">Center.</span>
              </h1>
              <p className="text-xs text-gray-600 font-medium max-w-sm">
                Monitor vitals, manage assets, and orchestrate the .prodigi ecosystem from a single node.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              {QUICKLINKS.map((q) => (
                <Link
                  key={q.href}
                  href={q.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all ${q.color} shadow-lg`}
                >
                  {q.icon} {q.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── KPI STRIP ── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              { label: "Aggregate Revenue", value: formatIDR(125482000), delta: "+14.5%", up: true, icon: <TrendingUp size={18} className="text-emerald-400" />, glow: "emerald" },
              { label: "System Orders",     value: "2,840",    delta: "+8.2%",  up: true, icon: <ShoppingBag size={18} className="text-indigo-400" />, glow: "indigo" },
              { label: "Active Inventory",  value: products?.length ?? "—", delta: `${categories?.length ?? 0} categories`, up: true, icon: <Package size={18} className="text-purple-400" />, glow: "purple" },
              { label: "User Interactions", value: "45.2K",   delta: "+12%",   up: true, icon: <Users size={18} className="text-amber-400" />, glow: "amber" },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <BorderGlow borderRadius={28} glowColor={kpi.glow} className="group hover:-translate-y-1 transition-transform cursor-default">
                  <div className="p-6 bg-black/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-white/[0.06] transition-colors">
                        {kpi.icon}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${kpi.up ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
                        {kpi.delta}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-1">{kpi.label}</p>
                      <p className="text-3xl font-black text-white tracking-tighter">{kpi.value}</p>
                    </div>
                  </div>
                </BorderGlow>
              </motion.div>
            ))}
          </div>

          {/* ── MAIN GRID ── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

            {/* LEFT — Chart + Table */}
            <div className="xl:col-span-8 space-y-6">

              {/* Chart Panel */}
              <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">Latency & Node Density</h3>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">Real-time system orchestration</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live</span>
                    </div>
                    <button className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-gray-600 hover:text-white transition-colors">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </div>

                <div className="h-52 flex items-end gap-1.5">
                  {CHART_DATA.map((h, i) => {
                    const pct = (h / maxBar) * 100;
                    const isLast = i === CHART_DATA.length - 1;
                    return (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.025 }}
                        className={`flex-1 rounded-t-xl relative group transition-all ${isLast ? "bg-indigo-500" : "bg-white/[0.05] hover:bg-indigo-500/30"}`}
                      >
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-black border border-white/10 text-[9px] font-black text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                          {h}ms
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                  {[
                    { label: "Network", value: "Online", sub: "99.9% Uptime", icon: <Network size={13} />, color: "text-emerald-400" },
                    { label: "Server Load", value: "2% Avg", sub: "Stable", icon: <Server size={13} />, color: "text-indigo-400" },
                    { label: "CPU", value: "Low", sub: "Optimized", icon: <Cpu size={13} />, color: "text-amber-400" },
                    { label: "Streams", value: "1,248", sub: "Global Sync", icon: <Activity size={13} />, color: "text-purple-400" },
                  ].map((m, i) => (
                    <div key={i} className="space-y-3">
                      <div className={`flex items-center gap-2 ${m.color}`}>
                        {m.icon}
                        <span className="text-[9px] font-black uppercase tracking-widest">{m.label}</span>
                      </div>
                      <div>
                        <p className="text-base font-black text-white">{m.value}</p>
                        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{m.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Logs Table */}
              <div className="rounded-[2.5rem] bg-white/[0.02] border border-white/5 overflow-hidden">
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                  <h3 className="text-base font-black text-white tracking-tight">Recent System Logs</h3>
                  <Link href="/admin/orders" className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-1 transition-colors">
                    View All <ArrowUpRight size={12} />
                  </Link>
                </div>
                <div className="divide-y divide-white/[0.03]">
                  <div className="grid grid-cols-5 gap-4 px-8 py-4 bg-white/[0.01]">
                    {["Node ID", "Custodian", "Operation", "Condition", "Executed"].map((h, i) => (
                      <span key={i} className="text-[9px] font-black text-gray-700 uppercase tracking-[0.2em]">{h}</span>
                    ))}
                  </div>
                  {RECENT_LOGS.map((row, idx) => (
                    <motion.div
                      key={row.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="grid grid-cols-5 gap-4 px-8 py-4 hover:bg-white/[0.02] transition-colors items-center"
                    >
                      <span className="text-xs font-black text-white">{row.id}</span>
                      <span className="text-xs font-bold text-gray-400 truncate">{row.user}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{row.op}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest w-fit ${row.status === "Success" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"}`}>
                        {row.status === "Success" ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
                        {row.status}
                      </span>
                      <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{row.time}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Inventory + Updates */}
            <div className="xl:col-span-4 space-y-6">

              {/* Inventory Distribution */}
              <div className="p-7 rounded-[2.5rem] bg-indigo-600/5 border border-indigo-500/10 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white tracking-tight">Inventory</h3>
                  <Link href="/admin/categories" className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-1 transition-colors">
                    Manage <ArrowUpRight size={12} />
                  </Link>
                </div>

                <div className="space-y-3">
                  {categories?.slice(0, 6).map((cat: any, idx: number) => (
                    <div key={cat.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-xs uppercase">
                          {cat.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{cat.name}</p>
                          <p className="text-[9px] text-gray-700 font-bold uppercase tracking-widest">—  assets</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}

                  {!categories?.length && (
                    <p className="text-center text-[10px] font-black text-gray-700 uppercase tracking-widest py-8">No categories yet</p>
                  )}
                </div>

                <Link
                  href="/admin/products/new"
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <Plus size={14} /> Initialize Asset
                </Link>
              </div>

              {/* System Status */}
              <div className="p-7 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-5">
                <div className="flex items-center gap-2">
                  <Zap size={15} className="text-indigo-400 animate-pulse" />
                  <h3 className="text-base font-black text-white tracking-tight">System Status</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "API Gateway", status: "Operational", ok: true },
                    { label: "Database", status: "Operational", ok: true },
                    { label: "CDN Nodes", status: "Degraded", ok: false },
                    { label: "Auth Service", status: "Operational", ok: true },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <span className="text-xs font-bold text-gray-400">{s.label}</span>
                      <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${s.ok ? "text-emerald-400" : "text-amber-400"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${s.ok ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Changelog */}
              <div className="p-7 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-5">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-600" />
                  <h3 className="text-base font-black text-white tracking-tight">Internal Updates</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { title: "Nexus v4.2 Rollout", time: "Yesterday", tag: "System" },
                    { title: "API Security Patch", time: "2 days ago", tag: "Core" },
                    { title: "CDN Region Expansion", time: "4 days ago", tag: "Infra" },
                  ].map((u, i) => (
                    <div key={i} className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400">{u.title}</p>
                        <p className="text-[10px] text-gray-700 font-medium mt-0.5">{u.time}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-[8px] font-black text-indigo-400 uppercase tracking-widest flex-shrink-0">{u.tag}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
