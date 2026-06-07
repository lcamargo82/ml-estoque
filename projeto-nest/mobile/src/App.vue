<template>
  <ion-app>
    <!-- Menu Lateral (Drawer) -->
    <ion-menu content-id="main-content" type="overlay" class="premium-menu">
      <ion-header class="ion-no-border">
        <ion-toolbar class="menu-header">
          <div class="user-profile-header ion-padding">
            <div class="avatar-glow">
              <ion-avatar>
                <img src="https://ionicframework.com/docs/img/demos/avatar.svg" />
              </ion-avatar>
            </div>
            <div class="user-info">
              <h2 class="text-white font-bold">{{ authStore.user?.name || 'Operador' }}</h2>
              <p class="text-neutral text-xs">{{ authStore.user?.email || 'Premium User' }}</p>
            </div>
          </div>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding-top">
        <ion-list lines="none" class="menu-list">
          <ion-menu-toggle :auto-hide="false">
            <ion-item button router-link="/home" router-direction="root" class="menu-item" :detail="false">
              <ion-icon slot="start" :icon="gridOutline"></ion-icon>
              <ion-label>Dashboard</ion-label>
            </ion-item>

            <ion-item button router-link="/inventory" router-direction="root" class="menu-item" :detail="false">
              <ion-icon slot="start" :icon="cubeOutline"></ion-icon>
              <ion-label>Catálogo / Estoque</ion-label>
            </ion-item>

            <ion-item button router-link="/movement" router-direction="root" class="menu-item" :detail="false">
              <ion-icon slot="start" :icon="swapVerticalOutline"></ion-icon>
              <ion-label>Movimentações</ion-label>
            </ion-item>

            <ion-item button class="menu-item" :detail="false">
              <ion-icon slot="start" :icon="settingsOutline"></ion-icon>
              <ion-label>Configurações</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>

        <div class="logout-section ion-padding">
          <ion-button expand="block" fill="clear" color="danger" @click="handleLogout" class="logout-btn">
            <ion-icon slot="start" :icon="logOutOutline"></ion-icon>
            Encerrar Sessão
          </ion-button>
        </div>
      </ion-content>
    </ion-menu>

    <!-- Conteúdo Principal -->
    <ion-router-outlet id="main-content" />
  </ion-app>
</template>

<script setup lang="ts">
import { 
  IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonContent,
  IonList, IonItem, IonIcon, IonLabel, IonAvatar, IonMenuToggle, IonButton,
  menuController
} from '@ionic/vue';
import { 
  gridOutline, cubeOutline, swapVerticalOutline, settingsOutline, logOutOutline 
} from 'ionicons/icons';
import { SyncService } from './services/sync.service';
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';
import { App as CapacitorApp } from '@capacitor/app';
import { resetRouteFromUrl } from './router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  await authStore.logout();
  await menuController.close();
  router.replace('/login');
};

onMounted(() => {
  SyncService.init();
  CapacitorApp.addListener('appUrlOpen', ({ url }) => {
    const route = resetRouteFromUrl(url);
    if (route) {
      router.push(route);
    }
  });
});
</script>

<style>
/* Estilos Globais do Menu Premium */
.premium-menu {
  --width: 300px;
}

.menu-header {
  --background: var(--ion-background-color);
  padding-top: 20px;
}

.user-profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, rgba(169, 81, 198, 0.1) 0%, transparent 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.avatar-glow {
  padding: 3px;
  background: linear-gradient(45deg, var(--ion-color-primary), var(--ion-color-secondary));
  border-radius: 50%;
}

.user-info h2 {
  margin: 0;
  font-size: 1.1rem;
}

.user-info p {
  margin: 2px 0 0 0;
}

.menu-list {
  background: transparent !important;
  padding: 10px;
}

.menu-item {
  --background: transparent;
  --color: var(--ion-color-medium);
  --border-radius: 12px;
  margin-bottom: 4px;
  font-weight: 500;
  --padding-start: 16px;
}

.menu-item::part(native) {
  padding-left: 16px;
}

.menu-item ion-icon {
  color: var(--ion-color-medium);
  font-size: 22px;
}

.menu-item.item-has-focus, .menu-item:hover {
  --background: rgba(169, 81, 198, 0.1);
  --color: white;
}

.menu-item.item-has-focus ion-icon, .menu-item:hover ion-icon {
  color: var(--ion-color-primary);
}

.logout-section {
  position: absolute;
  bottom: 0;
  width: 100%;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: var(--ion-background-color);
}

.logout-btn {
  --padding-start: 0;
  font-weight: 600;
  text-transform: none;
}
</style>
