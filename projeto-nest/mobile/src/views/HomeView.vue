<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>ML Estoque</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <div class="welcome-section">
        <h1>Bem-vindo, Operador</h1>
        <p>Gerencie o estoque com precisão.</p>
      </div>

      <ion-grid>
        <ion-row>
          <ion-col size="6">
            <ion-card @click="router.push('/scanner')">
              <ion-card-content class="ion-text-center">
                <ion-icon :icon="scanOutline" size="large"></ion-icon>
                <p>Leitor</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col size="6">
            <ion-card @click="router.push('/movement')">
              <ion-card-content class="ion-text-center">
                <ion-icon :icon="swapVerticalOutline" size="large"></ion-icon>
                <p>Movimentar</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col size="12">
            <ion-card @click="router.push('/inventory')">
              <ion-card-content class="ion-text-center">
                <ion-icon :icon="listOutline" size="large"></ion-icon>
                <p>Ver Estoque</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <div v-if="inventoryStore.movementsQueue.length > 0" class="sync-status">
        <ion-item lines="none" color="secondary">
          <ion-icon :icon="cloudUploadOutline" slot="start"></ion-icon>
          <ion-label>
            {{ inventoryStore.movementsQueue.length }} movimentações pendentes
          </ion-label>
        </ion-item>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonIcon,
  IonItem, IonLabel
} from '@ionic/vue';
import { 
  scanOutline, swapVerticalOutline, listOutline, cloudUploadOutline 
} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useInventoryStore } from '../stores/inventory';

const router = useRouter();
const inventoryStore = useInventoryStore();

// Load state on start
inventoryStore.loadState();
</script>

<style scoped>
.welcome-section {
  margin-bottom: 24px;
  padding: 10px;
}
.welcome-section h1 {
  font-weight: 700;
  margin: 0;
}
.welcome-section p {
  color: var(--ion-color-medium);
  margin: 5px 0 0 0;
}
ion-card {
  margin: 5px;
  cursor: pointer;
  transition: transform 0.2s;
}
ion-card:active {
  transform: scale(0.95);
}
ion-icon {
  color: var(--ion-color-primary);
  margin-bottom: 8px;
}
.sync-status {
  margin-top: 20px;
}
</style>
