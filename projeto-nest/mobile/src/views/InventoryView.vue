<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Estoque Atual</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="fetchInventory">
            <ion-icon :icon="refreshOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding auth-background">
      <ion-searchbar 
        v-model="searchQuery" 
        placeholder="Buscar por nome ou SKU"
        class="custom-search"
      ></ion-searchbar>
      
      <div v-if="inventoryStore.loading" class="ion-text-center ion-padding">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p class="text-neutral">Sincronizando estoque...</p>
      </div>

      <div v-else-if="filteredItems.length === 0" class="ion-text-center ion-padding">
        <p class="text-neutral">Nenhum produto encontrado.</p>
      </div>

      <!-- Tabela com Scroll Lateral e Coluna Fixa -->
      <div v-else class="table-container">
        <div class="table-wrapper">
          <table class="inventory-table">
            <thead>
              <tr>
                <th class="sticky-col">Produto</th>
                <th>SKU</th>
                <th>Qtd</th>
                <th>Custo</th>
                <th>ML</th>
                <th>Venda</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredItems" :key="item.id">
                <td class="sticky-col font-bold">{{ item.name }}</td>
                <td><code class="sku-code">{{ item.sku }}</code></td>
                <td>
                  <span :class="item.quantity > 5 ? 'text-green' : 'text-danger'">
                    {{ item.quantity }}
                  </span>
                </td>
                <td>{{ formatPrice(item.purchasePrice) }}</td>
                <td class="text-primary font-bold">{{ formatPrice(item.mlSellingPrice) }}</td>
                <td>{{ formatPrice(item.directSellingPrice) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonBackButton, IonSearchbar, IonSpinner, IonButton, IonIcon
} from '@ionic/vue';
import { refreshOutline } from 'ionicons/icons';
import { useInventoryStore } from '../stores/inventory';
import { onIonViewWillEnter } from '@ionic/vue';

const inventoryStore = useInventoryStore();
const searchQuery = ref('');

const fetchInventory = async () => {
  await inventoryStore.fetchItems();
};

const filteredItems = computed(() => {
  return inventoryStore.items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const formatPrice = (value: number) => {
  return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

onIonViewWillEnter(() => {
  fetchInventory();
});
</script>

<style scoped>
.auth-background {
  --background: var(--ion-background-color);
}

.text-neutral {
  color: var(--ion-color-medium);
}

.text-green {
  color: var(--ion-color-success);
}

.text-danger {
  color: var(--ion-color-danger);
}

.text-primary {
  color: var(--ion-color-primary);
}

.custom-search {
  --background: var(--ion-card-background);
  --color: white;
  --placeholder-color: var(--ion-color-medium);
  --icon-color: var(--ion-color-medium);
  border-radius: 12px;
  margin-bottom: 16px;
}

/* Container de scroll */
.table-container {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--ion-color-step-300);
  background: var(--ion-card-background);
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}

.inventory-table th {
  background: var(--ion-color-step-300);
  color: var(--ion-color-medium);
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 700;
  padding: 12px 15px;
  text-align: left;
}

.inventory-table td {
  padding: 14px 15px;
  font-size: 13px;
  color: white;
  border-bottom: 1px solid var(--ion-color-step-300);
}

.sku-code {
  background: var(--ion-background-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 11px;
}

/* Coluna Fixa (Sticky) */
.sticky-col {
  position: sticky;
  left: 0;
  z-index: 2;
  background: var(--ion-card-background); /* Mesma cor do fundo da linha */
  box-shadow: 2px 0 5px rgba(0,0,0,0.2);
  min-width: 140px;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Cabeçalho da coluna fixa precisa de z-index maior */
thead th.sticky-col {
  z-index: 3;
  background: var(--ion-color-step-300);
}
</style>
