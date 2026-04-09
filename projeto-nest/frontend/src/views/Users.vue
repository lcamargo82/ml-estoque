<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  User as UserIcon,
  Shield,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Mail
} from 'lucide-vue-next';
import { UserRepository } from '@/repositories/UserRepository';
import type { User } from '@/types';
import { useToast } from 'vue-toastification';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseInput from '@/components/ui/BaseInput.vue';

const toast = useToast();
const users = ref<User[]>([]);
const isLoading = ref(true);
const searchQuery = ref('');
const isModalOpen = ref(false);
const isEditing = ref(false);
const currentUser = ref<Partial<User>>({
  name: '',
  email: '',
  role: 'USER',
  isActive: true
});

const fetchUsers = async () => {
  isLoading.value = true;
  try {
    users.value = await UserRepository.list();
  } catch (error) {
    toast.error('Erro ao carregar usuários');
  } finally {
    isLoading.value = false;
  }
};

const filteredUsers = computed(() => {
  return users.value.filter(u => 
    u.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const openCreateModal = () => {
  isEditing.value = false;
  currentUser.value = {
    name: '',
    email: '',
    role: 'USER',
    isActive: true
  };
  isModalOpen.value = true;
};

const openEditModal = (user: User) => {
  isEditing.value = true;
  currentUser.value = { ...user };
  isModalOpen.value = true;
};

const handleSave = async () => {
  try {
    if (isEditing.value && currentUser.value.id) {
      await UserRepository.update(currentUser.value.id, currentUser.value);
      toast.success('Usuário atualizado com sucesso');
    } else {
      await UserRepository.create(currentUser.value);
      toast.success('Usuário criado com sucesso');
    }
    isModalOpen.value = false;
    fetchUsers();
  } catch (error) {
    toast.error('Erro ao salvar usuário');
  }
};

const toggleUserStatus = async (user: User) => {
  try {
    await UserRepository.update(user.id, { isActive: !user.isActive });
    toast.success(`Usuário ${user.isActive ? 'desativado' : 'ativado'}`);
    fetchUsers();
  } catch (error) {
    toast.error('Erro ao alterar status');
  }
};

const handleDelete = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir este usuário?')) {
    try {
      await UserRepository.delete(id);
      toast.success('Usuário excluído');
      fetchUsers();
    } catch (error) {
      toast.error('Erro ao excluir usuário');
    }
  }
};

onMounted(fetchUsers);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">Gestão de Usuários</h1>
        <p class="text-neutral mt-1">Controle de acesso e permissões do sistema.</p>
      </div>
      <button 
        @click="openCreateModal"
        class="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 font-medium"
      >
        <Plus class="w-5 h-5" />
        Novo Usuário
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface p-4 rounded-2xl border border-white/5 shadow-sm">
      <div class="md:col-span-4 relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral w-5 h-5" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Buscar por nome ou email..."
          class="w-full bg-background border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-neutral focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        >
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-surface rounded-2xl border border-white/5 overflow-hidden shadow-sm">
      <div v-if="isLoading" class="p-12 flex flex-col items-center justify-center gap-4">
        <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="text-neutral animate-pulse">Carregando usuários...</p>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="p-12 flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <AlertCircle class="w-8 h-8 text-neutral" />
        </div>
        <h3 class="text-lg font-medium text-white">Nenhum usuário encontrado</h3>
        <p class="text-neutral mt-1">Tente ajustar sua busca.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-white/5 bg-white/5">
              <th class="px-6 py-4 text-xs font-semibold text-neutral uppercase tracking-wider">Usuário</th>
              <th class="px-6 py-4 text-xs font-semibold text-neutral uppercase tracking-wider">Cargo</th>
              <th class="px-6 py-4 text-xs font-semibold text-neutral uppercase tracking-wider text-center">Status</th>
              <th class="px-6 py-4 text-xs font-semibold text-neutral uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-white/[0.02] transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon class="w-5 h-5 text-neutral" />
                  </div>
                  <div>
                    <div class="font-medium text-white group-hover:text-primary transition-colors">{{ user.name }}</div>
                    <div class="text-xs text-neutral flex items-center gap-1">
                      <Mail class="w-3 h-3" />
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <ShieldCheck v-if="user.role === 'ADMIN'" class="w-4 h-4 text-primary" />
                  <Shield v-else class="w-4 h-4 text-neutral" />
                  <span 
                    class="text-xs font-medium"
                    :class="user.role === 'ADMIN' ? 'text-white' : 'text-neutral'"
                  >
                    {{ user.role }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <button 
                  @click="toggleUserStatus(user)"
                  class="inline-flex items-center gap-2 transition-all"
                  :class="user.isActive ? 'text-green-400' : 'text-neutral'"
                >
                  <ToggleRight v-if="user.isActive" class="w-6 h-6" />
                  <ToggleLeft v-else class="w-6 h-6" />
                  <span class="text-xs font-medium">{{ user.isActive ? 'Ativo' : 'Inativo' }}</span>
                </button>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openEditModal(user)" class="p-2 text-neutral hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button @click="handleDelete(user.id)" class="p-2 text-neutral hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- User Modal -->
    <BaseModal 
      :show="isModalOpen" 
      :title="isEditing ? 'Editar Usuário' : 'Novo Usuário'" 
      @close="isModalOpen = false"
    >
      <div class="space-y-6">
        <BaseInput 
          v-model="currentUser.name" 
          label="Nome Completo" 
          placeholder="Ex: João Silva" 
          required
        />
        
        <BaseInput 
          v-model="currentUser.email" 
          type="email"
          label="Email" 
          placeholder="joao@exemplo.com" 
          required
        />

        <div class="space-y-2">
          <label class="text-sm font-medium text-neutral mb-2 block">Nível de Acesso</label>
          <div class="grid grid-cols-2 gap-4">
            <button 
              type="button"
              @click="currentUser.role = 'USER'"
              class="px-4 py-3 rounded-xl border transition-all text-sm font-medium flex flex-col items-center gap-2"
              :class="currentUser.role === 'USER' ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-white/10 text-neutral hover:bg-white/5'"
            >
              <Shield class="w-5 h-5" />
              Usuário (Básico)
            </button>
            <button 
              type="button"
              @click="currentUser.role = 'ADMIN'"
              class="px-4 py-3 rounded-xl border transition-all text-sm font-medium flex flex-col items-center gap-2"
              :class="currentUser.role === 'ADMIN' ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-white/10 text-neutral hover:bg-white/5'"
            >
              <ShieldCheck class="w-5 h-5" />
              Administrador
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div>
            <div class="text-sm font-medium text-white">Usuário Ativo</div>
            <div class="text-xs text-neutral">Define se o usuário pode acessar o sistema</div>
          </div>
          <button 
            type="button"
            @click="currentUser.isActive = !currentUser.isActive"
            class="transition-all"
            :class="currentUser.isActive ? 'text-primary' : 'text-neutral'"
          >
            <ToggleRight v-if="currentUser.isActive" class="w-8 h-8" />
            <ToggleLeft v-else class="w-8 h-8" />
          </button>
        </div>

        <div class="flex gap-3 pt-4">
          <button 
            @click="isModalOpen = false"
            class="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-medium border border-white/5"
          >
            Cancelar
          </button>
          <button 
            @click="handleSave"
            class="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl transition-all font-medium shadow-lg shadow-primary/20"
          >
            {{ isEditing ? 'Salvar Alterações' : 'Criar Usuário' }}
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>
