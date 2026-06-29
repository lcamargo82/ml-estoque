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

type BiometricResult =
  | { success: true }
  | { success: false; reason: 'unavailable' | 'not-linked' | 'cancelled' | 'credentials-missing' | 'login-failed' };

const BIOMETRIC_SERVER = 'ml-estoque';

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

    async clearBiometricLink() {
      try {
        await NativeBiometric.deleteCredentials({ server: BIOMETRIC_SERVER });
      } catch {
        // The credential may already have been removed by the operating system.
      }
      await Preferences.remove({ key: 'biometrics_linked' });
      this.biometricsLinked = false;
    },

    async enrollBiometrics(credentials: { email: string; password: string }): Promise<BiometricResult> {
      if (!this.biometricsAvailable) {
        return { success: false, reason: 'unavailable' };
      }

      try {
        await NativeBiometric.verifyIdentity({
          reason: 'Ativar acesso biométrico ao ML Estoque',
          title: 'Ativar Biometria',
          subtitle: 'Confirme sua identidade',
          description: 'Suas credenciais serão protegidas pelo dispositivo',
        });
        await NativeBiometric.setCredentials({
          username: credentials.email,
          password: credentials.password,
          server: BIOMETRIC_SERVER,
        });
        const savedCredentials = await NativeBiometric.getCredentials({
          server: BIOMETRIC_SERVER,
        });
        if (
          savedCredentials.username !== credentials.email ||
          savedCredentials.password !== credentials.password
        ) {
          await this.clearBiometricLink();
          return { success: false, reason: 'credentials-missing' };
        }
        await Preferences.set({ key: 'biometrics_linked', value: 'true' });
        this.biometricsLinked = true;
        return { success: true };
      } catch {
        await this.clearBiometricLink();
        return { success: false, reason: 'cancelled' };
      }
    },

    async saveBiometricCredentials(email: string, password: string) {
      return this.enrollBiometrics({ email, password });
    },

    async loginWithBiometrics(): Promise<BiometricResult> {
      if (!this.biometricsAvailable) return { success: false, reason: 'unavailable' };
      if (!this.biometricsLinked) return { success: false, reason: 'not-linked' };

      try {
        await NativeBiometric.verifyIdentity({
          reason: "Para acessar o ML Estoque",
          title: "Autenticação Biométrica",
          subtitle: "Use sua digital para entrar",
          description: "Confirme sua identidade",
        });

        // Recuperar credenciais seguras
        const credentials = await NativeBiometric.getCredentials({
          server: BIOMETRIC_SERVER,
        });

        if (credentials && credentials.username && credentials.password) {
          const success = await this.login({
            email: credentials.username,
            password: credentials.password
          });
          return success
            ? { success: true }
            : { success: false, reason: 'login-failed' };
        }

        await this.clearBiometricLink();
        return { success: false, reason: 'credentials-missing' };
      } catch {
        try {
          await NativeBiometric.getCredentials({ server: BIOMETRIC_SERVER });
        } catch {
          await this.clearBiometricLink();
          return { success: false, reason: 'credentials-missing' };
        }
        return { success: false, reason: 'cancelled' };
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

    async updateProfile(profile: { name: string; email: string }) {
      const response = await api.patch('/auth/profile', profile);
      this.user = response.data;
      return response.data;
    },

    async changePassword(credentials: { currentPassword: string; newPassword: string }) {
      const response = await api.post('/auth/change-password', credentials);
      return response.data;
    },

    async requestPasswordReset(email: string) {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    },

    async resetPassword(token: string, password: string) {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    },

    async logout() {
      this.user = null;
      this.token = '';
      await Preferences.remove({ key: 'token' });
    }
  },
});
