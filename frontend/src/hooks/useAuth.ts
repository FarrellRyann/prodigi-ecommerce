'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'prodigi-auth' }
  )
);

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, isAuthenticated, setUser, logout: clearStore } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: AuthService.login,
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['me'], data.user);
      router.push(data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    },
  });

  const registerMutation = useMutation({
    mutationFn: AuthService.register,
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['me'], data.user);
      router.push('/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => {
      clearStore();
      queryClient.clear();
      router.push('/login');
    },
  });

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: AuthService.me,
    enabled: isAuthenticated,
    retry: false,
  });

  return {
    user: me || user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutateAsync,
  };
}
