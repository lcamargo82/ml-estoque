import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { StockItem, Movement } from '../types/inventory';
import { Preferences } from '@capacitor/preferences';

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<StockItem[]>([]);
  const movementsQueue = ref<Movement[]>([]);

  // Initialize from storage
  const loadState = async () => {
    const { value } = await Preferences.get({ key: 'movements_queue' });
    if (value) {
      movementsQueue.value = JSON.parse(value);
    }
  };

  const addMovement = async (movement: Omit<Movement, 'id' | 'timestamp' | 'synced'>) => {
    const newMovement: Movement = {
      ...movement,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      synced: false
    };

    movementsQueue.value.push(newMovement);
    await saveQueue();
    
    // Optimistic UI update if possible
    const item = items.value.find(i => i.id === movement.productId);
    if (item) {
      if (movement.type === 'IN') item.quantity += movement.quantity;
      else item.quantity -= movement.quantity;
    }
  };

  const saveQueue = async () => {
    await Preferences.set({
      key: 'movements_queue',
      value: JSON.stringify(movementsQueue.value)
    });
  };

  const markAsSynced = async (id: string) => {
    movementsQueue.value = movementsQueue.value.filter(m => m.id !== id);
    await saveQueue();
  };

  return {
    items,
    movementsQueue,
    loadState,
    addMovement,
    markAsSynced
  };
});
