'use client';

import Link from 'next/link';
import { Product } from '@/types/product';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShoppingCart, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <GlassCard className="flex flex-col h-full group">
      {/* Product Image Placeholder / Actual */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/5 border-b border-white/5">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center">
            <span className="text-white/20 font-bold uppercase tracking-widest text-xs">No Preview</span>
          </div>
        )}
        
        {/* Category Badge overlay */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Badge variant="glass">{product.category.name}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="flex flex-col gap-1">
          <Link href={`/products/${product.id}`} className="hover:text-accent transition-colors">
            <h3 className="font-bold text-lg text-white truncate px-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-white/40 text-xs line-clamp-2 px-1 min-h-[32px]">
            {product.description || 'No description available for this digital asset.'}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Price</span>
            <span className="text-xl font-bold text-white tracking-tight">{formattedPrice}</span>
          </div>
          
          <div className="flex items-center gap-2">
             <Link href={`/products/${product.id}`}>
               <Button variant="ghost" size="sm" className="p-2">
                 <ExternalLink className="w-4 h-4" />
               </Button>
             </Link>
             <Button variant="primary" size="sm" className="h-9 px-4">
               <ShoppingCart className="w-4 h-4 mr-2" />
               Add
             </Button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
