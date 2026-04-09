import { useInventoryStore } from '../stores/inventory';
import { Network } from '@capacitor/network';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class SyncService {
  private static isSyncing = false;

  static async init() {
    // Listen for network changes
    Network.addListener('networkStatusChange', async status => {
      if (status.connected) {
        console.log('Online! Starting sync...');
        await this.syncPendingMovements();
      }
    });

    // Initial check
    const status = await Network.getStatus();
    if (status.connected) {
      await this.syncPendingMovements();
    }
  }

  static async syncPendingMovements() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    const store = useInventoryStore();
    const pending = [...store.movementsQueue];

    for (const movement of pending) {
      try {
        await axios.post(`${API_URL}/movements`, movement);
        await store.markAsSynced(movement.id);
        console.log(`Synced movement ${movement.id}`);
      } catch (error) {
        console.error(`Failed to sync movement ${movement.id}`, error);
        // Stop sync if error occurs (optional, depends on strategy)
        break;
      }
    }

    this.isSyncing = false;
  }
}
