import { defineStore } from 'pinia';
import { StockItem, Movement } from '../types/inventory';
import api from '@/services/api';
import { Preferences } from '@capacitor/preferences';

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    items: [] as StockItem[],
    suppliers: [] as any[],
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

      const { value: savedSuppliers } = await Preferences.get({ key: 'suppliers' });
      if (savedSuppliers) {
        this.suppliers = JSON.parse(savedSuppliers);
      }
    },

    async fetchSuppliers() {
      try {
        const response = await api.get('/suppliers');
        this.suppliers = response.data;
        await Preferences.set({ key: 'suppliers', value: JSON.stringify(this.suppliers) });
      } catch (err) {
        console.error('Failed to fetch suppliers:', err);
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

    async createProduct(productData: any) {
      this.loading = true;
      try {
        const response = await api.post('/products', productData);
        this.items.unshift(response.data);
        await Preferences.set({ key: 'items', value: JSON.stringify(this.items) });
        return response.data;
      } catch (err: any) {
        const message = err.response?.data?.message || 'Erro ao criar produto';
        throw new Error(Array.isArray(message) ? message[0] : message);
      } finally {
        this.loading = false;
      }
    },

    async updateProduct(id: string, productData: any) {
      const response = await api.patch(`/products/${id}`, productData);
      const index = this.items.findIndex(item => item.id === id);
      if (index >= 0) this.items[index] = response.data;
      await Preferences.set({ key: 'items', value: JSON.stringify(this.items) });
      return response.data;
    },

    async deleteProduct(id: string) {
      await api.delete(`/products/${id}`);
      this.items = this.items.filter(item => item.id !== id);
      await Preferences.set({ key: 'items', value: JSON.stringify(this.items) });
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
