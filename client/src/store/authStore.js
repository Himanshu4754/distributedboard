import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user:  JSON.parse(localStorage.getItem('db_user') || 'null'),
  token: localStorage.getItem('db_token') || null,

  setAuth: (user, token) => {
    localStorage.clear();
    localStorage.setItem('db_user',  JSON.stringify(user));
    localStorage.setItem('db_token', token);
    localStorage.setItem('db_username', user.username);
    console.log('[Auth] Logged in as:', user.username, user.email, 'id:', user.id);
    set({ user, token });
  },

  clearAuth: () => {
    console.log('[Auth] Clearing session. Was:', JSON.parse(localStorage.getItem('db_user') || 'null'));
    localStorage.clear();
    set({ user: null, token: null });
  },

  isAuthenticated: () => !!localStorage.getItem('db_token'),
}));

export default useAuthStore;