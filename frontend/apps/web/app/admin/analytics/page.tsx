"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  DollarSign,
  Activity,
  Globe,
  ArrowUpRight,
  Zap,
  Eye,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatIDR, formatIDRCompact } from "@/lib/currency";

const REVENUE_BARS = [42000000, 61000000, 55000000, 78000000, 52000000, 89000000, 75000000, 95000000, 68000000, 112000000, 89000000, 125000000];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TOP_PRODUCTS = [
  { name: "Premium UI Kit", revenue: 14800000, sales: 99 },
  { name: "Motion Pack Pro", revenue: 11200000, sales: 126 },
  { name: "3D Asset Bundle", revenue: 9950000, sales: 40 },
  { name: "Icon Library Pro", revenue: 7080000, sales: 120 },
  { name: "Dashboard Suite", revenue: 5980000, sales: 30 },
];

const TRAFFIC = [
  { source: "Organic Search", percent: 42, color: "bg-indigo-500" },
  { source: "Direct", percent: 28, color: "bg-purple-500" },
  { source: "Referral", percent: 18, color: "bg-emerald-500" },
  { source: "Social", percent: 12, color: "bg-amber-500" },
];

export default function AnalyticsPage() {
  const maxRevenue = Math.max(...REVENUE_BARS);
  const currentMonth = REVENUE_BARS[REVENUE_BARS.length - 1] ?? 0;
  const prevMonth = REVENUE_BARS[REVENUE_BARS.length - 2] ?? 1;
  const growthPct = (((currentMonth - prevMonth) / prevMonth) * 100).toFixed(1);

  return (
    <div className="flex min-h-screen bg-black overflow-hidden isolate">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[200px] -z-10" />
      <div className="absolute bottom-0 left-72 w-[400px] h-[400px] bg-indigo-600/5 blur-[200px] -z-10" />
      <AdminSidebar />
      <main className="flex-grow ml-72 h-screen overflow-y-auto scrollbar-hide py-12 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Header */}
          <div className="flex items-center justify-between pb-8 border-b border-white/5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-purple-400">
                <BarChart3 size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Intelligence Hub</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter">
                Analytics <span className="text-purple-500 italic">Engine.</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Real-time Data</span>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "Monthly Revenue", value: formatIDRCompact(currentMonth), change: `+${growthPct}%`, up: true, icon: <DollarSign size={18} className="text-emerald-400" />, color: "text-emerald-400" },
              { label: "Active Users", value: "45,200", change: "+12.4%", up: true, icon: <Users size={18} className="text-indigo-400" />, color: "text-indigo-400" },
              { label: "Transactions", value: "2,840", change: "+8.2%", up: true, icon: <ShoppingBag size={18} className="text-purple-400" />, color: "text-purple-400" },
              { label: "Conversion Rate", value: "3.8%", change: "-0.4%", up: false, icon: <Target size={18} className="text-amber-400" />, color: "text-amber-400" },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4 hover:border-white/10 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-white/[0.06] transition-colors">
                    {kpi.icon}
                  </div>
                  <span className={`text-[10px] font-black flex items-center gap-1 ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>
                    {kpi.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {kpi.change}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">{kpi.label}</p>
                  <p className={`text-3xl font-black tracking-tighter ${kpi.color}`}>{kpi.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

            {/* Revenue Chart */}
            <div className="xl:col-span-8">
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white tracking-tight">Revenue Trajectory</h3>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">12-month performance</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white tracking-tighter">{formatIDRCompact(currentMonth)}</p>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">+{growthPct}% vs last month</p>
                  </div>
                </div>

                <div className="h-48 flex items-end gap-2">
                  {REVENUE_BARS.map((val, i) => {
                    const pct = (val / maxRevenue) * 100;
                    const isLast = i === REVENUE_BARS.length - 1;
                    return (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ duration: 0.9, delay: i * 0.05 }}
                        className={`flex-1 rounded-t-xl relative group transition-all ${isLast ? "bg-indigo-500" : "bg-white/[0.05] hover:bg-indigo-500/30"}`}
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-black border border-white/10 text-[9px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {formatIDRCompact(val)}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-12 gap-2">
                  {MONTHS.map((m, i) => (
                    <span key={i} className={`text-center text-[9px] font-black uppercase tracking-widest ${i === 11 ? "text-indigo-400" : "text-gray-700"}`}>{m}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="xl:col-span-4 space-y-6">
              {/* Traffic Sources */}
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white tracking-tight">Traffic Sources</h3>
                  <Globe size={16} className="text-gray-600" />
                </div>
                <div className="space-y-4">
                  {TRAFFIC.map((t, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400">{t.source}</span>
                        <span className="text-xs font-black text-white">{t.percent}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${t.percent}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className={`h-full rounded-full ${t.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="p-6 rounded-3xl bg-indigo-600/5 border border-indigo-500/10 space-y-5">
                <h3 className="text-base font-black text-white tracking-tight">Live Metrics</h3>
                <div className="space-y-4">
                  {[
                    { label: "Page Views", value: "128K", icon: <Eye size={13} /> },
                    { label: "Avg. Session", value: "4m 32s", icon: <Activity size={13} /> },
                    { label: "Bounce Rate", value: "32%", icon: <Zap size={13} /> },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-gray-500">
                        {m.icon}
                        <span className="text-[11px] font-bold uppercase tracking-wider">{m.label}</span>
                      </div>
                      <span className="text-sm font-black text-white">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white tracking-tight">Top Performing Assets</h3>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">By Revenue</span>
            </div>
            <div className="space-y-4">
              {TOP_PRODUCTS.map((p, i) => {
                const pct = (p.revenue / (TOP_PRODUCTS[0]?.revenue ?? 1)) * 100;
                return (
                  <div key={i} className="space-y-2 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-gray-600 w-4">{i + 1}</span>
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-gray-600">{p.sales} sold</span>
                        <span className="text-sm font-black text-white w-24 text-right">{formatIDR(p.revenue)}</span>
                      </div>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
