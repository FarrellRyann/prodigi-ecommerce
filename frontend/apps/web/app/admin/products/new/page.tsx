"use client";

import React, { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import AdminSidebar from "@/components/AdminSidebar";
import { 
  Plus, 
  ChevronLeft,
  Loader2,
  Image as ImageIcon,
  Save,
  Sparkles,
  DollarSign,
  Upload,
  FileText,
  Tag,
  Package,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const PRODUCT_TYPES = [
  { value: "FILE", label: "Digital Download", desc: "Downloadable file (ZIP, PDF, etc.)" },
  { value: "COURSE", label: "Live Course", desc: "Access to video or live content" },
  { value: "SUBSCRIPTION", label: "Membership", desc: "Recurring subscription access" },
];

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
        {label}
        {required && <span className="text-indigo-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function InputBase({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-3.5 text-sm font-medium text-white placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all ${className}`}
    />
  );
}

function SelectBase({ className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-3.5 text-sm font-medium text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all ${className}`}
    />
  );
}

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    productType: "FILE",
    accessUrl: "",
    downloadUrl: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => { const res = await api.get("/categories"); return res.data; },
  });

  const handleImageChange = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleImageChange(file);
  };

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      if (imageFile) data.append("image", imageFile);

      await api.post("/products", data, { headers: { "Content-Type": "multipart/form-data" } });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      setSuccess(true);
      setTimeout(() => router.push("/admin/products"), 1200);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create product.");
      setLoading(false);
    }
  };

  const selectedType = PRODUCT_TYPES.find(t => t.value === formData.productType);

  return (
    <div className="flex min-h-screen bg-black overflow-hidden isolate">
      <div className="absolute top-0 left-72 w-[500px] h-[500px] bg-indigo-600/5 blur-[200px] -z-10" />
      <AdminSidebar />

      <main className="flex-grow ml-72 h-screen overflow-y-auto scrollbar-hide py-12 px-8 lg:px-16">
        <div className="max-w-5xl mx-auto space-y-10">

          {/* Header */}
          <div className="flex items-center justify-between pb-8 border-b border-white/5">
            <div className="space-y-1.5">
              <button
                onClick={() => router.push("/admin/products")}
                className="flex items-center gap-2 text-gray-600 hover:text-white transition-colors group mb-3"
              >
                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Product Library</span>
              </button>
              <div className="flex items-center gap-2 text-indigo-400">
                <Package size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Asset Provisioning</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter">
                Initialize <span className="text-indigo-500 italic">Asset.</span>
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN — Main Fields */}
              <div className="xl:col-span-8 space-y-6">

                {/* Image Upload */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative w-full aspect-video rounded-3xl border-2 border-dashed cursor-pointer overflow-hidden transition-all group ${
                    dragging ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/[0.02] hover:border-indigo-500/50 hover:bg-white/[0.04]"
                  }`}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex items-center gap-2 text-white text-xs font-black uppercase tracking-widest bg-black/60 px-4 py-2 rounded-xl border border-white/20">
                          <Upload size={14} /> Replace Image
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 border border-white/10 text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${dragging ? "bg-indigo-500/20 text-indigo-400" : "bg-white/[0.03] text-gray-600 group-hover:text-indigo-400 group-hover:bg-indigo-500/10"}`}>
                        <ImageIcon size={28} />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
                          {dragging ? "Drop to upload" : "Drag & drop or click to browse"}
                        </p>
                        <p className="text-[10px] text-gray-700 font-bold">PNG, JPG, WEBP — Max 10MB</p>
                      </div>
                    </div>
                  )}
                  <input ref={fileInputRef} id="image-upload" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageChange(f); }} />
                </div>

                {/* Name & Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField label="Product Name" required>
                    <InputBase
                      placeholder="e.g. Cyberpunk UI Kit 2024"
                      value={formData.name}
                      onChange={update("name")}
                      required
                    />
                  </FormField>
                  <FormField label="Price (IDR)" required>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-[11px] font-black">Rp</span>
                      <InputBase
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="29.99"
                        value={formData.price}
                        onChange={update("price")}
                        className="pl-10"
                        required
                      />
                    </div>
                  </FormField>
                </div>

                {/* Description */}
                <FormField label="Description">
                  <textarea
                    rows={4}
                    placeholder="Describe the value this asset delivers..."
                    value={formData.description}
                    onChange={update("description")}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all resize-none"
                  />
                </FormField>

                {/* Fulfillment URL */}
                <div className="p-6 rounded-3xl bg-indigo-600/5 border border-indigo-500/10 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Fulfillment Details</span>
                  </div>
                  <FormField label="Asset Delivery URL" required>
                    <div className="relative">
                      <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                      <InputBase
                        placeholder="https://storage.example.com/your-asset.zip"
                        value={formData.downloadUrl}
                        onChange={update("downloadUrl")}
                        className="pl-10"
                        required
                      />
                    </div>
                  </FormField>
                </div>

                {/* Error / Success */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20"
                    >
                      <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                      <p className="text-xs font-bold text-red-400">{error}</p>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
                    >
                      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                      <p className="text-xs font-bold text-emerald-400">Asset published successfully. Redirecting...</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* RIGHT COLUMN — Meta & Actions */}
              <div className="xl:col-span-4 space-y-5 xl:sticky xl:top-12">

                {/* Category */}
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-gray-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Classification</span>
                  </div>
                  <FormField label="Category" required>
                    <SelectBase value={formData.categoryId} onChange={update("categoryId")} required>
                      <option value="" disabled className="bg-black">Select Category</option>
                      {categories?.map((cat: any) => (
                        <option key={cat.id} value={cat.id} className="bg-black">{cat.name}</option>
                      ))}
                    </SelectBase>
                  </FormField>
                </div>

                {/* Product Type */}
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-gray-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Asset Type</span>
                  </div>
                  <div className="space-y-2">
                    {PRODUCT_TYPES.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, productType: type.value }))}
                        className={`w-full p-4 rounded-2xl text-left border transition-all ${
                          formData.productType === type.value
                            ? "bg-indigo-600/10 border-indigo-500/30 text-white"
                            : "bg-white/[0.02] border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/10"
                        }`}
                      >
                        <p className={`text-xs font-black uppercase tracking-widest ${formData.productType === type.value ? "text-indigo-400" : ""}`}>{type.label}</p>
                        <p className="text-[10px] text-gray-600 font-medium mt-0.5">{type.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading || success}
                    className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-indigo-600/20"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : success ? (
                      <><CheckCircle2 size={16} /> Published!</>
                    ) : (
                      <><Save size={14} /> Publish Asset</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-full h-12 rounded-2xl bg-white/[0.03] border border-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:bg-white/[0.06] hover:text-white transition-all"
                  >
                    Discard
                  </button>
                </div>

                {/* Checklist */}
                <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Pre-publish Checklist</p>
                  {[
                    { label: "Product name set", done: !!formData.name },
                    { label: "Price defined", done: !!formData.price },
                    { label: "Category selected", done: !!formData.categoryId },
                    { label: "Delivery URL added", done: !!formData.downloadUrl },
                    { label: "Cover image uploaded", done: !!imageFile },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${item.done ? "bg-emerald-500" : "bg-white/[0.05] border border-white/10"}`}>
                        {item.done && <CheckCircle2 size={10} className="text-white" />}
                      </div>
                      <span className={`text-[10px] font-bold transition-colors ${item.done ? "text-gray-400" : "text-gray-700"}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>

        </div>
      </main>
    </div>
  );
}
