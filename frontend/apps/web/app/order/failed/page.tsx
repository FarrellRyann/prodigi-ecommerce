"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  XCircle, 
  RefreshCcw, 
  HelpCircle,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import GlassSurface from "@/components/GlassSurface";

export default function OrderFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 relative overflow-hidden">
      {/* Failure Bloom */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/10 rounded-full blur-[200px] -z-10" />

      <div className="container mx-auto px-6 flex flex-col items-center text-center">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={48}
          blur={25}
          opacity={0.5}
          brightness={40}
          className="max-w-2xl p-12 md:p-16 border border-red-500/20"
        >
          <div className="flex justify-center mb-10">
             <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center animate-bounce">
                <XCircle className="w-12 h-12 text-red-500" />
             </div>
          </div>

          <div className="space-y-4 mb-10">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Payment Interrupted
             </div>
             <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tighter text-white">
               Something Went <span className="text-red-500">Wrong.</span>
             </h1>
             <p className="text-gray-400 font-medium max-w-md mx-auto">
               We couldn&apos;t process your payment. This could be due to a technical glitch, insufficient funds, or a cancelled transaction.
             </p>
          </div>

          <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6 mb-10 text-left flex items-start gap-4">
             <HelpCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
             <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">Need Help?</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                  If funds were deducted from your account, please wait up to 15 minutes for Xendit to sync. Your library will update automatically.
                </p>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
             <Button 
                onClick={() => router.push("/checkout")}
                className="flex-1 bg-white text-black hover:bg-gray-200 rounded-2xl h-16 text-sm font-black tracking-widest uppercase flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-2xl shadow-white/5"
             >
                <RefreshCcw className="w-5 h-5" />
                Try Again
             </Button>
             <Button 
                variant="outline"
                onClick={() => router.push("/shop")}
                className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl h-16 text-sm font-black tracking-widest uppercase flex items-center justify-center gap-3 transition-all"
             >
                <ArrowLeft className="w-5 h-5" />
                Browse Shop
             </Button>
          </div>
        </GlassSurface>
      </div>
    </div>
  );
}
