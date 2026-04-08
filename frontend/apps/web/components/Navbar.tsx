"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { 
  ShoppingCart, 
  User, 
  LogIn, 
  Library, 
  Settings, 
  LogOut,
  Menu,
  X,
  Search,
  LayoutDashboard
} from "lucide-react";
import BorderGlow from "./BorderGlow";
import { Button } from "@workspace/ui/components/button";
import Logo from "./Logo";


export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoggedIn = !!user;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
  ];

  const protectedLinks = [
    { name: "Library", href: "/library", icon: <Library className="w-4 h-4" /> },
  ];

  if (user?.role === "ADMIN") {
    protectedLinks.push({ name: "Nexus", href: "/admin", icon: <LayoutDashboard className="w-4 h-4" /> });
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full flex justify-center pt-4 pb-2 transition-all duration-300 pointer-events-none">
      <BorderGlow 
        borderRadius={999} 
        glowRadius={30}
        glowIntensity={0.8}
        glowColor="250 80 80"
        className="pointer-events-auto shadow-2xl"
      >
        <div className="flex items-center gap-6 px-6 py-2">
          {/* Logo - Always visible as the brand anchor */}
          <Link href="/" className="flex items-center group">
            <Logo className="w-12 h-9 -mr-2 transition-transform group-hover:scale-105" />
            <span className="text-[14px] font-bold font-heading tracking-tight text-white/90 hidden sm:block">
              .prodigi
            </span>
          </Link>

          {/* Conditional Navigation and Actions */}
          {isLoggedIn ? (
            <>
              {/* Vertical Divider */}
              <div className="h-5 w-[1px] bg-white/10" />

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    className={`text-[13px] font-medium transition-colors hover:text-white ${
                      isActive(link.href) ? "text-white font-semibold" : "text-gray-400"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {protectedLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    className={`text-[13px] font-medium flex items-center gap-2 transition-colors hover:text-white ${
                      isActive(link.href) ? "text-white font-semibold" : "text-gray-400"
                    }`}
                    title={link.name}
                  >
                    {link.icon}
                    <span className="hidden lg:block">{link.name}</span>
                  </Link>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Link href="/search" className="p-1.5 text-gray-400 hover:text-white transition-colors" title="Search">
                  <Search className="w-4 h-4" />
                </Link>
                <Link href="/checkout" className="p-1.5 text-gray-400 hover:text-white transition-colors relative">
                  <ShoppingCart className="w-4 h-4" />
                  {itemCount > 0 && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-indigo-600 text-[9px] flex items-center justify-center rounded-full text-white border border-black/50">
                      {itemCount}
                    </span>
                  )}
                </Link>

                <div className="h-5 w-[1px] bg-white/10 mx-1" />

                <div className="flex items-center gap-2">
                  <Link href="/profile" className="flex items-center gap-2 group">
                    <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center border border-white/10 group-hover:border-indigo-500 transition-colors">
                      <User className="w-3.5 h-3.5 text-gray-300" />
                    </div>
                  </Link>
                  <button 
                    onClick={() => logout()}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Vertical Divider */}
              <div className="h-5 w-[1px] bg-white/10" />
              
              <div className="flex items-center gap-2">
                <Button 
                  asChild
                  variant="ghost" 
                  size="sm"
                  className="text-gray-400 hover:text-white h-8 text-[12px] px-3"
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 h-8 text-[12px]">
                   <Link href="/register">Join</Link>
                </Button>
              </div>
            </>
          )}

          {/* Mobile Menu Toggle (Nested in Actions for compactness) */}
          {isLoggedIn && (
            <button 
              className="md:hidden p-1.5 text-gray-400 ml-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          )}

        </div>
      </BorderGlow>

      {/* Mobile Menu (Optional expansion) */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-1.5 px-1">
          <BorderGlow borderRadius={20} className="p-4 border border-white/10">
             {/* Links simplified for mobile */}
             <div className="flex flex-col gap-3">
                {navLinks.map(l => <Link key={l.name} href={l.href} className="text-[15px] font-medium text-gray-300 px-2 py-1 hover:bg-white/5 rounded-lg">{l.name}</Link>)}
                {isLoggedIn && protectedLinks.map(l => <Link key={l.name} href={l.href} className="text-[15px] font-medium text-gray-300 flex items-center gap-2 px-2 py-1 hover:bg-white/5 rounded-lg">{l.icon}{l.name}</Link>)}
             </div>
             <hr className="border-white/5" />
             {!isLoggedIn ? (
               <div className="flex flex-col gap-2">
                  <Button asChild variant="ghost" size="sm" className="h-9 text-[14px]">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-indigo-600 h-9 text-[14px]">
                    <Link href="/register">Join Free</Link>
                  </Button>
               </div>
             ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/profile" className="text-[14px] text-gray-300 px-2 py-1">My Profile</Link>
                  <button onClick={() => logout()} className="text-left text-[14px] text-red-400 px-2 py-1">Logout</button>
                </div>
             )}

          </BorderGlow>
        </div>
      )}
    </nav>
  );
}
