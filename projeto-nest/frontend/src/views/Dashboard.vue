<template>
  <div class="p-8">
    <div class="mb-10">
      <h2 class="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
      <p class="text-neutral mt-1">Bem-vindo de volta, <span class="text-primary font-semibold">{{ authStore.user?.name }}</span></p>
    </div>

    <div v-if="loading" class="text-neutral text-center p-10">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mr-3"></div>
      Carregando estatísticas...
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-card p-6 border-l-4 border-l-primary">
        <h3 class="text-neutral text-sm font-medium uppercase tracking-wider mb-2">Total de Itens em Estoque</h3>
        <p class="text-4xl font-bold text-white">{{ formatNumber(stats.totalQuantity) }}</p>
        <p class="text-neutral/70 text-xs mt-1">{{ formatNumber(stats.totalProducts) }} produtos distintos</p>
      </div>
      <div class="glass-card p-6 border-l-4 border-l-secondary">
        <h3 class="text-neutral text-sm font-medium uppercase tracking-wider mb-2">Valor Total de Custo</h3>
        <p class="text-4xl font-bold text-white">{{ formatCurrency(stats.totalCostValue) }}</p>
        <p class="text-neutral/70 text-xs mt-1">Preço médio: {{ formatCurrency(stats.totalQuantity > 0 ? stats.totalCostValue / stats.totalQuantity : 0) }} / unidade</p>
      </div>
      <div class="glass-card p-6 border-l-4 border-l-tertiary">
        <h3 class="text-neutral text-sm font-medium uppercase tracking-wider mb-2">Status Mercado Livre</h3>
        <div class="flex items-baseline justify-between">
          <p class="text-4xl font-bold text-white">{{ formatNumber(stats.totalListed) }}</p>
          <span class="text-neutral text-sm">Anunciados</span>
        </div>
        <div class="flex items-baseline justify-between mt-2 border-t border-white/5 pt-2">
          <p class="text-lg font-semibold text-white/80">{{ formatNumber(stats.totalUnlisted) }}</p>
          <span class="text-neutral/80 text-xs">Não Anunciados</span>
        </div>
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
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { DashboardRepository } from '@/repositories/DashboardRepository';
import type { DashboardStats } from '@/types';

const authStore = useAuthStore();
const loading = ref(true);
const stats = ref<DashboardStats>({
  totalProducts: 0,
  totalQuantity: 0,
  totalCostValue: 0,
  totalListed: 0,
  totalUnlisted: 0,
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

onMounted(async () => {
  try {
    stats.value = await DashboardRepository.getStats();
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
  } finally {
    loading.value = false;
  }
});
</script>
