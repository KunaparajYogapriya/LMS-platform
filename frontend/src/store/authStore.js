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
    const token = jsCookie.get('accessToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      set({ accessToken: token, user: { id: payload.id }, isLoading: false }); 
    } else {
      set({ isLoading: false });
    }
  }
}));

export default useAuthStore;
