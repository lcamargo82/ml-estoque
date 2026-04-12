<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Dashboard</ion-title>
        <ion-buttons slot="end">
          <div class="user-badge">
            <ion-avatar>
              <img src="https://ionicframework.com/docs/img/demos/avatar.svg" />
            </ion-avatar>
          </div>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding background-dark">
      <div class="welcome-section">
        <h1 class="text-white font-bold">Olá, Operador</h1>
        <p class="text-neutral">Acompanhe seu inventário em tempo real.</p>
      </div>

      <!-- Métricas (Inspirado na Versão Web) -->
      <div class="metrics-container">
        <div class="metrics-scroll">
          <div class="metric-card gold-border">
            <h3 class="metric-label">TOTAL PRODUTOS</h3>
            <p class="metric-value">{{ inventoryStore.items.length }}</p>
          </div>
          <div class="metric-card purple-border">
            <h3 class="metric-label">VALOR ESTOQUE</h3>
            <p class="metric-value">{{ formatPrice(totalStockValue) }}</p>
          </div>
          <div class="metric-card secondary-border">
            <h3 class="metric-label">BAIXO ESTOQUE</h3>
            <p class="metric-value text-danger">{{ lowStockCount }}</p>
          </div>
        </div>
      </div>

      <!-- Ações Principais -->
      <div class="section-title">Ações Rápidas</div>
      <ion-grid class="ion-no-padding">
        <ion-row>
          <ion-col size="6">
            <div class="action-card" @click="router.push('/scanner')">
              <div class="icon-container glass-effect">
                <ion-icon :icon="scanOutline"></ion-icon>
              </div>
              <p>Leitor QR</p>
            </div>
          </ion-col>
          <ion-col size="6">
            <div class="action-card" @click="router.push('/movement')">
              <div class="icon-container glass-effect">
                <ion-icon :icon="swapVerticalOutline"></ion-icon>
              </div>
              <p>Movimentar</p>
            </div>
          </ion-col>
          <ion-col size="12">
            <div class="action-card full-width" @click="router.push('/inventory')">
              <div class="icon-container glass-effect">
                <ion-icon :icon="listOutline"></ion-icon>
              </div>
              <p>Ver Catálogo de Estoque</p>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Movimentações Pendentes (Sincronização) -->
      <div v-if="inventoryStore.movementsQueue.length > 0" class="sync-banner ion-margin-top" @click="syncItems">
        <div class="banner-content">
          <ion-icon :icon="cloudUploadOutline" class="pulse-icon"></ion-icon>
          <div class="banner-text">
            <h4>{{ inventoryStore.movementsQueue.length }} movimentações pendentes</h4>
            <p>Toque para sincronizar com a nuvem</p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonIcon, IonAvatar,
  IonButtons, IonMenuButton, toastController
} from '@ionic/vue';
import { 
  scanOutline, swapVerticalOutline, listOutline, cloudUploadOutline 
} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useInventoryStore } from '../stores/inventory';
import { computed } from 'vue';

const router = useRouter();
const inventoryStore = useInventoryStore();

// Calcular valor total do estoque
const totalStockValue = computed(() => {
  return inventoryStore.items.reduce((acc, item) => acc + (item.purchasePrice * item.quantity), 0);
});

// Contar itens com baixo estoque (< 5)
const lowStockCount = computed(() => {
  return inventoryStore.items.filter(item => item.quantity < 5).length;
});

const formatPrice = (value: number) => {
  return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
};

const syncItems = async () => {
  const toast = await toastController.create({
    message: 'Sincronizando dados...',
    duration: 1500,
    color: 'primary',
    position: 'bottom'
  });
  await toast.present();
  // Simular sync
  await inventoryStore.loadState();
};

// Carregar estado ao iniciar
inventoryStore.loadState();
</script>

<style scoped>
.background-dark {
  --background: var(--ion-background-color);
}

.welcome-section {
  padding: 10px 4px 20px 4px;
}

.welcome-section h1 {
  font-size: 1.8rem;
  margin: 0;
}

.user-badge ion-avatar {
  width: 32px;
  height: 32px;
  border: 2px solid var(--ion-color-primary);
}

/* Métricas */
.metrics-container {
  margin: 0 -16px 24px -16px;
}

.metrics-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 16px 12px 16px;
  scrollbar-width: none;
}

.metric-card {
  min-width: 160px;
  background: var(--ion-card-background);
  padding: 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.metric-card.gold-border { border-left: 4px solid var(--ion-color-tertiary); }
.metric-card.purple-border { border-left: 4px solid var(--ion-color-primary); }
.metric-card.secondary-border { border-left: 4px solid var(--ion-color-secondary); }

.metric-label {
  font-size: 9px;
  letter-spacing: 1px;
  color: var(--ion-color-medium);
  margin-bottom: 8px;
  font-weight: 700;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: white;
}

.text-danger { color: var(--ion-color-danger); }

/* Ações Rápidas */
.section-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--ion-color-medium);
  letter-spacing: 1.5px;
  font-weight: 700;
  margin-bottom: 12px;
  padding-left: 4px;
}

.action-card {
  background: var(--ion-card-background);
  margin: 6px;
  padding: 20px 10px;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.action-card.full-width {
  flex-direction: row;
  padding: 16px 24px;
  justify-content: flex-start;
  gap: 20px;
}

.action-card:active {
  transform: scale(0.96);
  background: rgba(255, 255, 255, 0.05);
}

.icon-container {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glass-effect {
  background: rgba(169, 81, 198, 0.1);
  border: 1px solid rgba(169, 81, 198, 0.2);
}

.icon-container ion-icon {
  font-size: 24px;
  color: var(--ion-color-primary);
}

.action-card p {
  margin: 0;
  font-weight: 600;
  font-size: 0.9rem;
  color: white;
}

/* Sync Banner */
.sync-banner {
  background: linear-gradient(90deg, var(--ion-color-secondary) 0%, var(--ion-color-primary) 100%);
  border-radius: 20px;
  padding: 16px 20px;
  box-shadow: 0 8px 16px rgba(169, 81, 198, 0.2);
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pulse-icon {
  font-size: 32px;
  color: white;
  animation: pulse 2s infinite;
}

.banner-text h4 {
  margin: 0;
  color: white;
  font-size: 1rem;
  font-weight: 700;
}

.banner-text p {
  margin: 2px 0 0 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
