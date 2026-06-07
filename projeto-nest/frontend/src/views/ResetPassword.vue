<template>
  <div class="flex items-center justify-center min-h-screen p-4">
    <div class="w-full max-w-md glass-card p-8 animate-in fade-in zoom-in duration-500">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold text-white mb-2 leading-tight">
          Nova <span class="text-primary">Senha</span>
        </h1>
        <p class="text-neutral mt-2">Defina sua nova senha de acesso abaixo.</p>
      </div>

      <form v-if="!success" @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="password" class="block text-sm font-medium text-white mb-2">Nova Senha</label>
          <div class="relative"><input
            id="password"
            v-model="password"
            :type="passwordVisible ? 'text' : 'password'"
            placeholder="Mínimo 6 caracteres"
            class="input-field"
            required
            :disabled="loading"
          /><button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral" :aria-label="passwordVisible ? 'Ocultar senha' : 'Mostrar senha'" @click="passwordVisible=!passwordVisible"><EyeOff v-if="passwordVisible" class="w-5 h-5"/><Eye v-else class="w-5 h-5"/></button></div>
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-white mb-2">Confirmar Nova Senha</label>
          <div class="relative"><input
            id="confirmPassword"
            v-model="confirmPassword"
            :type="confirmVisible ? 'text' : 'password'"
            placeholder="Confirme sua nova senha"
            class="input-field"
            required
            :disabled="loading"
          /><button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral" :aria-label="confirmVisible ? 'Ocultar senha' : 'Mostrar senha'" @click="confirmVisible=!confirmVisible"><EyeOff v-if="confirmVisible" class="w-5 h-5"/><Eye v-else class="w-5 h-5"/></button></div>
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
          {{ loading ? 'Redefinindo...' : 'Alterar Senha' }}
        </button>
      </form>

      <div v-else class="text-center space-y-6">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-emerald-400 font-semibold text-lg">Senha Alterada!</p>
        <p class="text-neutral text-sm">
          Sua senha foi redefinida com sucesso. Você será redirecionado para a tela de login em instantes...
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import { useToast } from 'vue-toastification';
import { Eye, EyeOff } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const password = ref('');
const confirmPassword = ref('');
const token = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);
const passwordVisible = ref(false);
const confirmVisible = ref(false);

onMounted(() => {
  const queryToken = route.query.token as string;
  if (!queryToken) {
    error.value = 'Token de redefinição ausente. Por favor, utilize o link enviado em seu e-mail.';
    toast.error('Token não encontrado na URL.');
  } else {
    token.value = queryToken;
  }
});

async function handleSubmit() {
  if (!token.value) {
    error.value = 'Token de redefinição ausente.';
    return;
  }

  if (password.value.length < 6) {
    error.value = 'A senha deve ter pelo menos 6 caracteres.';
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'As senhas digitadas não coincidem.';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await api.post('/auth/reset-password', {
      token: token.value,
      password: password.value
    });
    
    success.value = true;
    toast.success('Senha alterada com sucesso!');
    
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Falha ao redefinir a senha. O link pode ter expirado.';
    toast.error('Erro ao redefinir senha.');
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
