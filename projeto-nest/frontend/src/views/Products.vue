<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Package,
  AlertCircle
} from 'lucide-vue-next';
import { ProductRepository } from '@/repositories/ProductRepository';
import type { Product } from '@/types';
import { useToast } from 'vue-toastification';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseConfirmModal from '@/components/ui/BaseConfirmModal.vue';
import { SupplierRepository } from '@/repositories/SupplierRepository';
import type { Supplier } from '@/types';

const toast = useToast();
const products = ref<Product[]>([]);
const suppliers = ref<Supplier[]>([]);
const searchQuery = ref('');
const isLoading = ref(true);
const isModalOpen = ref(false);
const isEditing = ref(false);
const isConfirmOpen = ref(false);
const productToDelete = ref<string | null>(null);
const currentProduct = ref<Partial<Product>>({
  name: '',
  sku: '',
  slug: '',
  quantity: 0,
  purchasePrice: 0,
  mlSellingPrice: 0,
  directSellingPrice: 0,
  isListedOnML: false
});

const fetchProducts = async () => {
  isLoading.value = true;
  try {
    const [productsData, suppliersData] = await Promise.all([
      ProductRepository.list(),
      SupplierRepository.list()
    ]);
    products.value = productsData;
    suppliers.value = suppliersData;
  } catch (error: any) {
    toast.error('Erro ao carregar dados');
  } finally {
    isLoading.value = false;
  }
};

