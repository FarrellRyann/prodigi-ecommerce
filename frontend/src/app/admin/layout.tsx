'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  ShoppingCart, 
  Users, 
  Settings, 
  ArrowLeft,
  LogOut,
  Cpu,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, href: '/admin' },
  { name: 'Products', icon: <Package className="w-5 h-5" />, href: '/admin/products' },
  { name: 'Categories', icon: <Tag className="w-5 h-5" />, href: '/admin/categories' },
  { name: 'Orders', icon: <ShoppingCart className="w-5 h-5" />, href: '/admin/orders' },
  { name: 'Users', icon: <Users className="w-5 h-5" />, href: '/admin/users' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex text-white font-sans selection:bg-primary/30">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-white/5 bg-surface/30 backdrop-blur-3xl sticky top-0 h-screen">
        <div className="p-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
              <Cpu className="text-primary w-5 h-5 shadow-[0_0_10px_rgba(42,103,255,0.4)]" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-white">
              .pro<span className="text-accent">digi</span> <span className="text-[10px] text-accent/50 uppercase ml-1 font-black">Admin</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-2 mt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ x: 5 }}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(42,103,255,0.05)]' 
                      : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className={`${isActive ? 'text-primary' : 'group-hover:text-white'} transition-colors`}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-bold tracking-tight">{item.name}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(42,103,255,0.8)]"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2 py-1">
             <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5" />
             <div className="flex flex-col">
                <span className="text-sm font-bold text-white truncate max-w-[140px]">{user?.email.split('@')[0]}</span>
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-black">Administrator</span>
             </div>
          </div>
          <button 
            onClick={() => logout()}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold tracking-tight">Logout System</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen flex flex-col relative overflow-hidden">
        {/* Glow Effects */}
        <div className="fixed top-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-[-1]" />
        
        {/* Mobile Header */}
        <header className="lg:hidden p-6 border-b border-white/5 bg-surface/30 backdrop-blur-xl flex items-center justify-between sticky top-0 z-50">
          <Link href="/" className="flex items-center gap-2">
            <Cpu className="text-primary w-6 h-6" />
            <span className="font-bold tracking-tighter">.prodigi Admin</span>
          </Link>
          <button onClick={() => setIsMobileOpen(true)} className="p-2 hover:bg-white/5 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Dynamic Page Content */}
        <div className="p-6 md:p-12 max-w-7xl">
           {children}
        </div>
      </main>

      {/* Mobile Drawer (Simplest solution) */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] lg:hidden"
          >
             <motion.div
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               className="absolute top-0 right-0 bottom-0 w-80 bg-background border-l border-white/10 p-8 flex flex-col gap-10"
             >
                <div className="flex items-center justify-between">
                   <span className="font-bold uppercase tracking-widest text-xs">Navigation</span>
                   <button onClick={() => setIsMobileOpen(false)}><X className="w-6 h-6" /></button>
                </div>
                {/* Simplified mobile links */}
                <div className="flex flex-col gap-4">
                   {menuItems.map(item => (
                     <Link key={item.name} href={item.href} onClick={() => setIsMobileOpen(false)} className="text-2xl font-bold hover:text-primary transition-colors">
                        {item.name}
                     </Link>
                   ))}
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
