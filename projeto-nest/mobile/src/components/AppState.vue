<template><div class="app-state"><ion-spinner v-if="loading" name="crescent" /><h3>{{ title }}</h3><p v-if="message">{{ message }}</p></div></template>
<script setup lang="ts">import { IonSpinner } from '@ionic/vue'; defineProps<{ title: string; message?: string; loading?: boolean }>();</script>