const filteredProducts = computed(() => {
  return products.value.filter(p => 
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const openCreateModal = () => {
  isEditing.value = false;
  currentProduct.value = {
    name: '',
    sku: '',
    slug: '',
    quantity: 0,
    purchasePrice: 0,
    mlSellingPrice: 0,
    directSellingPrice: 0,
    isListedOnML: false
  };
  isModalOpen.value = true;
};

const openEditModal = (product: Product) => {
  isEditing.value = true;
  currentProduct.value = { ...product };
  isModalOpen.value = true;
};

const handleSave = async () => {
  try {
    // Criar um payload limpo apenas com os campos que o DTO espera
    const payload: any = {
      name: currentProduct.value.name,
      sku: currentProduct.value.sku,
      slug: currentProduct.value.slug,
      quantity: Number(currentProduct.value.quantity),
      purchasePrice: Number(currentProduct.value.purchasePrice),
      mlSellingPrice: Number(currentProduct.value.mlSellingPrice),
      directSellingPrice: Number(currentProduct.value.directSellingPrice),
      isListedOnML: !!currentProduct.value.isListedOnML,
      supplierId: currentProduct.value.supplierId || null,
      // Garantir que imagens sejam APENAS strings (URLs)
      images: (currentProduct.value.images || [])
        .map((img: any) => typeof img === 'string' ? img : img.url)
        .filter((url: string) => typeof url === 'string' && url.trim() !== '')
    };

    console.log('Enviando Payload Web:', payload);

    if (isEditing.value && currentProduct.value.id) {
      await ProductRepository.update(currentProduct.value.id, payload);
      toast.success('Produto atualizado com sucesso');
    } else {
      await ProductRepository.create(payload);
      toast.success('Produto criado com sucesso');
    }
    isModalOpen.value = false;
    fetchProducts();
  } catch (error: any) {
    console.error('Erro ao salvar:', error.response?.data);
    const errorMsg = error.response?.data?.message;
    toast.error(Array.isArray(errorMsg) ? errorMsg[0] : (errorMsg || 'Erro ao salvar produto'));
  }
};

const confirmDelete = (id: string) => {
  productToDelete.value = id;
  isConfirmOpen.value = true;
};

const handleDelete = async () => {
  if (!productToDelete.value) return;

  try {
    await ProductRepository.delete(productToDelete.value);
    toast.success('Produto excluído');
    fetchProducts();
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Erro ao excluir produto');
  } finally {
    isConfirmOpen.value = false;
    productToDelete.value = null;
  }
};

onMounted(fetchProducts);

// Auto-slug logic
const generateSlug = () => {
  if (!isEditing.value && currentProduct.value.name) {
    currentProduct.value.slug = currentProduct.value.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">Catálogo de Produtos</h1>
        <p class="text-neutral mt-1">Gerencie seu estoque e anúncios do Mercado Livre.</p>
      </div>
      <button 
        @click="openCreateModal"
        class="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 font-medium"
      >
        <Plus class="w-5 h-5" />
        Novo Produto
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface p-4 rounded-2xl border border-white/5 shadow-sm">
      <div class="md:col-span-2 relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral w-5 h-5" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Buscar por nome ou SKU..."
          class="w-full bg-background border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-neutral focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        >
      </div>
      <div class="flex gap-2">
        <button class="flex-1 flex items-center justify-center gap-2 bg-background border border-white/10 text-neutral py-2.5 rounded-xl hover:bg-white/5 transition-all">
          <Filter class="w-4 h-4" />
          Filtros
        </button>
      </div>
    </div>

    <!-- Products Table -->
    <div class="bg-surface rounded-2xl border border-white/5 overflow-hidden shadow-sm">
      <div v-if="isLoading" class="p-12 flex flex-col items-center justify-center gap-4">
        <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="text-neutral animate-pulse">Carregando catálogo...</p>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="p-12 flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <AlertCircle class="w-8 h-8 text-neutral" />
        </div>
        <h3 class="text-lg font-medium text-white">Nenhum produto encontrado</h3>
        <p class="text-neutral mt-1 max-w-xs">Tente ajustar seus filtros ou adicione um novo produto ao catálogo.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-white/5 bg-white/5">
              <th class="px-6 py-4 text-xs font-semibold text-neutral uppercase tracking-wider">Produto</th>
              <th class="px-6 py-4 text-xs font-semibold text-neutral uppercase tracking-wider text-center">Estoque</th>
              <th class="px-6 py-4 text-xs font-semibold text-neutral uppercase tracking-wider">Custo</th>
              <th class="px-6 py-4 text-xs font-semibold text-neutral uppercase tracking-wider">Preço ML</th>
              <th class="px-6 py-4 text-xs font-semibold text-neutral uppercase tracking-wider">Venda Direta</th>
              <th class="px-6 py-4 text-xs font-semibold text-neutral uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-xs font-semibold text-neutral uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-white/[0.02] transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package v-if="!product.images?.length" class="w-5 h-5 text-neutral" />
                    <img v-else :src="product.images[0].url" class="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div>
                    <div class="font-medium text-white group-hover:text-primary transition-colors">{{ product.name }}</div>
                    <div class="flex items-center gap-2 mt-0.5">
                      <code class="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-neutral border border-white/10">{{ product.sku }}</code>
                      <span class="text-[10px] text-neutral/40">|</span>
                      <span class="text-[10px] text-neutral italic">{{ product.slug }}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="[
                    product.quantity > 5 ? 'bg-green-500/10 text-green-400' : 
                    product.quantity > 0 ? 'bg-yellow-500/10 text-yellow-400' : 
                    'bg-red-500/10 text-red-400'
                  ]"
                >
                  {{ product.quantity }} un
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-neutral text-sm">R$ {{ product.purchasePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col">
                  <div class="text-primary font-bold">R$ {{ product.mlSellingPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</div>
                  <div class="text-[10px] text-primary/60 font-medium mt-1">
                    Margem: {{ ((product.mlSellingPrice - product.purchasePrice) / product.mlSellingPrice * 100).toFixed(1) }}%
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="text-white font-medium">R$ {{ product.directSellingPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</div>
                <div class="text-[10px] text-green-400/60 font-medium mt-1">
                  Margem: {{ ((product.directSellingPrice - product.purchasePrice) / product.directSellingPrice * 100).toFixed(1) }}%
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all"
                  :class="product.isListedOnML ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-neutral/10 text-neutral border border-white/10'"
                >
                  <div v-if="product.isListedOnML" class="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                  {{ product.isListedOnML ? 'Listado' : 'Não Listado' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openEditModal(product)" class="p-2 text-neutral hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button @click="confirmDelete(product.id)" class="p-2 text-neutral hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Product Modal -->
    <BaseModal 
      :show="isModalOpen" 
      :title="isEditing ? 'Editar Produto' : 'Novo Produto'" 
      @close="isModalOpen = false"
    >
      <div class="space-y-6">
        <BaseInput 
          v-model="currentProduct.name" 
          label="Nome do Produto" 
          placeholder="Ex: iPhone 15 Pro Max 256GB" 
          required
          @input="generateSlug"
        />
        
        <div class="grid grid-cols-2 gap-4">
          <BaseInput 
            v-model="currentProduct.sku" 
            label="SKU" 
            placeholder="IPH15PM-256-BLK" 
            required
          />
          <BaseInput 
            v-model="currentProduct.slug" 
            label="Slug" 
            placeholder="iphone-15-pro-max" 
            required
          />
        </div>

        <div class="flex items-center gap-3 bg-white/10 p-4 rounded-xl border border-primary/20">
          <input 
            id="mlListed"
            v-model="currentProduct.isListedOnML" 
            type="checkbox" 
            class="w-5 h-5 accent-primary bg-background border-white/20 rounded focus:ring-primary/50"
          />
          <div class="flex-1">
            <label for="mlListed" class="text-sm text-white font-medium cursor-pointer block">
              Listar no Mercado Livre
            </label>
            <span class="text-[10px] text-neutral">Ative para exibir este produto no seu catálogo do ML.</span>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-neutral">Fornecedor</label>
          <select 
            v-model="currentProduct.supplierId"
            class="w-full bg-background border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
          >
            <option :value="undefined" class="bg-surface">Selecionar Fornecedor...</option>
            <option 
              v-for="supplier in suppliers" 
              :key="supplier.id" 
              :value="supplier.id"
              class="bg-surface"
            >
              {{ supplier.name }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <BaseInput 
            v-model.number="currentProduct.quantity" 
            type="number" 
            label="Quantidade" 
            required
          />
          <BaseInput 
            v-model.number="currentProduct.purchasePrice" 
            type="number" 
            label="Preço Custo" 
            placeholder="0,00"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <BaseInput 
            v-model.number="currentProduct.mlSellingPrice" 
            type="number" 
            label="Preço ML" 
            placeholder="0,00"
          />
          <BaseInput 
            v-model.number="currentProduct.directSellingPrice" 
            type="number" 
            label="Venda Direta" 
            placeholder="0,00"
          />
        </div>

        <div v-if="isEditing" class="grid grid-cols-2 gap-4 p-3 bg-white/5 rounded-xl border border-white/10 text-[10px] text-neutral">
          <div>
            <span class="block font-semibold uppercase opacity-50 mb-1">Criado por</span>
            <span class="text-white">{{ currentProduct.createdBy || 'Sistema' }}</span>
          </div>
          <div>
            <span class="block font-semibold uppercase opacity-50 mb-1">Última edição</span>
            <span class="text-white">{{ currentProduct.updatedBy || '---' }}</span>
          </div>
        </div>

        <div class="space-y-4">
          <label class="text-sm font-medium text-neutral">Imagens do Produto (URLs)</label>
          <div v-for="(img, index) in currentProduct.images" :key="index" class="flex gap-2">
            <BaseInput 
              v-model="img.url" 
              placeholder="https://exemplo.com/imagem.jpg" 
              class="flex-1"
            />
            <button @click="currentProduct.images?.splice(index, 1)" class="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
          <button 
            @click="currentProduct.images = [...(currentProduct.images || []), { id: '', url: '', index: (currentProduct.images?.length || 0) }]"
            class="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
          >
            <Plus class="w-4 h-4" />
            Adicionar Imagem
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
            {{ isEditing ? 'Atualizar' : 'Cadastrar' }}
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- Confirm Delete Modal -->
    <BaseConfirmModal
      :show="isConfirmOpen"
      title="Excluir Produto"
      message="Tem certeza que deseja excluir este produto do catálogo? Esta ação removerá o item do estoque permanentemente."
      @confirm="handleDelete"
      @cancel="isConfirmOpen = false"
    />
  </div>
</template>
