<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Leitor QR/Code</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding ion-text-center">
      <div class="scanner-container">
        <div class="scanner-overlay">
          <div class="scanner-box"></div>
        </div>
        <p>Aponte a câmera para o código de barras</p>
      </div>

      <ion-button expand="block" color="secondary" @click="simulateScan">
        Simular Leitura (Teste)
      </ion-button>

      <ion-item class="ion-margin-top">
        <ion-input label="Manual" v-model="manualSku" placeholder="Ou digite o SKU manualmente"></ion-input>
        <ion-button slot="end" @click="processScan(manualSku)">OK</ion-button>
      </ion-item>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButton, IonButtons, IonBackButton, IonInput, IonItem,
  alertController
} from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useInventoryStore } from '../stores/inventory';

const router = useRouter();
const inventoryStore = useInventoryStore();
const manualSku = ref('');

const simulateScan = () => {
  // Simulate finding a product SKU
  processScan('NB-14-P');
};

const processScan = async (sku: string) => {
  if (!sku) return;

  const product = inventoryStore.items.find(i => i.sku === sku);
  
  if (product) {
    const alert = await alertController.create({
      header: 'Produto Identificado',
      subHeader: product.name,
      message: `O que deseja fazer com este item?`,
      buttons: [
        {
          text: 'Entrada',
          handler: () => {
            router.push({ path: '/movement', query: { prodId: product.id, type: 'IN' } });
          }
        },
        {
          text: 'Saída',
          handler: () => {
            router.push({ path: '/movement', query: { prodId: product.id, type: 'OUT' } });
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  } else {
    const alert = await alertController.create({
      header: 'Não encontrado',
      message: `O SKU ${sku} não foi localizado no estoque local.`,
      buttons: ['OK']
    });
    await alert.present();
  }
};
</script>

<style scoped>
.scanner-container {
  height: 300px;
  background: #000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
}
.scanner-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.scanner-box {
  width: 200px;
  height: 150px;
  border: 2px solid var(--ion-color-primary);
  border-radius: 8px;
  box-shadow: 0 0 0 1000px rgba(0,0,0,0.5);
}
.scanner-container p {
  color: white;
  z-index: 10;
  margin-top: 200px;
}
</style>
