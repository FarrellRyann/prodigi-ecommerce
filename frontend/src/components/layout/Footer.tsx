import Link from 'next/link';
import { Cpu, X, Star } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Marketplace',
      links: [
        { name: 'Featured Products', href: '/products?featured=true' },
        { name: 'Latest Drops', href: '/products?sort=newest' },
        { name: 'Software & Tools', href: '/categories/software' },
        { name: 'Design Assets', href: '/categories/design' },
      ],
    },
    {
      title: 'Platform',
      links: [
        { name: 'About .prodigi', href: '/about' },
        { name: 'Sell Your Products', href: '/sell' },
        { name: 'API Documentation', href: '/docs' },
        { name: 'Community', href: '/community' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Refund Policy', href: '/refund' },
      ],
    },
  ];

  return (
    <footer className="w-full bg-background border-t border-white/5 py-16 px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
        {/* Brand Section */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <Cpu className="text-primary w-5 h-5 shadow-[0_0_10px_rgba(42,103,255,0.4)]" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-white">
              .pro<span className="text-accent">digi</span>
            </span>
          </Link>
          <p className="text-white/50 text-sm max-w-sm leading-relaxed">
            The next-generation marketplace for premium digital products. 
            Engineered for creators, designed for the future. 
            Built on reliability and minimal futuristic aesthetics.
          </p>
          <div className="flex items-center gap-4">
            <Link href="https://github.com" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20">
              <Cpu className="w-5 h-5 text-white/70" />
            </Link>
            <Link href="https://twitter.com" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20">
              <X className="w-5 h-5 text-white/70" />
            </Link>
            <Link href="https://linkedin.com" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20">
              <Star className="w-5 h-5 text-white/70" />
            </Link>
          </div>
        </div>

        {/* Links Sections */}
        {footerSections.map((section) => (
          <div key={section.title} className="flex flex-col gap-6">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-accent/80">
              {section.title}
            </h4>
            <ul className="flex flex-col gap-3">
              {section.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-white/40">
          © {currentYear} .prodigi Technologies. All rights reserved. Built with Next.js & Framer Motion.
        </p>
        <div className="flex items-center gap-6">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">
            Bilingual Interface: EN • ID
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[10px] text-white/40 uppercase tracking-widest">System Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
