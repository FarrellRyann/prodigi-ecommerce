"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, Library, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info" | "owned";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: { label: string; href: string };
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  owned: (productName?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  error:   <XCircle      className="w-4 h-4 text-red-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  info:    <Info          className="w-4 h-4 text-indigo-400" />,
  owned:   <Library       className="w-4 h-4 text-violet-400" />,
};

const STYLES: Record<ToastType, string> = {
  success: "border-emerald-500/20 bg-emerald-500/5",
  error:   "border-red-500/20 bg-red-500/5",
  warning: "border-amber-500/20 bg-amber-500/5",
  info:    "border-indigo-500/20 bg-indigo-500/5",
  owned:   "border-violet-500/20 bg-violet-500/5",
};

const TITLE_COLORS: Record<ToastType, string> = {
  success: "text-emerald-400",
  error:   "text-red-400",
  warning: "text-amber-400",
  info:    "text-indigo-400",
  owned:   "text-violet-400",
};

const ACTION_COLORS: Record<ToastType, string> = {
  success: "text-emerald-400 hover:text-emerald-300",
  error:   "text-red-400 hover:text-red-300",
  warning: "text-amber-400 hover:text-amber-300",
  info:    "text-indigo-400 hover:text-indigo-300",
  owned:   "text-violet-400 hover:text-violet-300",
};

const DURATION = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev.slice(-4), { ...opts, id }]); // max 5 toasts
    setTimeout(() => dismiss(id), DURATION);
  }, [dismiss]);

  const success = useCallback((title: string, message?: string) =>
    toast({ type: "success", title, message }), [toast]);

  const error = useCallback((title: string, message?: string) =>
    toast({ type: "error", title, message }), [toast]);

  const warning = useCallback((title: string, message?: string) =>
    toast({ type: "warning", title, message }), [toast]);

  const info = useCallback((title: string, message?: string) =>
    toast({ type: "info", title, message }), [toast]);

  const owned = useCallback((productName?: string) =>
    toast({
      type: "owned",
      title: "Already in your Library",
      message: productName
        ? `"${productName}" is already owned. Access it from your library.`
        : "You already own this product. Check your library.",
      action: { label: "Go to Library →", href: "/library" },
    }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, owned }}>
      {children}

      {/* Toast Container */}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
      >
        <AnimatePresence mode="sync">
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className={`pointer-events-auto w-80 rounded-2xl border backdrop-blur-md px-4 py-3.5 shadow-2xl ${STYLES[t.type]}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{ICONS[t.type]}</div>
                <div className="flex-grow min-w-0">
                  <p className={`text-[11px] font-black uppercase tracking-widest ${TITLE_COLORS[t.type]}`}>
                    {t.title}
                  </p>
                  {t.message && (
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{t.message}</p>
                  )}
                  {t.action && (
                    <a
                      href={t.action.href}
                      className={`text-[10px] font-black uppercase tracking-widest mt-1.5 inline-block transition-colors ${ACTION_COLORS[t.type]}`}
                    >
                      {t.action.label}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="flex-shrink-0 text-gray-600 hover:text-white transition-colors mt-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
