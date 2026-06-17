<template>
  <ion-page>
    <ion-content>
      <div class="login-wrap">
        <main class="login-card">
          <img src="/app-logo.png" class="app-logo-image" alt="ML Estoque Logo" />
          <h1>ML Estoque</h1>
          <p class="subtitle">Gerenciamento de alta performance</p>

          <AppField v-model="form.email" label="E-mail" placeholder="nome@empresa.com.br" :icon="mailOutline" />
          
          <PasswordField v-model="form.password" label="Senha" placeholder="••••••••" :icon="lockClosedOutline" />
          
          <div class="forgot-link-wrap">
            <router-link to="/forgot-password">Esqueci minha senha</router-link>
          </div>
          
          <div v-if="authStore.error" class="form-error">{{ authStore.error }}</div>
          
          <button class="primary-button" :disabled="authStore.loading" @click="handleLogin">
            {{ authStore.loading ? 'Entrando...' : 'Acessar Sistema' }}
          </button>
          
          <div v-if="authStore.biometricsAvailable" class="bio">
            <div class="bio-divider">
              <span>ou</span>
            </div>
            <button aria-label="Acessar com biometria" class="bio-btn" @click="handleBiometricLogin">
              <ion-icon :icon="fingerPrintOutline" />
            </button>
            <p>Acessar com Biometria</p>
          </div>
        </main>
        
        <footer>ML Estoque © 2026 • Infraestrutura de Logística Segura</footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { IonPage, IonContent, IonIcon, toastController, alertController } from '@ionic/vue';
import { fingerPrintOutline, lockClosedOutline, mailOutline } from 'ionicons/icons';
import AppField from '@/components/AppField.vue';
import PasswordField from '@/components/PasswordField.vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore(), router = useRouter(), form = reactive({ email: '', password: '' });

const handleLogin = async () => {
  if (!form.email || !form.password) return toast('Preencha todos os campos', 'warning');
  if (await authStore.login(form)) {
    if (authStore.biometricsAvailable && !authStore.biometricsLinked) {
      const alert = await alertController.create({
        header: 'Ativar Biometria?',
        message: 'Deseja usar biometria nos próximos acessos?',
        buttons: [
          { text: 'Agora não', handler: () => router.replace('/home') },
          { text: 'Ativar', handler: async () => { await authStore.enrollBiometrics(form); router.replace('/home') } }
        ]
      });
      await alert.present()
    } else router.replace('/home')
  }
};

const handleBiometricLogin = async () => {
  const result = await authStore.loginWithBiometrics();
  if (result.success) router.replace('/home');
  else toast({
    'unavailable': 'Biometria indisponível',
    'not-linked': 'Entre com sua senha para ativar a biometria',
    'cancelled': 'Autenticação cancelada',
    'credentials-missing': 'Vínculo expirado. Entre novamente',
    'login-failed': authStore.error || 'Falha no login'
  }[result.reason as string] || 'Falha no login', 'danger')
};

const toast = async (message: string, color: string) => {
  const t = await toastController.create({ message, color, duration: 2500 });
  await t.present()
};
onMounted(() => authStore.initialize());
</script>

<style scoped>
ion-content {
  --background: var(--ion-card-background);
}
.login-wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
  padding: 32px 24px;
  text-align: center;
}
.app-logo-image {
  width: 96px;
  height: 96px;
  border-radius: 22px;
  margin: 0 auto 24px;
  display: block;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--ion-color-step-150);
}
h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--ion-text-color);
}
.subtitle {
  color: var(--ion-color-medium);
  font-size: 14px;
  margin-bottom: 32px;
}
.forgot-link-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  margin-bottom: 24px;
}
.forgot-link-wrap a {
  color: var(--ion-color-primary-tint);
  font-size: 13px;
  text-decoration: none;
  font-weight: 500;
  font-family: "JetBrains Mono", monospace;
}
.bio {
  margin-top: 32px;
}
.bio-divider {
  position: relative;
  text-align: center;
  margin-bottom: 24px;
}
.bio-divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #2a364b;
  z-index: 0;
}
.bio-divider span {
  display: inline-block;
  background: var(--ion-card-background);
  padding: 0 16px;
  color: var(--ion-color-medium);
  font-size: 14px;
  position: relative;
  z-index: 1;
}
.bio-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: transparent;
  border: 2px solid var(--ion-color-primary);
  color: var(--ion-color-primary);
  font-size: 32px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
.bio p {
  color: var(--ion-color-medium);
  font-size: 14px;
  margin-top: 12px;
}
.form-error {
  color: var(--ion-color-danger);
  font-size: 14px;
  margin-bottom: 16px;
}
footer {
  text-align: center;
  color: var(--ion-color-medium);
  font-size: 12px;
  font-family: "JetBrains Mono", monospace;
}
</style>
