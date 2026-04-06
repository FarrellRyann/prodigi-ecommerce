'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { OrderService, Order } from '@/services/order.service';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Download, 
  ExternalLink,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function OrderStatusPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pollCount, setPollCount] = useState(0);

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => OrderService.getById(id as string),
    refetchInterval: (query) => {
      const order = query.state.data as Order | undefined;
      // Stop polling if PAID, FAILED, or after 2 minutes (24 polls at 5s)
      if (order?.status === 'PAID' || order?.status === 'CANCELLED' || pollCount > 24) return false;
      return 5000;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (order?.status === 'PENDING') {
      setPollCount(prev => prev + 1);
    }
  }, [order?.status]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-6 py-24 flex flex-col items-center gap-8">
           <Skeleton className="w-20 h-20 rounded-full" />
           <Skeleton className="h-10 w-64 rounded-lg" />
           <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !order) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-6 py-32 flex flex-col items-center justify-center text-center gap-6">
           <XCircle className="w-16 h-16 text-red-500/50" />
           <h1 className="text-3xl font-bold text-white">Order not found.</h1>
           <Link href="/products">
             <Button variant="primary">Return to Marketplace</Button>
           </Link>
        </div>
      </PublicLayout>
    );
  }

  const isPaid = order.status === 'PAID';
  const isPending = order.status === 'PENDING';
  const isFailed = order.status === 'CANCELLED' || order.status === 'EXPIRED';

  const formattedTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.totalPrice);

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">
        
        {/* Status Hero */}
        <div className="flex flex-col items-center text-center gap-6">
          <AnimatePresence mode="wait">
            {isPending && (
              <motion.div 
                key="pending"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center relative"
              >
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-[spin_3s_linear_infinite]" />
              </motion.div>
            )}
            {isPaid && (
              <motion.div 
                key="paid"
                initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </motion.div>
            )}
            {isFailed && (
              <motion.div 
                key="failed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center"
              >
                <XCircle className="w-10 h-10 text-red-500" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              {isPending && 'Awaiting Confirmation...'}
              {isPaid && 'Payment Successful!'}
              {isFailed && 'Payment Unsuccessful'}
            </h1>
            <p className="text-white/40 max-w-md mx-auto">
              {isPending && 'We are currently verifying your transaction with Xendit. This usually takes under 60 seconds.'}
              {isPaid && 'Your digital files are now unlocked and ready for secure download. A receipt has been sent to your email.'}
              {isFailed && 'There was an issue processing your transaction. Please check your payment method or contact support.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Order Details Column */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <GlassCard intensity="medium" className="p-8 border border-white/5 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                   <ShoppingBag className="w-4 h-4 text-primary" />
                   Order #{order.id.slice(0, 8).toUpperCase()}
                </h3>
                <Badge variant={isPaid ? 'success' : isPending ? 'warning' : 'danger'}>
                  {order.status}
                </Badge>
              </div>

              <div className="flex flex-col gap-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-col gap-4 p-4 rounded-xl bg-white/5 border border-white/5 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center overflow-hidden">
                          {item.product.imageUrl ? (
                            <img src={item.product.imageUrl} className="w-full h-full object-cover" />
                          ) : (
                            <ShieldCheck className="w-6 h-6 text-white/10" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">{item.product.name}</span>
                          <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      
                      {isPaid && item.product.downloadUrl && (
                        <a href={item.product.downloadUrl} download target="_blank" rel="noopener noreferrer">
                          <Button variant="glass" size="sm" className="h-9">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-sm font-bold text-white/40 uppercase tracking-widest">Total Investment</span>
                <span className="text-xl font-bold text-white">{formattedTotal}</span>
              </div>
            </GlassCard>
          </div>

          {/* Side Info Column */}
          <div className="flex flex-col gap-6">
             {isPending && order.paymentUrl && (
               <GlassCard intensity="high" className="p-6 border border-primary/20 bg-primary/5 flex flex-col gap-4">
                  <p className="text-xs text-white/50 leading-relaxed font-medium capitalize">
                    Payment still pending? <br /> Continue the process in the Xendit secure portal.
                  </p>
                  <a href={order.paymentUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="primary" className="w-full h-12 group">
                      Open Payment Portal
                      <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-1" />
                    </Button>
                  </a>
               </GlassCard>
             )}

             <GlassCard intensity="low" className="p-6 border border-white/5 flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                   <h4 className="text-xs font-bold text-white uppercase tracking-widest">Support</h4>
                   <p className="text-[10px] text-white/30 leading-relaxed">Having issues with your order or download? We are here to help.</p>
                </div>
                <div className="flex flex-col gap-3">
                   <Button variant="ghost" size="sm" className="justify-start px-0 hover:bg-transparent text-accent">
                      <Mail className="w-4 h-4 mr-3" />
                      Email Support
                   </Button>
                   {isPaid && (
                     <Link href="/dashboard" className="w-full">
                       <Button variant="outline" size="sm" className="w-full group">
                         Purchase History
                         <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                       </Button>
                     </Link>
                   )}
                </div>
             </GlassCard>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-[10px] text-center text-white/20 uppercase tracking-[0.3em] font-bold mt-10">
          ProDigi Digital Asset Verification Infrastructure
        </p>
      </div>
    </PublicLayout>
  );
}
