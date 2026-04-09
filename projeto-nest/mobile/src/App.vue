<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { SyncService } from './services/sync.service';
import { onMounted } from 'vue';

onMounted(() => {
  SyncService.init();
});
</script>
