import { create } from 'zustand';
import { User } from '../services/models';
import {
  setAccessToken,
  setRefreshToken,
  clearTokens,
  hasTokens,
  getRefreshToken,
} from '../utils/storage';
import {
  getMe,
  login as loginAPI,
  register as registerAPI,
  logout as logoutAPI,
} from '../services/endpoints/authentication';

/**
 * Authentication Store using Zustand
 *
 * Security Model:
 * - Both tokens stored in cookies via js-cookie
 * - Secure flag: HTTPS only (in production)
 * - SameSite: 'strict' for CSRF protection
 * - AccessToken: 15 minutes expiry
 * - RefreshToken: 7 days expiry
 */

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,

  initAuth: async () => {
    if (hasTokens()) {
      try {
        const userData = await getMe();
        set({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      } catch (error) {
        console.error('Failed to validate token:', error);

        // Clear tokens and cache on validation failure
        clearTokens();
        const { queryClient } = await import('../services/queryClient');
        queryClient.clear();

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    } else {
      set({
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const data = await loginAPI({ email, password });

      // Store both tokens in cookies
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);

      set({
        user: data.user as User,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  register: async (email: string, password: string, fullName?: string) => {
    try {
      const data = await registerAPI({ email, password, fullName });

      // Store both tokens in cookies
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);

      set({
        user: data.user as User,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshTokenValue = getRefreshToken();
      if (refreshTokenValue) {
        await logoutAPI({ refreshToken: refreshTokenValue });
      }
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      // Clear tokens
      clearTokens();

      // Clear React Query cache to remove all cached data
      const { queryClient } = await import('../services/queryClient');
      queryClient.clear();

      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  refreshAuth: async () => {
    try {
      const userData = await getMe();
      set({
        user: userData,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Failed to refresh auth:', error);

      // Clear tokens and cache on refresh failure
      clearTokens();
      const { queryClient } = await import('../services/queryClient');
      queryClient.clear();

      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },
}));

// Initialize auth on app load
if (typeof window !== 'undefined') {
  useAuthStore.getState().initAuth();
}
