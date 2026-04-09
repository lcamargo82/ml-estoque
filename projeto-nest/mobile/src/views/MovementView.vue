<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Movimentação</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form @submit.prevent="handleSubmit">
        <ion-list>
          <ion-item>
            <ion-select label="Tipo de Movimentação" v-model="form.type" placeholder="Selecione">
              <ion-select-option value="IN">Entrada (+)</ion-select-option>
              <ion-select-option value="OUT">Saída (-)</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-select label="Produto" v-model="form.productId" placeholder="Selecione o produto">
              <ion-select-option v-for="item in inventoryStore.items" :key="item.id" :value="item.id">
                {{ item.name }} ({{ item.sku }})
              </ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-input label="Quantidade" type="number" v-model="form.quantity" placeholder="Ex: 5"></ion-input>
          </ion-item>
        </ion-list>

        <div class="ion-padding-top">
          <ion-button expand="block" type="submit" :disabled="!isFormValid">
            Confirmar Operação
          </ion-button>
        </div>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonSelect, IonSelectOption, IonInput,
  IonButton, IonButtons, IonBackButton, alertController
} from '@ionic/vue';
import { reactive, computed } from 'vue';
import { useInventoryStore } from '../stores/inventory';
import { useRouter } from 'vue-router';

const inventoryStore = useInventoryStore();
const router = useRouter();

const form = reactive({
  type: 'IN' as 'IN' | 'OUT',
  productId: '',
  quantity: 0
});

const isFormValid = computed(() => {
  return form.productId && form.quantity > 0 && form.type;
});

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  try {
    await inventoryStore.addMovement({
      type: form.type,
      productId: form.productId,
      quantity: Number(form.quantity)
    });

    const alert = await alertController.create({
      header: 'Sucesso',
      message: 'Movimentação registrada e enfileirada para sincronização.',
      buttons: ['OK']
    });

    await alert.present();
    router.replace('/home');
  } catch (error) {
    console.error(error);
  }
};
</script>
