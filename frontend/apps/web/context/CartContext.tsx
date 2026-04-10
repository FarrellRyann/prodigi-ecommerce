"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface CartContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalPrice: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart key scoped per user so different users on the same browser never share a cart
const cartKey = (userId?: string) =>
  userId ? `prodigi_cart_${userId}` : "prodigi_cart_guest";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);

  // Reload cart from localStorage whenever the logged-in user changes
  useEffect(() => {
    const key = cartKey(user?.id);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems([]);
      }
    } else {
      setItems([]); // clear in-memory when switching users
    }
  }, [user?.id]); // re-run on login / logout / user switch

  // Persist to localStorage on every change
  useEffect(() => {
    const key = cartKey(user?.id);
    localStorage.setItem(key, JSON.stringify(items));
  }, [items, user?.id]);

  const addItem = (product: Product) => {
    setItems((prev) => {
      if (prev.find((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => setItems([]);

  const totalPrice = items.reduce((acc, item) => acc + item.price, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalPrice, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
