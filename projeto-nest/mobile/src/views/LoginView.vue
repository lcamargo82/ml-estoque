<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding auth-background">
      <div class="login-container">
        <div class="logo-section">
          <ion-icon :icon="cubeOutline" class="logo-icon"></ion-icon>
          <h1>ML <span>Estoque</span></h1>
          <p>Gestão Inteligente Mobile</p>
        </div>

        <div class="form-section">
          <ion-item lines="full" class="ion-margin-bottom custom-item">
            <ion-label position="floating">E-mail</ion-label>
            <ion-input 
              v-model="form.email" 
              type="email" 
              placeholder="exemplo@ml.com"
            ></ion-input>
          </ion-item>

          <ion-item lines="full" class="ion-margin-bottom custom-item">
            <ion-label position="floating">Senha</ion-label>
            <ion-input 
              v-model="form.password" 
              type="password" 
              placeholder="••••••••"
            ></ion-input>
          </ion-item>

          <div v-if="authStore.error" class="error-message">
            {{ authStore.error }}
          </div>

          <ion-button 
            expand="block" 
            class="login-button ion-margin-top" 
            @click="handleLogin"
            :disabled="authStore.loading"
          >
            <ion-spinner v-if="authStore.loading" name="crescent"></ion-spinner>
            <span v-else>Acessar</span>
          </ion-button>

          <div v-if="authStore.biometricsAvailable" class="biometric-section">
            <div class="divider">
              <span>ou use biometria</span>
            </div>
            
            <ion-button 
              fill="clear" 
              class="biometric-button" 
              @click="handleBiometricLogin"
            >
              <ion-icon :icon="fingerPrintOutline" size="large"></ion-icon>
            </ion-button>
          </div>
        </div>

        <div class="footer-section">
          <p>© 2026 Admin Painel. Todos os direitos reservados.</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { 
  IonPage, IonContent, IonItem, IonLabel, IonInput, IonButton, 
  IonIcon, IonSpinner, toastController, alertController
} from '@ionic/vue';
import { cubeOutline, fingerPrintOutline } from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const form = reactive({
  email: '',
  password: '',
});

const handleLogin = async () => {
  if (!form.email || !form.password) {
    const toast = await toastController.create({
      message: 'Preencha todos os campos',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }

  const success = await authStore.login(form);
  if (success) {
    // Verificar se podemos vincular biometria
    if (authStore.biometricsAvailable && !authStore.biometricsLinked) {
      const alert = await alertController.create({
        header: 'Ativar Biometria?',
        message: 'Deseja usar sua digital para acessar o app rapidamente nas próximas vezes?',
        buttons: [
          {
            text: 'Agora não',
            role: 'cancel',
            handler: () => {
              router.push('/home');
            }
          },
          {
            text: 'Sim, ativar',
            handler: async () => {
              await authStore.saveBiometricCredentials(form.email, form.password);
              router.push('/home');
            }
          }
        ]
      });
      await alert.present();
    } else {
      router.push('/home');
    }
  }
};

const handleBiometricLogin = async () => {
  const success = await authStore.loginWithBiometrics();
  if (success) {
    router.push('/home');
  } else {
    const toast = await toastController.create({
      message: 'Falha na autenticação biométrica ou vínculo não encontrado',
      duration: 2500,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }
};

onMounted(async () => {
  await authStore.initialize();
  // Se biometria estiver vinculada, tenta prompt automático (opcional)
  if (authStore.biometricsAvailable && authStore.biometricsLinked) {
     // handleBiometricLogin(); 
  }
});
</script>

<style scoped>
.auth-background {
  --background: var(--ion-background-color);
}

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 40px 20px;
}

.logo-section {
  text-align: center;
  margin-top: 40px;
}

.logo-icon {
  font-size: 64px;
  color: var(--ion-color-primary);
  margin-bottom: 16px;
}

.logo-section h1 {
  font-size: 32px;
  font-weight: 800;
  color: white;
  margin: 0;
}

.logo-section span {
  color: var(--ion-color-primary);
}

.logo-section p {
  color: var(--ion-color-medium);
  margin-top: 8px;
}

.form-section {
  margin-bottom: 40px;
}

.custom-item {
  --background: transparent;
  --color: white;
  --highlight-color-focused: var(--ion-color-primary);
}

.login-button {
  --background: var(--ion-color-primary);
  --border-radius: 12px;
  height: 52px;
  font-weight: 600;
  margin-top: 32px;
}

.error-message {
  color: var(--ion-color-danger);
  font-size: 14px;
  margin-top: 12px;
  text-align: center;
}

.biometric-section {
  text-align: center;
  margin-top: 40px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--ion-color-medium);
  font-size: 12px;
  margin-bottom: 20px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--ion-color-step-300);
}

.divider:not(:empty)::before {
  margin-right: .50em;
}

.divider:not(:empty)::after {
  margin-left: .50em;
}

.biometric-button {
  --color: var(--ion-color-primary);
}

.footer-section {
  text-align: center;
}

.footer-section p {
  color: var(--ion-color-medium);
  font-size: 12px;
}
</style>
