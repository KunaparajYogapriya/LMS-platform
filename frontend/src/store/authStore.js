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
      jsCookie.set('accessToken', accessToken, { expires: 15 / (24 * 60) });
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
          const payload = JSON.parse(atob(parts[1]));
          set({ accessToken: token, user: { id: payload.id, name: payload.name || 'User' }, isLoading: false });
          return;
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
