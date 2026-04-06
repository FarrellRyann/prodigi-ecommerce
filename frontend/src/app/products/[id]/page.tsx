'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/services/product.service';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  FileCode, 
  Download,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => ProductService.getById(id as string),
    enabled: !!id,
  });

  const formattedPrice = product
    ? new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(product.price)
    : '';

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-12 animate-pulse">
           <Skeleton className="h-6 w-32 rounded-full mb-8" />
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <div className="flex flex-col gap-8">
                 <Skeleton className="h-10 w-full rounded-lg" />
                 <Skeleton className="h-32 w-full rounded-lg" />
                 <Skeleton className="h-16 w-full rounded-lg" />
                 <Skeleton className="h-12 w-full rounded-lg" />
              </div>
           </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !product) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-6 py-32 flex flex-col items-center justify-center text-center gap-6">
           <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
             <ArrowLeft className="w-8 h-8 text-red-500 cursor-pointer" onClick={() => router.back()} />
           </div>
           <h1 className="text-3xl font-bold text-white">Product not found.</h1>
           <p className="text-white/40">The digital asset you're looking for doesn't exist or has been removed.</p>
           <Link href="/products">
             <Button variant="primary">Return to Marketplace</Button>
           </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-4">
           <button 
             onClick={() => router.back()}
             className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors group"
           >
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
             Back to Marketplace
           </button>
           <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
           <Badge variant="glass">{product.category.name}</Badge>
        </div>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Visual Showcase */}
          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.6 }}
             className="relative"
          >
             <GlassCard intensity="high" className="aspect-square p-4 border border-white/5 shadow-[0_0_80px_rgba(42,103,255,0.05)] overflow-hidden">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-surface/50 rounded-xl flex flex-col items-center justify-center gap-4 text-white/10">
                     <FileCode className="w-24 h-24" />
                     <span className="text-xs uppercase tracking-widest font-bold">Digital Asset Preview</span>
                  </div>
                )}
             </GlassCard>
             
             {/* Glowing Orbs */}
             <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
          </motion.div>

          {/* Asset Info Card */}
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-3">
                 <Badge variant="default">Verified Asset</Badge>
                 <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs font-bold">4.9 / 5.0</span>
                 </div>
               </div>
               <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                 {product.name}
               </h1>
               <p className="text-lg text-white/50 leading-relaxed max-w-xl">
                 {product.description || 'Elevate your creative workflow with this curated digital asset, built for maximum performance and minimalist aesthetics.'}
               </p>
            </div>

            <GlassCard intensity="low" className="p-8 border border-white/10 flex flex-col gap-8">
               <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                      Investment Price
                    </span>
                    <span className="text-4xl font-bold text-white tracking-tighter">
                      {formattedPrice}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-xs text-white/40 group cursor-default">
                    <span className="flex items-center gap-2">
                       <Zap className="w-3 h-3 text-accent" />
                       Instant Unlock
                    </span>
                    <span className="flex items-center gap-2">
                       <ShieldCheck className="w-3 h-3 text-primary" />
                       Safe Delivery
                    </span>
                  </div>
               </div>

               <div className="flex flex-col gap-4">
                  <Button variant="primary" size="lg" className="w-full h-14 text-xl group relative overflow-hidden">
                    <ShoppingCart className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                    Purchase Digital Asset
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </Button>
                  <Button variant="outline" size="lg" className="w-full h-14 border-white/5 hover:bg-white/5">
                    Add to Collection
                  </Button>
               </div>

               <p className="text-[10px] text-center text-white/30 uppercase tracking-[0.2em] leading-relaxed">
                 Encrypted & Protected Payment Processing via Xendit Infrastructure
               </p>
            </GlassCard>

            <div className="grid grid-cols-2 gap-6">
               <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/5 bg-white/2">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Extension</span>
                  <span className="text-sm font-medium text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-primary" />
                    .zip / .json / .source
                  </span>
               </div>
               <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/5 bg-white/2">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Delivery</span>
                  <span className="text-sm font-medium text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-accent" />
                    Immediate Download
                  </span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
