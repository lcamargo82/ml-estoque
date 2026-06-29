export interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  quantity: number;
  purchasePrice: number;
  mlSellingPrice: number;
  directSellingPrice: number;
  isListedOnML: boolean;
  supplierId?: string;
  supplier?: Supplier;
  images?: ProductImage[];
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  taxId?: string;
  contactInfo?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  index: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  isActive: boolean;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalQuantity: number;
  totalCostValue: number;
  totalListed: number;
  totalUnlisted: number;
}
