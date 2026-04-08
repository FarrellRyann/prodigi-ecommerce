"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { 
  ShoppingBag, 
  Search, 
  ExternalLink,
  Loader2,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Filter
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import GlassSurface from "@/components/GlassSurface";
import GlassInput from "@/components/GlassInput";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  totalAmount: number;
  status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  user: {
    email: string;
  };
  payment?: {
    paymentMethod: string;
    invoiceId: string;
  };
}

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["admin", "transactions"],
    queryFn: async () => {
      const res = await api.get("/orders");
      return res.data;
    },
  });

  const filteredTransactions = transactions?.data?.filter((t: Transaction) => 
    t.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black pt-32 pb-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
          <div className="space-y-4">
             <button 
                onClick={() => router.push("/admin")}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-4 group"
             >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Dashboard</span>
             </button>
             <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tighter text-white">
               Trade <span className="text-white/20 italic">Ledger.</span>
             </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
             <div className="relative w-full sm:w-80">
                <GlassInput
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="Search by Order ID or Email..."
                   className="pl-12 h-14"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
             </div>
             <Button 
                variant="outline"
                className="bg-white/5 border-white/10 text-white rounded-2xl h-14 px-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10"
             >
                <Filter className="w-4 h-4" /> Filter Status
             </Button>
          </div>
        </div>

        {/* Transactions Table */}
        <GlassSurface
           width="100%"
           height="auto"
           borderRadius={40}
           blur={20}
           opacity={0.3}
           brightness={30}
           className="border border-white/5 overflow-hidden"
        >
           {isLoading ? (
             <div className="flex flex-col items-center justify-center py-40 space-y-4">
               <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
               <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Filtering Global Ledger...</p>
             </div>
           ) : filteredTransactions?.length > 0 ? (
             <div className="overflow-x-auto">
                <table className="w-full">
                   <thead>
                      <tr className="border-b border-white/5 text-left bg-white/[0.02]">
                         <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Order Details</th>
                         <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Customer</th>
                         <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount</th>
                         <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                         <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Reference</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {filteredTransactions.map((tx: Transaction) => (
                        <tr key={tx.id} className="group hover:bg-white/[0.03] transition-all">
                           <td className="px-8 py-6">
                              <div className="space-y-1">
                                 <div className="text-xs font-black text-white font-mono">{tx.id.slice(0, 12)}...</div>
                                 <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                    <Clock className="w-3 h-3" />
                                    {new Date(tx.createdAt).toLocaleString()}
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="text-sm font-bold text-white">{tx.user?.email}</div>
                           </td>
                           <td className="px-8 py-6 text-sm font-black text-white">
                              ${tx.totalAmount.toLocaleString()}
                           </td>
                           <td className="px-8 py-6">
                              <StatusBadge status={tx.status} />
                           </td>
                           <td className="px-8 py-6 text-right">
                              <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-500 hover:text-white hover:border-white/20 transition-all text-[10px] font-black uppercase tracking-widest">
                                 View Logs <ArrowUpRight className="w-3 h-3" />
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           ) : (
             <div className="text-center py-40">
                <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">No transactions found</p>
             </div>
           )}
        </GlassSurface>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Transaction["status"] }) {
  const styles = {
    PAID: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    COMPLETED: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    PENDING: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    EXPIRED: "bg-gray-500/10 border-gray-500/20 text-gray-400",
    CANCELLED: "bg-red-500/10 border-red-500/20 text-red-400",
  };

  const icons = {
    PAID: <CheckCircle2 className="w-3 h-3" />,
    COMPLETED: <CheckCircle2 className="w-3 h-3" />,
    PENDING: <Clock className="w-3 h-3" />,
    EXPIRED: <XCircle className="w-3 h-3" />,
    CANCELLED: <XCircle className="w-3 h-3" />,
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${styles[status]}`}>
       {icons[status]}
       {status}
    </div>
  );
}
