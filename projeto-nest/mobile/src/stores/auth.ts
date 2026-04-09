import { defineStore } from 'pinia';
import { Preferences } from '@capacitor/preferences';
import api from '@/services/api';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: '',
    loading: false,
    error: null as string | null,
    biometricsAvailable: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async initialize() {
      const { value: token } = await Preferences.get({ key: 'token' });
      if (token) {
        this.token = token;
        await this.fetchProfile();
      }
      
      // Verificar se o dispositivo suporta biometria
      try {
        const result = await NativeBiometric.isAvailable();
        this.biometricsAvailable = result.isAvailable;
      } catch (err) {
        this.biometricsAvailable = false;
      }
    },

    async login(credentials: { email: string; password: string }) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/login', credentials);
        const { access_token, user } = response.data;
        
        this.token = access_token;
        this.user = user;
        
        await Preferences.set({ key: 'token', value: access_token });
        
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao realizar login';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async loginWithBiometrics() {
      if (!this.biometricsAvailable) return false;

      try {
        await NativeBiometric.verifyIdentity({
          reason: "Para acessar o ML Estoque",
          title: "Autenticação Biométrica",
          subtitle: "Use sua digital para entrar",
          description: "Confirme sua identidade",
        });

        // Se não disparou erro, a verificação foi um sucesso
        const { value: token } = await Preferences.get({ key: 'token' });
        if (token) {
          this.token = token;
          await this.fetchProfile();
          return true;
        }
        return false;
      } catch (err) {
        console.error('Biometric authentication failed', err);
        return false;
      }
    },

    async fetchProfile() {
      try {
        const response = await api.get('/auth/profile');
        this.user = response.data;
      } catch (err) {
        await this.logout();
      }
    },

    async logout() {
      this.user = null;
      this.token = '';
      await Preferences.remove({ key: 'token' });
    }
  },
});
