import { create } from 'zustand';
import { apiClient } from '../lib/axios';
import jsCookie from 'js-cookie';

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  error: null,

  setAuth: (user, accessToken) => {
    if (accessToken) {
      const isProd = typeof window !== 'undefined' && 
                    !window.location.hostname.includes('localhost') && 
                    !window.location.hostname.includes('127.0.0.1');

      jsCookie.set('accessToken', accessToken, { 
        expires: 15 / (24 * 60),
        secure: isProd,
        sameSite: 'lax',
        path: '/'
      });
    }
    set({ user, accessToken, isLoading: false, error: null });
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
    } finally {
      jsCookie.remove('accessToken');
      set({ user: null, accessToken: null, isLoading: false, error: null });
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  },

  hydrate: () => {
    try {
      const token = jsCookie.get('accessToken');
      if (token) {
        const parts = token.split('.');
        if (parts.length === 3) {
          try {
            const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            console.log('[AUTH] Hydrated session for user:', payload.id);
            set({ accessToken: token, user: { id: payload.id, name: payload.name || 'User' }, isLoading: false });
            return;
          } catch (decodeErr) {
            console.error('[AUTH] Token decoding failed:', decodeErr);
          }
        }
      }
    } catch (e) {
      console.error('Failed to hydrate auth state', e);
      jsCookie.remove('accessToken');
    }
    set({ isLoading: false, user: null, accessToken: null });
  }
}));

export default useAuthStore;
