import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

// Endereço do Host para o Emulador Android: 10.0.2.2
// Para iOS ou ambiente de produção, este valor deve ser alterado nas variáveis de ambiente
const BASE_URL = 'http://10.0.2.2:3000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT
api.interceptors.request.use(
  async (config) => {
    const { value: token } = await Preferences.get({ key: 'token' });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros globais (ex: token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await Preferences.remove({ key: 'token' });
      // Aqui poderíamos redirecionar para o login usando o router se necessário
    }
    return Promise.reject(error);
  }
);

export default api;
