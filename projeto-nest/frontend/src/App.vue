<template>
  <div class="min-h-screen bg-background text-neutral flex">
    <!-- Sidebar Component -->
    <Sidebar 
      v-if="authStore.isAuthenticated"
      :is-collapsed="sidebarCollapsed" 
      @toggle="toggleSidebar" 
    />

    <!-- Main Content Area -->
    <main 
      class="flex-1 transition-all duration-300 min-w-0"
      :class="[
        authStore.isAuthenticated 
          ? (sidebarCollapsed ? 'pl-20' : 'pl-64') 
          : ''
      ]"
    >
      <router-view v-slot="{ Component }">
        <transition 
          name="fade" 
          mode="out-in"
        >
          <div :key="$route.path" class="p-6 md:p-8">
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import Sidebar from '@/components/layout/Sidebar.vue';

const authStore = useAuthStore();
const sidebarCollapsed = ref(localStorage.getItem('sidebar_collapsed') === 'true');

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
  localStorage.setItem('sidebar_collapsed', sidebarCollapsed.value.toString());
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.fetchProfile();
  }
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Global scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-background;
}

::-webkit-scrollbar-thumb {
  @apply bg-white/10 rounded-full hover:bg-white/20 transition-colors;
}
</style>
