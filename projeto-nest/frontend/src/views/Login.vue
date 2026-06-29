<template>
  <div class="flex items-center justify-center min-h-screen p-4">
    <div class="w-full max-w-md glass-card p-8 animate-in fade-in zoom-in duration-500">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold text-white mb-2 leading-tight">
          ML <span class="text-primary">Estoque</span>
        </h1>
        <p class="text-neutral mt-2">Bem-vindo(a) ao sistema de gestão premium</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-white mb-2">E-mail</label>
          <div class="relative">
            <input 
              id="email"
              v-model="form.email"
              type="email" 
              placeholder="exemplo@ml.com"
              class="input-field"
              required
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-white mb-2">Senha</label>
          <div class="relative">
            <input 
              id="password"
              v-model="form.password"
              :type="passwordVisible ? 'text' : 'password'"
              placeholder="••••••••"
              class="input-field pr-12"
              required
            />
            <button 
              type="button" 
              class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral hover:text-white transition-colors duration-200" 
              :aria-label="passwordVisible ? 'Ocultar senha' : 'Mostrar senha'" 
              @click="passwordVisible = !passwordVisible"
            >
              <EyeOff v-if="passwordVisible" class="w-5 h-5"/>
              <Eye v-else class="w-5 h-5"/>
            </button>
          </div>
          <div class="mt-2 text-right">
            <router-link to="/forgot-password" class="text-xs text-primary hover:underline transition-colors duration-200">
              Esqueci minha senha
            </router-link>
          </div>
        </div>

        <div v-if="authStore.error" class="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
          {{ authStore.error }}
        </div>

        <button 
          type="submit" 
          class="btn-primary w-full flex items-center justify-center gap-3"
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading" class="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></span>
          {{ authStore.loading ? 'Entrando...' : 'Acessar Painel' }}
        </button>
      </form>

      <div class="mt-8 pt-8 border-t border-white/5 text-center">
        <p class="text-neutral/40 text-xs">
          © 2026 ML Estoque. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Eye, EyeOff } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const passwordVisible = ref(false);

const form = reactive({
  email: '',
  password: '',
});

async function handleLogin() {
  const success = await authStore.login({
    email: form.email,
    password: form.password,
  });

  if (success) {
    router.push({ name: 'Dashboard' });
  }
}
</script>

<style scoped>
/* Estilos específicos se necessário, mas seguindo a diretriz global */
.animate-in {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
