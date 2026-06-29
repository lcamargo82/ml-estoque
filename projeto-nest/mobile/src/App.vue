<template><ion-app><ion-router-outlet /></ion-app></template>
<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { App as CapacitorApp } from '@capacitor/app';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { SyncService } from './services/sync.service';
import { resetRouteFromUrl } from './router';
const router = useRouter();
onMounted(() => { SyncService.init(); CapacitorApp.addListener('appUrlOpen', ({ url }) => { const route = resetRouteFromUrl(url); if (route) router.push(route); }); });
</script>
