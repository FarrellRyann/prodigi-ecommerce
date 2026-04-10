"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Package, 
  Layers, 
  ArrowLeft,
  Zap,
} from "lucide-react";
import Logo from "./Logo";
import { cn } from "@workspace/ui/lib/utils";

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: "Overview", href: "/admin" },
  { icon: <ShoppingBag size={20} />, label: "Order Hub", href: "/admin/orders" },
  { icon: <Package size={20} />, label: "Product Library", href: "/admin/products" },
  { icon: <Layers size={20} />, label: "Categories", href: "/admin/categories" },
  { icon: <Users size={20} />, label: "Customer Base", href: "/admin/users" },
  { icon: <BarChart3 size={20} />, label: "Analytics", href: "/admin/analytics" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-72 h-screen fixed left-0 top-0 border-r border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col z-50">
      {/* Sidebar Header */}
      <div className="p-8 pb-10 flex flex-col items-start gap-8">
        <Link href="/" className="inline-flex items-center gap-2 group/logo flex-shrink-0">
          <Logo className="w-10 h-7 -mr-2 transition-transform group-hover/logo:scale-110" />
          <span className="text-xl font-black font-heading tracking-tight text-white mb-0.5">
            .prodigi
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-grow px-4 space-y-2 overflow-y-auto scrollbar-hide">
        <div className="px-4 mb-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Core Network</div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              )}
            >
              <span className={cn(
                "transition-transform group-hover:scale-110 duration-300",
                isActive ? "text-white" : "text-gray-600 group-hover:text-indigo-400"
              )}>
                {item.icon}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/40" />
              )}
            </Link>
          );
        })}

        <div className="pt-4" />
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/5">
         <Link 
            href="/"
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
         >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Exit Nexus</span>
         </Link>
      </div>

      <div className="p-6">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/5 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <Zap size={16} className="text-indigo-400 animate-pulse" />
            <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-400 uppercase tracking-widest">System Stable</div>
          </div>
          <div className="space-y-1">
             <p className="text-[10px] font-black text-white uppercase tracking-widest">Node v4.2</p>
             <p className="text-[9px] text-gray-500 font-medium">All systems operational.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
