import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user:  JSON.parse(localStorage.getItem('db_user') || 'null'),
  token: localStorage.getItem('db_token') || null,

  setAuth: (user, token) => {
    localStorage.setItem('db_user',  JSON.stringify(user));
    localStorage.setItem('db_token', token);
    set({ user, token });
  },

  clearAuth: () => {
    localStorage.removeItem('db_user');
    localStorage.removeItem('db_token');
    localStorage.removeItem('db_username');
    set({ user: null, token: null });
  },

  isAuthenticated: () => !!localStorage.getItem('db_token'),
}));

export default useAuthStore;