"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import AdminSidebar from "@/components/AdminSidebar";
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit,
  Search,
  Loader2,
  Package,
  Check,
  X,
  Tag
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [search, setSearch] = useState("");

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      await api.post("/categories", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      setNewName("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      await api.put(`/categories/${id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      setEditId(null);
      setEditName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });

  const filtered = categories?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const PALETTE = ["bg-indigo-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-orange-500", "bg-teal-500"];

  return (
    <div className="flex min-h-screen bg-black overflow-hidden isolate">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 blur-[180px] -z-10" />
      <AdminSidebar />
      <main className="flex-grow ml-72 h-screen overflow-y-auto scrollbar-hide py-12 px-8 lg:px-16">
        <div className="max-w-5xl mx-auto space-y-10">

          {/* Header */}
          <div className="flex items-center justify-between pb-8 border-b border-white/5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400">
                <Layers size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Taxonomy Control</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter">
                Category <span className="text-indigo-500 italic">Fleet.</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                {categories?.length ?? 0} Nodes Active
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* Left: Create Form */}
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-indigo-600/5 border border-indigo-500/10 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-base font-black text-white uppercase tracking-widest">Initialize Node</h3>
                  <p className="text-[11px] text-gray-600 font-medium">Create a new category to organize your digital assets.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Motion Graphics"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && newName.trim() && createMutation.mutate(newName.trim())}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 px-4 text-sm font-bold text-white placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                  />
                </div>

                <Button
                  onClick={() => newName.trim() && createMutation.mutate(newName.trim())}
                  disabled={!newName.trim() || createMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {createMutation.isPending ? "Creating..." : "Add Category"}
                </Button>
              </div>

              {/* Stats */}
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Quick Stats</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">Total Categories</span>
                    <span className="text-sm font-black text-white">{categories?.length ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">Total Assets</span>
                    <span className="text-sm font-black text-indigo-400">—</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Category List */}
            <div className="lg:col-span-2 space-y-5">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>

              {/* List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 size={32} className="text-indigo-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filtered?.map((cat, idx) => (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: idx * 0.04 }}
                        className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all group"
                      >
                        {editId === cat.id ? (
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && updateMutation.mutate({ id: cat.id, name: editName })}
                              autoFocus
                              className="flex-grow bg-white/[0.05] border border-indigo-500/30 rounded-xl py-2 px-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              onClick={() => updateMutation.mutate({ id: cat.id, name: editName })}
                              disabled={updateMutation.isPending}
                              className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="p-2 rounded-xl bg-white/5 text-gray-500 hover:text-white transition-all"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl ${PALETTE[idx % PALETTE.length]} flex items-center justify-center text-white font-black text-xs uppercase`}>
                                {cat.name.charAt(0)}
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{cat.name}</p>
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                                  <Package size={10} />
                                  {cat._count?.products ?? "—"} assets
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                                className="p-2 rounded-xl bg-white/5 border border-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteMutation.mutate(cat.id); }}
                                className="p-2 rounded-xl bg-red-500/5 border border-red-500/5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {filtered?.length === 0 && (
                    <div className="text-center py-16 text-gray-600 text-[10px] font-black uppercase tracking-widest">
                      No categories found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
