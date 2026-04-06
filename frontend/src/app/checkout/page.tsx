'use client';

import { useCartStore } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';
import { ShoppingBag, ShieldCheck, Zap, Mail, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/axios';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const subtotal = items.reduce((t, i) => t + i.product.price * i.quantity, 0);
  const formattedSubtotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(subtotal);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push('/login?from=/checkout');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // 1. Create order and get payment URL from backend
      const { data } = await api.post('/orders');
      
      // 2. Clear local cart
      clearCart();

      // 3. Redirect to Xendit Invoice
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        router.push(`/orders/${data.order.id}/status`);
      }
    } catch (err: any) {
      setError(err.message || 'Checkout failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-6 py-32 flex flex-col items-center justify-center text-center gap-6">
           <ShoppingBag className="w-16 h-16 text-white/20" />
           <h1 className="text-3xl font-bold text-white">Your cart is empty.</h1>
           <p className="text-white/40">You don't have any items in your cart to checkout.</p>
           <Link href="/products">
             <Button variant="primary">Browse Marketplace</Button>
           </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10">
        <header className="flex flex-col gap-3">
          <Link href="/products" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors w-fit group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Continue Shopping
          </Link>
          <h1 className="text-4xl font-bold text-white tracking-tight">Finalize <span className="text-primary italic">Purchase.</span></h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Order Summary */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <GlassCard intensity="medium" className="p-8 border border-white/5 flex flex-col gap-8">
               <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary"><ShoppingBag className="w-5 h-5" /></div>
                  Order Summary
               </h3>
               
               <div className="flex flex-col gap-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                       <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-surface/50 border border-white/5 overflow-hidden">
                             {item.product.imageUrl && <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex flex-col gap-1">
                             <h4 className="font-bold text-white">{item.product.name}</h4>
                             <span className="text-xs text-white/40">{item.product.category.name}</span>
                             <Badge variant="glass" className="w-fit scale-75 origin-left">Qty: {item.quantity}</Badge>
                          </div>
                       </div>
                       <span className="font-bold text-white">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.product.price * item.quantity)}
                       </span>
                    </div>
                  ))}
               </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <GlassCard intensity="low" className="p-6 border border-white/5 flex flex-col gap-3">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    Instant Unlock
                  </h4>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Digital products are unlocked immediately after payment confirmation. Links are sent to your verified email.
                  </p>
               </GlassCard>
               <GlassCard intensity="low" className="p-6 border border-white/5 flex flex-col gap-3">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Encrypted Transaction
                  </h4>
                  <p className="text-xs text-white/40 leading-relaxed">
                    All payments are processed securely via Xendit. Your financial data is nunca stored on our servers.
                  </p>
               </GlassCard>
            </div>
          </div>

          {/* Payment & Action */}
          <div className="flex flex-col gap-6 sticky top-28">
            {!isAuthenticated ? (
              <GlassCard intensity="medium" className="p-8 border border-accent/20 bg-accent/5 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                   <h3 className="font-bold text-white text-lg">Identity Required</h3>
                   <p className="text-xs text-white/50 leading-relaxed">Please sign in to your account to complete the purchase and link the digital assets to your profile.</p>
                </div>
                <Link href="/login?from=/checkout">
                  <Button variant="primary" size="lg" className="w-full h-14 group font-bold">
                    Sign In to Checkout
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </GlassCard>
            ) : (
              <GlassCard intensity="high" className="p-8 border border-white/10 flex flex-col gap-8 shadow-[0_0_80px_rgba(42,103,255,0.05)]">
                 <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between text-sm text-white/40">
                      <span>Recipient Email</span>
                      <span className="text-white font-medium flex items-center gap-2"><Mail className="w-3 h-3 text-primary" /> {user.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/40">
                      <span>Asset Count</span>
                      <span className="text-white font-medium">{items.length} items</span>
                    </div>
                    <div className="h-px bg-white/5 w-full my-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white/60 uppercase tracking-widest">Total Investment</span>
                      <span className="text-2xl font-bold text-white tracking-tighter">
                        {formattedSubtotal}
                      </span>
                    </div>
                 </div>

                 {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold text-center">
                       {error}
                    </div>
                 )}

                 <Button 
                   variant="primary" 
                   size="lg" 
                   className="w-full h-16 text-lg font-bold group shadow-[0_0_30px_rgba(42,103,255,0.2)]"
                   onClick={handleCheckout}
                   isLoading={isProcessing}
                 >
                   <CreditCard className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                   Secure Checkout
                 </Button>

                 <p className="text-[10px] text-center text-white/30 uppercase tracking-[0.2em] leading-relaxed">
                   By Clicking Checkout, You Accept Our Digital Licensing Agreement.
                 </p>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
