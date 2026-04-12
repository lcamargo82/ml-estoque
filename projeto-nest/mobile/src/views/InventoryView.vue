<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Catálogo de Produtos</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="fetchInventory">
            <ion-icon :icon="refreshOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding auth-background">
      <!-- Filtros e Busca -->
      <div class="search-section">
        <ion-searchbar 
          v-model="searchQuery" 
          placeholder="Buscar por nome ou SKU"
          class="custom-search"
        ></ion-searchbar>
        <div class="filter-chips">
          <ion-chip outline color="primary">Todos</ion-chip>
          <ion-chip outline>Em Estoque</ion-chip>
          <ion-chip outline>Sem Estoque</ion-chip>
        </div>
      </div>
      
      <div v-if="inventoryStore.loading" class="ion-text-center ion-padding">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p class="text-neutral">Sincronizando catálogo...</p>
      </div>

      <div v-else-if="filteredItems.length === 0" class="ion-text-center ion-padding">
        <p class="text-neutral">Nenhum produto encontrado.</p>
      </div>

      <!-- Lista Densa Premium -->
      <div v-else class="inventory-list">
        <ion-list lines="none" class="bg-transparent">
          <ion-item 
            v-for="item in filteredItems" 
            :key="item.id" 
            button 
            @click="openDetails(item)"
            class="product-item"
          >
            <ion-thumbnail slot="start" class="product-thumb">
              <img :src="getImageUrl(item.images?.[0])" />
            </ion-thumbnail>
            <ion-label>
              <h2 class="font-bold text-white">{{ item.name }}</h2>
              <p class="text-neutral text-xs">SKU: {{ item.sku }}</p>
            </ion-label>
            <ion-badge slot="end" :color="getQtyColor(item.quantity)" class="qty-badge">
              {{ item.quantity }} un
            </ion-badge>
          </ion-item>
        </ion-list>
      </div>

      <!-- Botão Flutuante para Adicionar -->
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="router.push('/products/add')">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <!-- Modal de Detalhes (Peek-to-Detail) -->
      <ion-modal 
        :is-open="isModalOpen" 
        @didDismiss="isModalOpen = false"
        :initial-breakpoint="0.5"
        :breakpoints="[0, 0.5, 0.9]"
        handle-behavior="cycle"
        class="detail-modal"
      >
        <ion-content v-if="selectedItem" class="ion-padding modal-bg">
          <div class="modal-header">
            <h2 class="text-2xl font-bold">{{ selectedItem.name }}</h2>
            <ion-badge :color="selectedItem.isListedOnML ? 'success' : 'medium'">
              {{ selectedItem.isListedOnML ? 'Listado no ML' : 'Não Listado' }}
            </ion-badge>
          </div>

          <!-- Fotos Section -->
          <div class="photo-scroll ion-margin-top">
            <div class="photo-card" v-for="(img, index) in selectedItem.images" :key="index">
              <img :src="getImageUrl(img)" />
            </div>
            <div v-if="!selectedItem.images || selectedItem.images.length === 0" class="empty-photo">
              <ion-icon :icon="cameraOutline"></ion-icon>
              <p>Nenhuma foto anexada</p>
            </div>
          </div>

          <!-- Preços em Cards -->
          <div class="price-grid ion-margin-top">
            <div class="price-card">
              <p class="label">CUSTO</p>
              <p class="value">{{ formatPrice(selectedItem.purchasePrice) }}</p>
            </div>
            <div class="price-card highlight">
              <p class="label">PREÇO ML</p>
              <p class="value">{{ formatPrice(selectedItem.mlSellingPrice) }}</p>
              <p class="margin">Margem: <span class="text-green">+{{ calculateMargin(selectedItem.purchasePrice, selectedItem.mlSellingPrice) }}%</span></p>
            </div>
            <div class="price-card">
              <p class="label">DIRETA</p>
              <p class="value">{{ formatPrice(selectedItem.directSellingPrice) }}</p>
            </div>
          </div>

          <div class="actions-section ion-margin-top">
            <ion-button expand="block" mode="ios">Editar Produto</ion-button>
            <ion-button expand="block" fill="clear" color="medium">Compartilhar Detalhes</ion-button>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonMenuButton, IonSearchbar, IonSpinner, IonButton, IonIcon,
  IonFab, IonFabButton, onIonViewWillEnter, IonList, IonItem, IonThumbnail,
  IonLabel, IonBadge, IonChip, IonModal
} from '@ionic/vue';
import { refreshOutline, addOutline, cameraOutline } from 'ionicons/icons';
import { useInventoryStore } from '../stores/inventory';
import { useRouter } from 'vue-router';
import { getImageUrl } from '../utils/url';

const inventoryStore = useInventoryStore();
const router = useRouter();
const searchQuery = ref('');
const isModalOpen = ref(false);
const selectedItem = ref<any>(null);

const fetchInventory = async () => {
  await inventoryStore.fetchItems();
};

const filteredItems = computed(() => {
  return inventoryStore.items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const openDetails = (item: any) => {
  selectedItem.value = item;
  isModalOpen.value = true;
};

const getQtyColor = (qty: number) => {
  if (qty <= 0) return 'danger';
  if (qty <= 5) return 'warning';
  return 'success';
};

const formatPrice = (value: number) => {
  return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const calculateMargin = (cost: number, sell: number) => {
  if (!cost || !sell) return 0;
  return (((sell - cost) / cost) * 100).toFixed(1);
};

onIonViewWillEnter(() => {
  fetchInventory();
});
</script>

<style scoped>
.auth-background {
  --background: var(--ion-background-color);
}

.search-section {
  margin-bottom: 20px;
}

.custom-search {
  --background: var(--ion-card-background);
  --color: white;
  --placeholder-color: var(--ion-color-medium);
  --icon-color: var(--ion-color-medium);
  border-radius: 12px;
  margin-bottom: 8px;
}

.filter-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.filter-chips ion-chip {
  --background: rgba(255, 255, 255, 0.05);
  font-size: 11px;
}

/* Lista Densa */
.product-item {
  --background: var(--ion-card-background);
  --border-radius: 12px;
  --margin-bottom: 10px;
  margin-bottom: 10px;
  --padding-start: 12px;
  --padding-end: 12px;
}

.product-thumb {
  --border-radius: 8px;
  width: 48px;
  height: 48px;
}

.qty-badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 6px;
}

/* Modal de Detalhes */
.detail-modal {
  --background: var(--ion-card-background);
  --border-radius: 20px 20px 0 0;
}

.modal-bg {
  --background: var(--ion-card-background);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.photo-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.photo-card {
  min-width: 140px;
  height: 140px;
  background: var(--ion-background-color);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.empty-photo {
  width: 100%;
  height: 120px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--ion-color-medium);
}

.price-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.price-card {
  background: var(--ion-background-color);
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.price-card.highlight {
  grid-column: span 2;
  border-left: 4px solid var(--ion-color-primary);
  background: linear-gradient(90deg, rgba(169, 81, 198, 0.05) 0%, transparent 100%);
}

.price-card .label {
  font-size: 10px;
  letter-spacing: 1px;
  color: var(--ion-color-medium);
  margin-bottom: 4px;
}

.price-card .value {
  font-size: 1.4rem;
  font-weight: 700;
  color: white;
}

.price-card .margin {
  font-size: 11px;
  margin-top: 4px;
}

.text-green {
  color: var(--ion-color-success);
}
</style>
