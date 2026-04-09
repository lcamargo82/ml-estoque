<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/inventory"></ion-back-button>
        </ion-buttons>
        <ion-title>Novo Produto</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding auth-background">
      <div class="form-container">
        <form @submit.prevent="handleSubmit">
          <ion-list lines="inset" class="custom-list">
            <ion-item class="custom-item">
              <ion-input
                label="Nome do Produto"
                label-placement="floating"
                v-model="form.name"
                @ionInput="handleNameInput"
                placeholder="Ex: Camiseta Branca"
                required
              ></ion-input>
            </ion-item>

            <ion-item class="custom-item">
              <ion-input
                label="SKU"
                label-placement="floating"
                v-model="form.sku"
                placeholder="Ex: CAM-BR-01"
                required
              ></ion-input>
            </ion-item>

            <ion-item class="custom-item">
              <ion-input
                label="Slug (URL)"
                label-placement="floating"
                v-model="form.slug"
                placeholder="Ex: camiseta-branca"
                required
              ></ion-input>
            </ion-item>

            <ion-item class="custom-item">
              <ion-select
                label="Fornecedor"
                label-placement="floating"
                v-model="form.supplierId"
                placeholder="Selecione um fornecedor"
              >
                <ion-select-option
                  v-for="supplier in inventoryStore.suppliers"
                  :key="supplier.id"
                  :value="supplier.id"
                >
                  {{ supplier.name }}
                </ion-select-option>
              </ion-select>
            </ion-item>

            <ion-row>
              <ion-col size="6">
                <ion-item class="custom-item">
                  <ion-input
                    label="Estoque Inicial"
                    label-placement="floating"
                    type="number"
                    v-model="form.quantity"
                    required
                  ></ion-input>
                </ion-item>
              </ion-col>
              <ion-col size="6">
                <ion-item class="custom-item">
                  <ion-input
                    label="Preço Custo"
                    label-placement="floating"
                    type="number"
                    step="0.01"
                    v-model="form.purchasePrice"
                    required
                  ></ion-input>
                </ion-item>
              </ion-col>
            </ion-row>

            <ion-row>
              <ion-col size="6">
                <ion-item class="custom-item">
                  <ion-input
                    label="Preço ML"
                    label-placement="floating"
                    type="number"
                    step="0.01"
                    v-model="form.mlSellingPrice"
                    required
                  ></ion-input>
                </ion-item>
              </ion-col>
              <ion-col size="6">
                <ion-item class="custom-item">
                  <ion-input
                    label="Preço Direta"
                    label-placement="floating"
                    type="number"
                    step="0.01"
                    v-model="form.directSellingPrice"
                    required
                  ></ion-input>
                </ion-item>
              </ion-col>
            </ion-row>

            <ion-item class="custom-item">
              <ion-toggle v-model="form.isListedOnML" justify="space-between">
                Listado no Mercado Livre?
              </ion-toggle>
            </ion-item>

            <ion-item class="custom-item">
              <ion-input
                label="URL da Imagem"
                label-placement="floating"
                v-model="imageUrl"
                placeholder="https://exemplo.com/imagem.jpg"
              ></ion-input>
            </ion-item>
          </ion-list>

          <div class="ion-padding-vertical">
            <ion-button
              expand="block"
              type="submit"
              class="save-button"
              :disabled="inventoryStore.loading"
            >
              <ion-spinner v-if="inventoryStore.loading"></ion-spinner>
              <span v-else>Salvar Produto</span>
            </ion-button>
          </div>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonInput, IonSelect, IonSelectOption,
  IonButton, IonButtons, IonBackButton, IonRow, IonCol,
  IonToggle, IonSpinner, toastController, onIonViewWillEnter
} from '@ionic/vue';
import { reactive, ref } from 'vue';
import { useInventoryStore } from '../stores/inventory';
import { useRouter } from 'vue-router';

const inventoryStore = useInventoryStore();
const router = useRouter();

const form = reactive({
  name: '',
  sku: '',
  slug: '',
  supplierId: '',
  quantity: 0,
  purchasePrice: 0,
  mlSellingPrice: 0,
  directSellingPrice: 0,
  isListedOnML: false
});

const imageUrl = ref('');

onIonViewWillEnter(async () => {
  await inventoryStore.fetchSuppliers();
});

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

const handleNameInput = () => {
  form.slug = slugify(form.name);
};

const handleSubmit = async () => {
  try {
    const productPayload = {
      ...form,
      quantity: Number(form.quantity),
      purchasePrice: Number(form.purchasePrice),
      mlSellingPrice: Number(form.mlSellingPrice),
      directSellingPrice: Number(form.directSellingPrice),
      images: imageUrl.value ? [{ url: imageUrl.value, index: 0 }] : []
    };

    await inventoryStore.createProduct(productPayload);

    const toast = await toastController.create({
      message: 'Produto cadastrado com sucesso!',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();

    router.replace('/inventory');
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.message || 'Erro ao cadastrar produto',
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }
};
</script>

<style scoped>
.auth-background {
  --background: var(--ion-background-color);
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
}

.custom-list {
  background: transparent;
  padding: 0;
}

.custom-item {
  --background: var(--ion-card-background);
  --border-radius: 12px;
  --margin-bottom: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  margin-bottom: 12px;
  --border-width: 0;
}

ion-toggle {
  --handle-background: var(--ion-color-primary);
  --handle-background-checked: white;
}

.save-button {
  --background: var(--ion-color-primary);
  --border-radius: 12px;
  height: 52px;
  font-weight: 600;
  margin-top: 16px;
}
</style>
