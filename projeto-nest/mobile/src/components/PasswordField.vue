<template><label class="app-field"><span v-if="label" class="app-field__label">{{ label }}</span><span class="app-field__control"><ion-icon v-if="icon" :icon="icon" /><input :value="modelValue" :type="visible ? 'text' : 'password'" :placeholder="placeholder" :autocomplete="autocomplete" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" /><button type="button" :aria-label="visible ? 'Ocultar senha' : 'Mostrar senha'" @click="visible = !visible"><ion-icon :icon="visible ? eyeOffOutline : eyeOutline" /></button></span></label></template>
<script setup lang="ts">
import { ref } from 'vue'; import { IonIcon } from '@ionic/vue'; import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
defineProps<{ modelValue: string; label?: string; placeholder?: string; autocomplete?: string; icon?: string }>(); defineEmits<{ 'update:modelValue': [value: string] }>(); const visible = ref(false);
</script>
