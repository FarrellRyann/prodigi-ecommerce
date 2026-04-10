"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import BorderGlow from "@/components/BorderGlow";
import GlassInput from "@/components/GlassInput";
import StarBorder from "@/components/StarBorder";
import Grainient from "@/components/Grainient";
import SplitText from "@/components/SplitText";
import { UserPlus, Sparkles, ArrowRight, Shield, User } from "lucide-react";
import Logo from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "ADMIN">("CUSTOMER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register({ email, password, role, username: username || undefined });
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black isolate pt-20">
      {/* Immersive Background */}
      <div className="absolute inset-0 -z-10">
        <Grainient 
          color1="#000000"
          color2="#050505"
          color3="#1e1b4b"
        />
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-80px)] container mx-auto px-6 lg:px-12 items-center gap-12">
        {/* Left Side: Massive Logo Visual */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="hidden lg:flex flex-col items-start justify-center relative select-none pointer-events-none"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] -z-10" />
          <Logo className="w-[40rem] h-auto opacity-50 -ml-24 scale-110 drop-shadow-[0_0_80px_rgba(99,102,241,0.2)]" />
          <div className="mt-8 space-y-2 relative text-left">
             <h2 className="text-4xl font-black text-white/40 tracking-tighter">Forge Your Identity.</h2>
             <p className="text-gray-600 font-bold uppercase tracking-[0.4em] text-xs">Register new node in the .prodigi network.</p>
          </div>
        </motion.div>

        {/* Right Side: Form Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex items-center justify-center lg:justify-end py-12"
        >
          <BorderGlow
            borderRadius={48}
            glowColor="indigo"
            className="w-full max-w-md shadow-2xl relative overflow-hidden"
          >
            <div className="p-8 md:p-12 relative z-10 bg-black/40 backdrop-blur-xl">
              {/* Header */}
              <div className="text-center mb-10 space-y-4">
                {/* No redundant mobile logo here as Navbar is present */}
                
                <div className="flex justify-center lg:justify-start mb-2">
                  <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span className="text-[9px] font-black tracking-[0.2em] uppercase text-indigo-400">Initialize Identity</span>
                  </div>
                </div>

                <h1 className="text-4xl font-black text-white tracking-tighter text-center lg:text-left">
                  <SplitText
                    text="Create Node."
                    delay={50}
                    from={{ opacity: 0, y: 10 }}
                    to={{ opacity: 1, y: 0 }}
                    threshold={0.1}
                  />
                </h1>
                <p className="text-sm text-gray-400 font-medium text-center lg:text-left">Start collecting world-class digital assets.</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Picker */}
                <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-white/5 border border-white/5 relative">
                  <button
                    type="button"
                    onClick={() => setRole("CUSTOMER")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 relative z-10 ${
                      role === "CUSTOMER" ? "text-white" : "text-gray-500 hover:text-white"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">User</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("ADMIN")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 relative z-10 ${
                      role === "ADMIN" ? "text-white" : "text-gray-500 hover:text-white"
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Admin</span>
                  </button>
                  {/* Visual indicator for role */}
                  <motion.div
                    className="absolute inset-1 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30"
                    animate={{ x: role === "CUSTOMER" ? "0%" : "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{ width: "calc(50% - 4px)" }}
                  />
                </div>

                <div className="space-y-4">
                  <GlassInput
                    label="Email"
                    type="email"
                    placeholder="alex@prodigi.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-2xl border-white/5 bg-white/[0.03] focus:bg-white/[0.06]"
                  />
                  <GlassInput
                    label="Username (optional)"
                    type="text"
                    placeholder={email ? (email.split('@')[0] ?? '').toLowerCase() : "e.g. alex_prodigi"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
                    className="rounded-2xl border-white/5 bg-white/[0.03] focus:bg-white/[0.06]"
                  />
                  <GlassInput
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-2xl border-white/5 bg-white/[0.03] focus:bg-white/[0.06]"
                  />
                  <GlassInput
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="rounded-2xl border-white/5 bg-white/[0.03] focus:bg-white/[0.06]"
                  />
                </div>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] font-bold text-red-400 text-center tracking-widest uppercase"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="pt-2">
                  <StarBorder
                    as="button"
                    type="submit"
                    disabled={loading}
                    color="#6366f1"
                    speed="3s"
                    className="w-full group transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    <div className="flex items-center justify-center gap-3 h-14 font-black tracking-[0.15em] uppercase text-xs">
                      {loading ? "Registering..." : "Provision Account"}
                      {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </div>
                  </StarBorder>
                </div>

                <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-8">
                  Already part of the net?{" "}
                  <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4 decoration-indigo-500/30">
                    Sign In
                  </Link>
                </p>
              </form>
            </div>
          </BorderGlow>
        </motion.div>
      </div>
    </div>
  );
}
