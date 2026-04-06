'use client';

import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';
import { Download, Shield, Zap, ArrowRight, Star } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-accent" />,
      title: 'Instant Delivery',
      description: 'Get your digital assets seconds after payment is confirmed. No waiting, no friction.',
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: 'Secure Licensing',
      description: 'Built-in secure license keys and download links that expire to protect creators.',
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-400" />,
      title: 'Premium Quality',
      description: 'Every product is hand-vetted by our curators to ensure industry-leading standards.',
    },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative pt-10 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-8"
          >
            <Badge variant="default" className="w-fit animate-pulse-cyan">
              New: ProDigi v2.0 is Live
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] text-white">
              The Digital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Marketplace
              </span> <br />
              of the Future.
            </h1>
            
            <p className="text-lg text-white/60 max-w-lg leading-relaxed">
              Discover, license, and download premium software, design assets, and digital intellectual 
              properties in a minimalist futuristic environment.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary" size="lg" className="group">
                Start Browsing
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg">
                Sell Your Product
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">12.5k+</span>
                <span className="text-xs text-white/40 uppercase tracking-widest">Active Users</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">500+</span>
                <span className="text-xs text-white/40 uppercase tracking-widest">Creators</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <GlassCard 
              intensity="medium" 
              className="p-8 aspect-video flex flex-col justify-between border-primary/20 shadow-[0_0_50px_rgba(42,103,255,0.1)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
                    <div className="w-full h-full rounded-full bg-surface" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Futurist UI Kit</h4>
                    <span className="text-xs text-white/40">v1.4.2 • Design Asset</span>
                  </div>
                </div>
                <Badge variant="success">$49.00</Badge>
              </div>

              <div className="h-px bg-white/5 w-full my-6" />
              
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-xl bg-white/5 border border-white/5 overflow-hidden group">
                    <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent group-hover:scale-110 transition-transform duration-500" />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-white/10" />
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                    +12
                  </div>
                </div>
                <Button variant="glass" size="sm">
                  View Demo
                </Button>
              </div>
            </GlassCard>

            {/* Decorative background circles */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-pulse" />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.5 }}
            >
              <GlassCard className="p-8 h-full flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
