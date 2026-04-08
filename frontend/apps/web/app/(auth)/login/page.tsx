"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import BorderGlow from "@/components/BorderGlow";
import GlassInput from "@/components/GlassInput";
import StarBorder from "@/components/StarBorder";
import Grainient from "@/components/Grainient";
import SplitText from "@/components/SplitText";
import { ArrowRight, Sparkles, Mail, Lock } from "lucide-react";
import Logo from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setIsRegistered(searchParams.get("registered") === "true");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid credentials. Please try again.");
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
          <div className="mt-8 space-y-2 relative">
             <h2 className="text-4xl font-black text-white/40 tracking-tighter">Secure Access Portal.</h2>
             <p className="text-gray-600 font-bold uppercase tracking-[0.4em] text-xs">Enter the .prodigi network node.</p>
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
                
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={isRegistered ? "reg" : "welcome"}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-center lg:justify-start mb-2"
                  >
                    <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${isRegistered ? 'bg-green-500/10 border-green-500/20' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
                      <Sparkles className={`w-3 h-3 ${isRegistered ? 'text-green-400' : 'text-indigo-400'}`} />
                      <span className={`text-[9px] font-black tracking-[0.2em] uppercase ${isRegistered ? 'text-green-400' : 'text-indigo-400'}`}>
                        {isRegistered ? 'Account Ready' : 'Authentication Needed'}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <h1 className="text-4xl font-black text-white tracking-tighter text-center lg:text-left">
                  <SplitText
                    text={isRegistered ? "Success." : "Sign In."}
                    delay={50}
                    from={{ opacity: 0, y: 10 }}
                    to={{ opacity: 1, y: 0 }}
                    threshold={0.1}
                    textAlign="left"
                  />
                </h1>
                <p className="text-sm text-gray-400 font-medium text-center lg:text-left">
                  {isRegistered ? 'Your account was created. Welcome to the elite.' : 'Enter your credentials to access the hub.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
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
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                      {loading ? "Accessing..." : "Initialize Session"}
                      {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </div>
                  </StarBorder>
                </div>

                <div className="flex items-center gap-4 py-2 pt-4">
                  <div className="h-[1px] flex-grow bg-white/5" />
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Access Point</span>
                  <div className="h-[1px] flex-grow bg-white/5" />
                </div>

                <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-8">
                  New across the net?{" "}
                  <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4 decoration-indigo-500/30">
                    Register Node
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
