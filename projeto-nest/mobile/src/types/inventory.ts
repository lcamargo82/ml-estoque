export interface StockItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  location?: string;
}

export interface Movement {
  id: string;
  type: 'IN' | 'OUT';
  productId: string;
  quantity: number;
  timestamp: string;
  synced: boolean;
}
