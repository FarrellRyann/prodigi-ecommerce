"use client";

import React from "react";
import Link from "next/link";
import { 
  Mail, 
  Send,
  Globe,
  Lock,
  ShieldCheck,
} from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "Twitter", href: "#", icon: <Send className="w-4 h-4" /> },
    { name: "Email", href: "mailto:contact@prodigi.com", icon: <Mail className="w-4 h-4" /> },
    { name: "Web", href: "#", icon: <Globe className="w-4 h-4" /> },
  ];

  return (
    <footer className="relative mt-8 pb-40 overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-10">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center group">
              <Logo className="w-12 h-9 -mr-2 transition-transform group-hover:scale-105" />
              <span className="text-xl font-bold font-heading tracking-tight text-white mb-0.5">
                .prodigi
              </span>
            </Link>
            <p className="text-[12px] text-gray-500 font-medium tracking-wide">
              The next-generation digital marketplace.
            </p>
          </div>

          {/* Social Icons & Integrity Marks */}
          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a 
                  key={social.name} 
                  href={social.href} 
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all group"
                  aria-label={social.name}
                >
                  <span className="group-hover:scale-110 transition-transform">{social.icon}</span>
                </a>
              ))}
            </div>
            
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold tracking-tighter uppercase">Verified Assets</span>
              </div>
              <div className="flex items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold tracking-tighter uppercase">Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Ultra Minimal */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-gray-600 font-medium uppercase tracking-[0.2em]">
            &copy; {currentYear} ProDigi • All Rights Reserved
          </p>
          <div className="flex items-center gap-6 text-[11px] font-bold text-gray-600 uppercase tracking-widest">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </div>

      {/* Subtle Background Glow */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/5 blur-[120px] -z-10" />
    </footer>
  );
}
