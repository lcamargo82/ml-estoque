<template>
  <div class="flex items-center justify-center min-h-screen p-4">
    <div class="w-full max-w-md glass-card p-8 animate-in fade-in zoom-in duration-500">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold text-white mb-2 leading-tight">
          Recuperar <span class="text-primary">Senha</span>
        </h1>
        <p class="text-neutral mt-2">Insira seu e-mail cadastrado para receber o link de redefinição.</p>
      </div>

      <form v-if="!emailSent" @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-white mb-2">E-mail</label>
          <input 
            id="email"
            v-model="email"
            type="email" 
            placeholder="exemplo@ml.com"
            class="input-field"
            required
            :disabled="loading"
          />
        </div>

        <div v-if="error" class="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
          {{ error }}
        </div>

        <button 
          type="submit" 
          class="btn-primary w-full flex items-center justify-center gap-3"
          :disabled="loading"
        >
          <span v-if="loading" class="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></span>
          {{ loading ? 'Enviando...' : 'Enviar Link de Recuperação' }}
        </button>
      </form>

      <div v-else class="text-center space-y-6">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
          </svg>
        </div>
        <p class="text-emerald-400 font-semibold text-lg">E-mail Enviado com Sucesso!</p>
        <p class="text-neutral text-sm leading-relaxed">
          Se o endereço <strong>{{ email }}</strong> estiver registrado no sistema, um e-mail com as instruções para redefinição de senha será enviado em instantes.
        </p>
      </div>

      <div class="mt-8 pt-8 border-t border-white/5 text-center">
        <router-link to="/login" class="text-sm text-primary hover:underline flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para o Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '@/services/api';
import { useToast } from 'vue-toastification';

const toast = useToast();
const email = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const emailSent = ref(false);

async function handleSubmit() {
  loading.value = true;
  error.value = null;
  
  try {
    await api.post('/auth/forgot-password', { email: email.value });
    emailSent.value = true;
    toast.success('E-mail de recuperação solicitado com sucesso!');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Falha ao processar solicitação. Tente novamente.';
    toast.error('Erro ao solicitar recuperação de senha.');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
