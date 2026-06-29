<script setup lang="ts">
import { ref } from 'vue';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  HelpCircle,
  Truck
} from 'lucide-vue-next';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const props = defineProps<{
  isCollapsed: boolean;
}>();

const emit = defineEmits(['toggle']);

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Catálogo', icon: Package, path: '/products' },
  { name: 'Fornecedores', icon: Truck, path: '/suppliers' },
  { name: 'Usuários', icon: Users, path: '/users' },
  { name: 'Configurações', icon: Settings, path: '/settings' },
];

const navigate = (path: string) => {
  router.push(path);
};

const isActive = (path: string) => route.path === path;

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'Login' });
};
</script>

<template>
  <aside 
    class="fixed left-0 top-0 h-screen bg-surface border-r border-white/5 transition-all duration-300 z-50 flex flex-col"
    :class="[isCollapsed ? 'w-20' : 'w-64']"
  >
    <!-- Logo Area -->
    <div class="p-6 flex items-center gap-3">
      <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
        <Package class="text-white w-5 h-5" />
      </div>
      <span v-if="!isCollapsed" class="font-bold text-white text-lg truncate">ML Estoque</span>
    </div>

    <!-- Toggle Button -->
    <button 
      @click="emit('toggle')"
      class="absolute -right-3 top-20 bg-primary text-white p-1 rounded-full border-4 border-background hover:scale-110 transition-transform"
    >
      <ChevronLeft v-if="!isCollapsed" class="w-4 h-4" />
      <ChevronRight v-else class="w-4 h-4" />
    </button>

    <!-- Navigation -->
    <nav class="flex-1 px-3 space-y-2 mt-4">
      <button
        v-for="item in menuItems"
        :key="item.path"
        @click="navigate(item.path)"
        class="w-full flex items-center gap-4 p-3 rounded-xl transition-all group"
        :class="[
          isActive(item.path) 
            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
            : 'text-neutral hover:bg-white/5 hover:text-white'
        ]"
      >
        <component :is="item.icon" class="w-6 h-6 flex-shrink-0" />
        <span v-if="!isCollapsed" class="font-medium truncate">{{ item.name }}</span>
        
        <!-- Tooltip for collapsed mode -->
        <div 
          v-if="isCollapsed"
          class="absolute left-20 bg-surface border border-white/10 px-2 py-1 rounded text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
        >
          {{ item.name }}
        </div>
      </button>
    </nav>

    <!-- Footer Actions -->
    <div class="p-4 space-y-2 border-t border-white/5">
      <button class="w-full flex items-center gap-4 p-3 rounded-xl text-neutral hover:bg-white/5 hover:text-white transition-all">
        <HelpCircle class="w-6 h-6 flex-shrink-0" />
        <span v-if="!isCollapsed" class="font-medium">Suporte</span>
      </button>
      <button @click="handleLogout" class="w-full flex items-center gap-4 p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all">
        <LogOut class="w-6 h-6 flex-shrink-0" />
        <span v-if="!isCollapsed" class="font-medium">Sair</span>
      </button>
    </div>
  </aside>
</template>
