'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/services/product.service';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ProductCard } from '@/components/ui/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/Input';
import { Search, Filter, Grid3X3, List as ListIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: ProductService.getCategories,
  });

  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', selectedCategory, search],
    queryFn: () => ProductService.getAll({ categoryId: selectedCategory || undefined, search }),
  });

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white px-2">
            Market<span className="text-accent italic">place.</span>
          </h1>
          <p className="text-white/40 text-lg max-w-2xl px-2">
            Explore our curated catalog of elite digital assets, tools, and creative properties.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/5 border border-white/5 p-4 rounded-2xl backdrop-blur-xl">
          <div className="w-full md:max-w-md">
            <Input
              placeholder="Search digital products..."
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <div className="flex items-center gap-2 border-r border-white/10 pr-4">
              <Button variant="ghost" size="sm" className="bg-white/5 border border-white/10">
                <Filter className="w-4 h-4 mr-2" />
                All Filters
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={!selectedCategory ? 'primary' : 'ghost'} 
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {isCategoriesLoading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-20 rounded-lg" />)
              ) : (
                categories?.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className="whitespace-nowrap"
                  >
                    {cat.name}
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategory || search) && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
            <span className="text-xs text-white/40 font-bold uppercase tracking-widest mr-2">Filters:</span>
            {selectedCategory && (
              <Badge variant="glass" className="flex items-center gap-1 py-1 pl-3 pr-1">
                {categories?.find(c => c.id === selectedCategory)?.name}
                <button onClick={() => setSelectedCategory(null)} className="p-0.5 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {search && (
              <Badge variant="glass" className="flex items-center gap-1 py-1 pl-3 pr-1">
                "{search}"
                <button onClick={() => setSearch('')} className="p-0.5 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20">
          <AnimatePresence mode="popLayout">
            {isProductsLoading ? (
              Array(8).fill(0).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
              ))
            ) : products && products.length > 0 ? (
              products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  layout
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-center gap-4">
                 <div className="w-20 h-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mb-4">
                   <Search className="w-10 h-10 text-white/20" />
                 </div>
                 <h3 className="text-2xl font-bold text-white">No digital assets found.</h3>
                 <p className="text-white/40 max-w-sm">
                   We couldn't find matching products. Try adjusting your search or category filters.
                 </p>
                 <Button variant="outline" onClick={() => { setSearch(''); setSelectedCategory(null); }}>
                   Clear all filters
                 </Button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PublicLayout>
  );
}
