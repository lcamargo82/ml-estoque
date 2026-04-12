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
    biometricsLinked: false,
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
      
      const { value: linked } = await Preferences.get({ key: 'biometrics_linked' });
      this.biometricsLinked = linked === 'true';

      // Verificar biometria em background para não travar o app
      NativeBiometric.isAvailable().then(result => {
        this.biometricsAvailable = result.isAvailable;
      }).catch(() => {
        this.biometricsAvailable = false;
      });
    },

    async login(credentials: { email: string; password: string }, linkBiometrics = false) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/login', credentials);
        const { access_token, user } = response.data;
        
        this.token = access_token;
        this.user = user;
        
        await Preferences.set({ key: 'token', value: access_token });

        if (linkBiometrics) {
          await this.saveBiometricCredentials(credentials.email, credentials.password);
        }
        
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao realizar login';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async saveBiometricCredentials(email: string, password: string) {
      try {
        await NativeBiometric.setCredentials({
          username: email,
          password: password,
          server: 'ml-estoque',
        });
        await Preferences.set({ key: 'biometrics_linked', value: 'true' });
        this.biometricsLinked = true;
      } catch (err) {
        console.error('Failed to save biometric credentials', err);
      }
    },

    async loginWithBiometrics() {
      if (!this.biometricsAvailable || !this.biometricsLinked) return false;

      try {
        await NativeBiometric.verifyIdentity({
          reason: "Para acessar o ML Estoque",
          title: "Autenticação Biométrica",
          subtitle: "Use sua digital para entrar",
          description: "Confirme sua identidade",
        });

        // Recuperar credenciais seguras
        const credentials = await NativeBiometric.getCredentials({
          server: 'ml-estoque',
        });

        if (credentials && credentials.username && credentials.password) {
          return await this.login({
            email: credentials.username,
            password: credentials.password
          });
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
