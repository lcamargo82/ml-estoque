import { defineStore } from 'pinia';
import { StockItem, Movement } from '../types/inventory';
import api from '@/services/api';
import { Preferences } from '@capacitor/preferences';

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    items: [] as StockItem[],
    movementsQueue: [] as Movement[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async loadState() {
      // Carregar dados salvos offline
      const { value: savedItems } = await Preferences.get({ key: 'items' });
      if (savedItems) {
        this.items = JSON.parse(savedItems);
      }

      const { value: savedQueue } = await Preferences.get({ key: 'movementsQueue' });
      if (savedQueue) {
        this.movementsQueue = JSON.parse(savedQueue);
      }
    },

    async fetchItems() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/products');
        this.items = response.data;
        // Salvar para acesso offline
        await Preferences.set({ key: 'items', value: JSON.stringify(this.items) });
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao carregar estoque';
        console.error('Failed to fetch inventory:', err);
      } finally {
        this.loading = false;
      }
    },

    async addMovement(movementData: Omit<Movement, 'id' | 'timestamp' | 'synced'>) {
      const newMovement: Movement = {
        ...movementData,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        synced: false
      };

      this.movementsQueue.push(newMovement);
      await Preferences.set({ key: 'movementsQueue', value: JSON.stringify(this.movementsQueue) });
      
      // Tentar atualizar localmente a quantidade se o produto existir
      const item = this.items.find(i => i.id === movementData.productId);
      if (item) {
        if (movementData.type === 'IN') item.quantity += movementData.quantity;
        else item.quantity -= movementData.quantity;
        await Preferences.set({ key: 'items', value: JSON.stringify(this.items) });
      }
    },

    async markAsSynced(id: string) {
      this.movementsQueue = this.movementsQueue.filter(m => m.id !== id);
      await Preferences.set({ key: 'movementsQueue', value: JSON.stringify(this.movementsQueue) });
    },

    async updateStock(id: string, newQuantity: number) {
      try {
        await api.patch(`/products/${id}`, { quantity: newQuantity });
        const item = this.items.find(i => i.id === id);
        if (item) {
          item.quantity = newQuantity;
          await Preferences.set({ key: 'items', value: JSON.stringify(this.items) });
        }
      } catch (err) {
        console.error('Failed to update stock:', err);
        throw err;
      }
    }
  }
});
