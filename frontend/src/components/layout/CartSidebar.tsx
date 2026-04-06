'use client';

import { useCartStore } from '@/hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GlassCard } from '@/components/ui/GlassCard';
import Link from 'next/link';

export function CartSidebar() {
  const { items, isOpen, setOpen, removeItem, updateQuantity } = useCartStore();

  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const formattedSubtotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(subtotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background border-l border-white/10 z-[70] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Your Cart</h2>
                <Badge variant="glass">{items.length} Assets</Badge>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-6 opacity-40">
                  <ShoppingBag className="w-16 h-16" />
                  <div className="flex flex-col gap-1">
                    <p className="text-lg font-bold">Your cart is empty.</p>
                    <p className="text-sm">Start exploring the marketplace.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <GlassCard intensity="low" className="p-3 border border-white/5 flex gap-4 pr-1 relative">
                        <div className="w-20 h-20 rounded-lg bg-surface/50 border border-white/5 overflow-hidden flex-shrink-0">
                          {item.product.imageUrl && (
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div className="flex flex-col">
                            <h4 className="text-sm font-bold text-white leading-tight truncate max-w-[120px]">
                              {item.product.name}
                            </h4>
                            <span className="text-[10px] text-white/30 truncate">{item.product.category.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 hover:bg-white/5 rounded-md text-white/30 hover:text-white transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 hover:bg-white/5 rounded-md text-white/30 hover:text-white transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between py-1 pr-2">
                           <button 
                             onClick={() => removeItem(item.product.id)}
                             className="text-white/20 hover:text-red-500 transition-colors"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                           <span className="text-sm font-bold text-white">
                             {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.product.price * item.quantity)}
                           </span>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-8 pb-10 bg-surface/50 border-t border-white/5 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm text-white/40">
                    <span>Subtotal</span>
                    <span>{formattedSubtotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/40">
                    <span>Processing Fee</span>
                    <span className="text-accent underline cursor-help decoration-accent/30 underline-offset-4 font-medium italic">FREE</span>
                  </div>
                  <div className="h-px bg-white/5 w-full my-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white tracking-tight">Total</span>
                    <span className="text-2xl font-bold text-white tracking-tighter shadow-primary/20 drop-shadow-sm">
                      {formattedSubtotal}
                    </span>
                  </div>
                </div>

                <Link href="/checkout" onClick={() => setOpen(false)}>
                  <Button variant="primary" size="lg" className="w-full h-14 text-lg font-bold group">
                    Checkout Now
                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <p className="text-[10px] text-center text-white/20 uppercase tracking-[0.2em]">
                  Secure Digital Fulfillment Guaranteed
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
