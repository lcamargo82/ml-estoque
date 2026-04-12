<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/inventory"></ion-back-button>
        </ion-buttons>
        <ion-title>Novo Produto</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding auth-background">
      <div class="form-container">
        <!-- Seção de Fotos Premium -->
        <div class="photo-capture-section ion-margin-bottom">
          <div v-if="capturedImages.length > 0" class="photo-preview-scroll">
            <div v-for="(img, index) in capturedImages" :key="index" class="preview-card">
              <img :src="img.dataUrl || img.webPath" />
              <ion-button fill="clear" color="danger" class="remove-photo" @click="removePhoto(index)">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </div>
            <div class="add-more-card" @click="presentPhotoActionSheet">
              <ion-icon :icon="addOutline"></ion-icon>
            </div>
          </div>
          <div v-else class="empty-photo-placeholder" @click="presentPhotoActionSheet">
            <div class="placeholder-content">
              <ion-icon :icon="cameraOutline"></ion-icon>
              <p>Adicionar Fotos do Produto</p>
              <span>Toque para capturar ou escolher</span>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit">
          <ion-list lines="none" class="custom-list">
            <div class="section-title">Informações Básicas</div>
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

            <ion-row>
              <ion-col size="6">
                <ion-item class="custom-item">
                  <ion-input
                    label="SKU"
                    label-placement="floating"
                    v-model="form.sku"
                    placeholder="Ex: CAM-BR-01"
                    required
                  ></ion-input>
                </ion-item>
              </ion-col>
              <ion-col size="6">
                <ion-item class="custom-item">
                  <ion-input
                    label="Slug (URL)"
                    label-placement="floating"
                    v-model="form.slug"
                    placeholder="Ex: camiseta-branca"
                    required
                  ></ion-input>
                </ion-item>
              </ion-col>
            </ion-row>

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

            <div class="section-title">Valores e Quantidade</div>
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

            <ion-item class="custom-item fallback-url">
              <ion-input
                label="OU URL da Imagem Externa"
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
  IonToggle, IonSpinner, IonIcon, actionSheetController, toastController, onIonViewWillEnter
} from '@ionic/vue';
import { 
  cameraOutline, imageOutline, closeOutline, addOutline 
} from 'ionicons/icons';
import { reactive, ref } from 'vue';
import { useInventoryStore } from '../stores/inventory';
import { useRouter } from 'vue-router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
const capturedImages = ref<any[]>([]);

onIonViewWillEnter(async () => {
  await inventoryStore.fetchSuppliers();
});

const presentPhotoActionSheet = async () => {
  const actionSheet = await actionSheetController.create({
    header: 'Selecionar Foto',
    buttons: [
      {
        text: 'Tirar Foto',
        icon: cameraOutline,
        handler: () => takePhoto(CameraSource.Camera)
      },
      {
        text: 'Escolher da Galeria',
        icon: imageOutline,
        handler: () => takePhoto(CameraSource.Photos)
      },
      {
        text: 'Cancelar',
        role: 'cancel'
      }
    ]
  });
  await actionSheet.present();
};

const takePhoto = async (source: CameraSource) => {
  try {
    const image = await Camera.getPhoto({
      quality: 80, // Reduzido um pouco para economizar banda
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: source
    });
    
    // Armazenamos o objeto completo para preview (usando dataUrl ou webPath)
    capturedImages.value.push(image);
  } catch (err) {
    console.error('Erro ao capturar foto', err);
  }
};

const removePhoto = (index: number) => {
  capturedImages.value.splice(index, 1);
};

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
    // No mundo real, aqui você faria o upload dos capturedImages para um S3/Cloudinary
    // Por enquanto, vamos simular anexando a webPath da primeira foto ou a URL manual
    // No backend NestJS, o DTO CreateProductDto espera string[]
    const finalImages = capturedImages.value.map(img => img.dataUrl);

    if (imageUrl.value) {
      finalImages.push(imageUrl.value);
    }

    const productPayload = {
      ...form,
      supplierId: form.supplierId || null,
      quantity: Number(form.quantity || 0),
      purchasePrice: Number(form.purchasePrice || 0),
      mlSellingPrice: Number(form.mlSellingPrice || 0),
      directSellingPrice: Number(form.directSellingPrice || 0),
      images: finalImages
    };

    console.log('Final Product Payload:', productPayload);

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

/* Photo Capture UI */
.photo-capture-section {
  width: 100%;
}

.empty-photo-placeholder {
  width: 100%;
  aspect-ratio: 16/9;
  background: var(--ion-card-background);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.empty-photo-placeholder:active {
  background: rgba(255, 255, 255, 0.05);
}

.placeholder-content {
  text-align: center;
  color: var(--ion-color-medium);
}

.placeholder-content ion-icon {
  font-size: 48px;
  margin-bottom: 8px;
  color: var(--ion-color-primary);
}

.placeholder-content span {
  font-size: 0.8rem;
  opacity: 0.7;
}

.photo-preview-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px;
}

.preview-card {
  position: relative;
  min-width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo {
  position: absolute;
  top: -5px;
  right: -5px;
  --padding-start: 0;
  --padding-end: 0;
  background: rgba(0,0,0,0.5);
  border-radius: 50%;
}

.add-more-card {
  min-width: 120px;
  height: 120px;
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ion-color-primary);
  font-size: 32px;
}

.section-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--ion-color-medium);
  letter-spacing: 1px;
  font-weight: 700;
  margin: 16px 0 8px 8px;
}

.custom-list {
  background: transparent;
}

.custom-item {
  --background: var(--ion-card-background);
  --border-radius: 12px;
  margin-bottom: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  --border-width: 0;
}

.fallback-url {
  margin-top: 24px;
  --background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

ion-toggle {
  --handle-background: var(--ion-color-primary);
}

.save-button {
  --background: var(--ion-color-primary);
  --border-radius: 12px;
  height: 56px;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 8px 16px rgba(169, 81, 198, 0.2);
}
</style>
