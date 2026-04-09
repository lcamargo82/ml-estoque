<script setup lang="ts">
import { 
  AlertCircle 
} from 'lucide-vue-next';

const props = defineProps<{
  label?: string;
  modelValue?: string | number;
  type?: string;
  placeholder?: string;
  error?: string;
  id?: string;
  icon?: any;
}>();

const emit = defineEmits(['update:modelValue', 'blur']);
</script>

<template>
  <div class="space-y-1.5 w-full">
    <label 
      v-if="label" 
      :for="id" 
      class="block text-sm font-semibold text-neutral/80 ml-1"
    >
      {{ label }}
    </label>
    
    <div class="relative flex items-center group">
      <!-- Icon Slot/Prop -->
      <div 
        v-if="icon" 
        class="absolute left-4 text-neutral/40 transition-colors group-focus-within:text-primary"
        :class="{ '!text-red-400': error }"
      >
        <component :is="icon" class="w-5 h-5" />
      </div>
      
      <input
        :id="id"
        :type="type || 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="emit('blur')"
        class="w-full bg-surface border rounded-xl py-3 text-white placeholder-neutral/30 transition-all duration-200 outline-none"
        :class="[
          icon ? 'pl-12 pr-4' : 'px-4',
          error 
            ? 'border-red-500/50 focus:border-red-500 shadow-lg shadow-red-500/5' 
            : 'border-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10'
        ]"
      />
    </div>

    <!-- Error Message -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="error" class="flex items-center gap-1.5 ml-1 text-xs text-red-500 font-medium">
        <AlertCircle class="w-3.5 h-3.5" />
        {{ error }}
      </div>
    </Transition>
  </div>
</template>
