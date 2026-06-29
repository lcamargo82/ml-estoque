export interface StockItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  purchasePrice: number;
  mlSellingPrice: number;
  directSellingPrice: number;
  isListedOnML: boolean;
  location?: string;
  images?: string[];
}

export interface Movement {
  id: string;
  type: 'IN' | 'OUT';
  productId: string;
  quantity: number;
  timestamp: string;
  synced: boolean;
}
