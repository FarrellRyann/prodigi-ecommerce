"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkSession = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user || response.data); // Handle both wrapped and unwrapped user responses
    } catch (error) {
      setUser(null);
      // If we have a stale token but backend says 401, we should probably clear cookies
      // This is handled by the browser if the backend sends a clear-cookie header, 
      // but let's call logout explicitly if needed or just handle it here.
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: any) => {
    const response = await api.post("/auth/login", credentials);
    setUser(response.data.user);
    router.push("/");
  };

  const register = async (data: { email: string; password: string; role: string }) => {
    await api.post("/auth/register", data);
    // Redirect to login page instead of auto-logging in
    router.push("/login?registered=true");
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    // Force a hard reload to completely wipe React Query's in-memory cache
    window.location.href = "/login";
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
