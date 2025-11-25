import { create } from 'zustand';
import { api, User } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, isVendor: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    const result = await api.login(email, password);
    
    if (result.error) {
      set({ error: result.error, isLoading: false });
      return false;
    }
    
    set({ user: result.data?.user || null, isLoading: false });
    return true;
  },

  register: async (email, password, name, isVendor) => {
    set({ isLoading: true, error: null });
    const result = await api.register(email, password, name, isVendor);
    
    if (result.error) {
      set({ error: result.error, isLoading: false });
      return false;
    }
    
    set({ user: result.data?.user || null, isLoading: false });
    return true;
  },

  logout: async () => {
    await api.logout();
    set({ user: null, error: null });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    const result = await api.getUser();
    set({ 
      user: result.data || null, 
      isLoading: false,
      error: result.error || null 
    });
  },
}));
