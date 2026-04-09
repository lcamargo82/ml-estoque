<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next';
import BaseModal from './BaseModal.vue';

const props = defineProps<{
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}>();

const emit = defineEmits(['confirm', 'cancel']);

const variantClasses = {
  danger: 'text-red-400 bg-red-400/10 border-red-400/20',
  warning: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  info: 'text-primary bg-primary/10 border-primary/20'
};

const buttonClasses = {
  danger: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
  warning: 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/20',
  info: 'bg-primary hover:bg-primary-hover shadow-primary/20'
};
</script>

<template>
  <BaseModal :show="show" :title="title" size="sm" @close="emit('cancel')">
    <div class="space-y-6">
      <div 
        class="flex items-center gap-4 p-4 rounded-xl border"
        :class="variantClasses[variant || 'danger']"
      >
        <div class="p-2 bg-white/10 rounded-lg">
          <AlertTriangle class="w-6 h-6" />
        </div>
        <p class="text-sm font-medium leading-relaxed">
          {{ message }}
        </p>
      </div>

      <div class="flex gap-3">
        <button 
          @click="emit('cancel')"
          class="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-medium border border-white/5"
        >
          {{ cancelText || 'Cancelar' }}
        </button>
        <button 
          @click="emit('confirm')"
          class="flex-1 px-4 py-2.5 text-white rounded-xl transition-all font-medium shadow-lg"
          :class="buttonClasses[variant || 'danger']"
        >
          {{ confirmText || 'Confirmar' }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>
