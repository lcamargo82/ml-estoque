<template>
  <div class="p-8">
    <div class="mb-10">
      <h2 class="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
      <p class="text-neutral mt-1">Bem-vindo de volta, <span class="text-primary font-semibold">{{ authStore.user?.name }}</span></p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-card p-6 border-l-4 border-l-primary">
        <h3 class="text-neutral text-sm font-medium uppercase tracking-wider mb-2">Total de Produtos</h3>
        <p class="text-4xl font-bold text-white">128</p>
      </div>
      <div class="glass-card p-6 border-l-4 border-l-secondary">
        <h3 class="text-neutral text-sm font-medium uppercase tracking-wider mb-2">Valor em Estoque</h3>
        <p class="text-4xl font-bold text-white">R$ 45.200</p>
      </div>
      <div class="glass-card p-6 border-l-4 border-l-tertiary">
        <h3 class="text-neutral text-sm font-medium uppercase tracking-wider mb-2">Pedidos Pendentes</h3>
        <p class="text-4xl font-bold text-white">12</p>
      </div>
    </div>

    <div class="mt-10 glass-card p-8 min-h-[400px] flex items-center justify-center border-dashed border-2 border-white/5">
      <div class="text-center">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-0h6m-6 0H6" />
          </svg>
        </div>
        <p class="text-white font-medium">Interface de Gestão em Construção</p>
        <p class="text-neutral text-sm">O módulo de visualização de produtos será implementado em breve.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
</script>
