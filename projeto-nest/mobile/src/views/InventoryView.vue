<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Estoque Atual</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-searchbar placeholder="Buscar por nome ou SKU"></ion-searchbar>
      
      <ion-list>
        <ion-item v-for="item in inventoryStore.items" :key="item.id">
          <ion-label>
            <h2>{{ item.name }}</h2>
            <p>SKU: {{ item.sku }}</p>
          </ion-label>
          <ion-badge slot="end" :color="item.quantity > 0 ? 'success' : 'danger'">
            {{ item.quantity }}
          </ion-badge>
        </ion-item>
      </ion-list>

      <div v-if="inventoryStore.items.length === 0" class="ion-text-center ion-padding">
        <p>Carregando estoque...</p>
        <ion-spinner></ion-spinner>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonBadge, IonButtons, IonBackButton,
  IonSearchbar, IonSpinner
} from '@ionic/vue';
import { useInventoryStore } from '../stores/inventory';
import { onMounted } from 'vue';

const inventoryStore = useInventoryStore();

onMounted(() => {
  // Mock data for demonstration
  if (inventoryStore.items.length === 0) {
    inventoryStore.items = [
      { id: '1', name: 'Notebook Pro 14', sku: 'NB-14-P', quantity: 15 },
      { id: '2', name: 'Mouse Wireless', sku: 'MS-WL-01', quantity: 50 },
      { id: '3', name: 'Monitor 27"', sku: 'MN-27-K', quantity: 8 },
      { id: '4', name: 'Teclado Mecânico', sku: 'KB-MC-RGB', quantity: 0 },
    ];
  }
});
</script>
