<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Truck,
  Building2,
  Phone,
  AlertCircle,
  Hash
} from 'lucide-vue-next';
import { SupplierRepository } from '@/repositories/SupplierRepository';
import type { Supplier } from '@/types';
import { useToast } from 'vue-toastification';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseInput from '@/components/ui/BaseInput.vue';

const toast = useToast();
const suppliers = ref<Supplier[]>([]);
const isLoading = ref(true);
const searchQuery = ref('');
const isModalOpen = ref(false);
const isEditing = ref(false);
const currentSupplier = ref<Partial<Supplier>>({
  name: '',
  taxId: '',
  contactInfo: ''
});

const fetchSuppliers = async () => {
  isLoading.value = true;
  try {
    suppliers.value = await SupplierRepository.list();
  } catch (error) {
    toast.error('Erro ao carregar fornecedores');
  } finally {
    isLoading.value = false;
  }
};

const filteredSuppliers = computed(() => {
  return suppliers.value.filter(s => 
    s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (s.taxId && s.taxId.includes(searchQuery.value))
  );
});

const openCreateModal = () => {
  isEditing.value = false;
  currentSupplier.value = {
    name: '',
    taxId: '',
    contactInfo: ''
  };
  isModalOpen.value = true;
};

const openEditModal = (supplier: Supplier) => {
  isEditing.value = true;
  currentSupplier.value = { ...supplier };
  isModalOpen.value = true;
};

const handleSave = async () => {
  try {
    if (isEditing.value && currentSupplier.value.id) {
      await SupplierRepository.update(currentSupplier.value.id, currentSupplier.value);
      toast.success('Fornecedor atualizado com sucesso');
    } else {
      await SupplierRepository.create(currentSupplier.value);
      toast.success('Fornecedor criado com sucesso');
    }
    isModalOpen.value = false;
    fetchSuppliers();
  } catch (error) {
    toast.error('Erro ao salvar fornecedor');
  }
};

const handleDelete = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
    try {
      await SupplierRepository.delete(id);
      toast.success('Fornecedor excluído');
      fetchSuppliers();
    } catch (error) {
      toast.error('Erro ao excluir fornecedor');
    }
  }
};

onMounted(fetchSuppliers);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">Gestão de Fornecedores</h1>
        <p class="text-neutral mt-1">Cadastre e gerencie sua rede de fornecedores.</p>
      </div>
      <button 
        @click="openCreateModal"
        class="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 font-medium"
      >
        <Plus class="w-5 h-5" />
        Novo Fornecedor
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface p-4 rounded-2xl border border-white/5 shadow-sm">
      <div class="md:col-span-4 relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral w-5 h-5" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Buscar por nome ou CNPJ/CPF..."
          class="w-full bg-background border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-neutral focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        >
      </div>
    </div>

    <!-- Suppliers Table -->
    <div class="bg-surface rounded-2xl border border-white/5 overflow-hidden shadow-sm">
      <div v-if="isLoading" class="p-12 flex flex-col items-center justify-center gap-4">
        <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="text-neutral animate-pulse">Carregando fornecedores...</p>
      </div>

      <div v-else-if="filteredSuppliers.length === 0" class="p-12 flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <AlertCircle class="w-8 h-8 text-neutral" />
        </div>
        <h3 class="text-lg font-medium text-white">Nenhum fornecedor encontrado</h3>
        <p class="text-neutral mt-1">Tente ajustar sua busca ou adicione um novo.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-white/5 bg-white/5">
              <th class="px-6 py-4 text-xs font-semibold text-neutral uppercase tracking-wider">Fornecedor</th>
              <th class="px-6 py-4 text-xs font-semibold text-neutral uppercase tracking-wider">CNPJ / CPF</th>
              <th class="px-6 py-4 text-xs font-semibold text-neutral uppercase tracking-wider">Contato</th>
              <th class="px-6 py-4 text-xs font-semibold text-neutral uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="supplier in filteredSuppliers" :key="supplier.id" class="hover:bg-white/[0.02] transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 class="w-5 h-5 text-neutral" />
                  </div>
                  <div class="font-medium text-white group-hover:text-primary transition-colors">{{ supplier.name }}</div>
                </div>
              </td>
              <td class="px-6 py-4 text-neutral font-mono text-xs">
                {{ supplier.taxId || '---' }}
              </td>
              <td class="px-6 py-4">
                <div v-if="supplier.contactInfo" class="text-neutral text-sm flex items-center gap-2">
                  <Phone class="w-3.5 h-3.5" />
                  {{ supplier.contactInfo }}
                </div>
                <div v-else class="text-neutral text-sm italic">Não informado</div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openEditModal(supplier)" class="p-2 text-neutral hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button @click="handleDelete(supplier.id)" class="p-2 text-neutral hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Supplier Modal -->
    <BaseModal 
      :show="isModalOpen" 
      :title="isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'" 
      @close="isModalOpen = false"
    >
      <div class="space-y-6">
        <BaseInput 
          v-model="currentSupplier.name" 
          label="Nome do Fornecedor / Razão Social" 
          placeholder="Ex: Logística Brasil LTDA" 
          required
        />
        
        <BaseInput 
          v-model="currentSupplier.taxId" 
          label="CNPJ / CPF" 
          placeholder="00.000.000/0000-00"
        />

        <BaseInput 
          v-model="currentSupplier.contactInfo" 
          label="Informações de Contato (Tel/Email)" 
          placeholder="(11) 99999-9999 ou contato@loja.com"
        />

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
            {{ isEditing ? 'Atualizar' : 'Cadastrar' }}
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>
