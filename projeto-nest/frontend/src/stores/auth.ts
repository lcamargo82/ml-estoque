import { defineStore } from 'pinia';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || '',
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async login(credentials: { email: string; password: string }) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post('/api/v1/auth/login', credentials);
        const { access_token, user } = response.data;
        
        this.token = access_token;
        this.user = user;
        
        localStorage.setItem('token', access_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao realizar login';
        return false;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = '';
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    },

    async fetchProfile() {
      if (!this.token) return;
      try {
        const response = await axios.get('/api/v1/auth/profile');
        this.user = response.data;
      } catch (err) {
        this.logout();
      }
    }
  },
});
