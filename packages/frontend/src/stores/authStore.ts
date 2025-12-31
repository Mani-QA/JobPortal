import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens } from '@job-portal/shared';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    role: 'employer' | 'seeker';
    gdprConsent: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post<{ user: User; tokens: AuthTokens }>('/auth/login', { email, password });
          const { user, tokens } = response.data as { user: User; tokens: AuthTokens };
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await api.post<{ user: User; tokens: AuthTokens }>('/auth/register', {
            ...data,
            confirmPassword: data.password,
          });
          const { user, tokens } = response.data as { user: User; tokens: AuthTokens };
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        const { tokens } = get();
        try {
          if (tokens?.refreshToken) {
            await api.post('/auth/logout', { refreshToken: tokens.refreshToken });
          }
        } catch {
          // Ignore logout errors
        } finally {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
          });
        }
      },

      refreshTokens: async () => {
        const { tokens } = get();
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token');
        }

        try {
          const response = await api.post<{ tokens: AuthTokens }>('/auth/refresh', {
            refreshToken: tokens.refreshToken,
          });
          
          set({
            tokens: (response.data as { tokens: AuthTokens }).tokens,
          });
        } catch (error) {
          // If refresh fails, log out
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      setUser: (user) => {
        set({ user });
      },

      checkAuth: async () => {
        const { tokens } = get();
        if (!tokens?.accessToken) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          const response = await api.get<User>('/auth/me');
          set({
            user: response.data as User,
            isAuthenticated: true,
          });
        } catch {
          // Token might be expired, try to refresh
          try {
            await get().refreshTokens();
            const response = await api.get<User>('/auth/me');
            set({
              user: response.data as User,
              isAuthenticated: true,
            });
          } catch {
            set({
              user: null,
              tokens: null,
              isAuthenticated: false,
            });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

