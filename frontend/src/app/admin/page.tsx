'use client';

import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/services/order.service';
import { ProductService } from '@/services/product.service';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  ArrowUpRight, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: OrderService.getHistory,
  });

  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => ProductService.getAll(),
  });

  const totalRevenue = orders?.filter(o => o.status === 'PAID').reduce((t, o) => t + o.totalPrice, 0) || 0;
  const activeOrders = orders?.filter(o => o.status === 'PENDING').length || 0;
  const totalProducts = products?.length || 0;

  const stats = [
    { name: 'Total Revenue', value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalRevenue), icon: <DollarSign className="w-5 h-5" />, trend: '+12.5%', color: 'text-green-500' },
    { name: 'Total Orders', value: orders?.length || 0, icon: <ShoppingBag className="w-5 h-5" />, trend: '+8.2%', color: 'text-primary' },
    { name: 'Active Catalog', value: totalProducts, icon: <Package className="w-5 h-5" />, trend: '+2.4%', color: 'text-accent' },
    { name: 'Pending Payments', value: activeOrders, icon: <Clock className="w-5 h-5" />, trend: '-5.1%', color: 'text-yellow-500' },
  ];

  // Dummy data for chart since we don't have historical aggregation yet
  const chartData = [
    { name: 'Mon', revenue: 4000000 },
    { name: 'Tue', revenue: 3000000 },
    { name: 'Wed', revenue: 5000000 },
    { name: 'Thu', revenue: 4500000 },
    { name: 'Fri', revenue: 6000000 },
    { name: 'Sat', revenue: 8000000 },
    { name: 'Sun', revenue: 7000000 },
  ];

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
         <h1 className="text-3xl font-bold text-white tracking-tight">Financial <span className="text-primary italic">Overview.</span></h1>
         <p className="text-white/40 text-sm">Real-time performance metrics for the .prodigi network.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <GlassCard priority="low" className="p-6 border border-white/5 flex flex-col gap-4 group">
               <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                  </div>
                  <Badge variant="glass" className="text-[10px] py-0.5">{stat.trend}</Badge>
               </div>
               <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/30 truncate">{stat.name}</span>
                  <span className="text-2xl font-bold text-white tracking-tighter mt-1">{isOrdersLoading ? <Skeleton className="h-8 w-24" /> : stat.value}</span>
               </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
         {/* Revenue Chart */}
         <GlassCard intensity="medium" className="lg:col-span-2 p-8 border border-white/5 flex flex-col gap-8 h-[450px]">
            <div className="flex items-center justify-between">
               <h3 className="font-bold text-lg text-white flex items-center gap-3">
                 <TrendingUp className="w-5 h-5 text-primary" />
                 Revenue Trajectory
               </h3>
               <div className="flex items-center gap-2">
                 <Badge variant="glass" className="cursor-pointer hover:bg-white/10">7D</Badge>
                 <Badge variant="outline" className="cursor-pointer hover:bg-white/10 opacity-40">30D</Badge>
               </div>
            </div>
            
            <div className="flex-1 w-full h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#2A67FF" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#2A67FF" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                     <XAxis dataKey="name" stroke="#ffffff20" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis hide />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '12px' }}
                        itemStyle={{ color: '#2A67FF', fontWeight: 'bold' }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#2A67FF" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorRev)" 
                        animationDuration={1500}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </GlassCard>

         {/* Recent Orders List */}
         <GlassCard priority="low" className="p-8 border border-white/5 flex flex-col gap-8 h-[450px]">
            <h3 className="font-bold text-lg text-white flex items-center gap-3">
              <Clock className="w-5 h-5 text-accent" />
              Latest Signal
            </h3>
            
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide">
               {isOrdersLoading ? (
                 Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
               ) : orders?.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-white/20 text-xs italic uppercase tracking-widest">No activity</div>
               ) : (
                 orders?.slice(0, 8).map((order) => (
                   <div key={order.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg bg-surface ${order.status === 'PAID' ? 'text-green-500' : 'text-yellow-500'}`}>
                           {order.status === 'PAID' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                         </div>
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-white truncate max-w-[100px]">{order.userId.slice(0,8)}</span>
                            <span className="text-[10px] text-white/30 uppercase tracking-widest font-black leading-none">{order.status}</span>
                         </div>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-sm font-bold text-white tracking-tighter">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.totalPrice)}
                         </span>
                         <ArrowUpRight className="w-3 h-3 text-white/20 group-hover:text-primary transition-colors" />
                      </div>
                   </div>
                 ))
               )}
            </div>
         </GlassCard>
      </div>
    </div>
  );
}
