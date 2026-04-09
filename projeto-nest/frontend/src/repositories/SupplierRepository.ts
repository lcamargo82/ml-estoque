import api from '../services/api';
import type { Supplier } from '../types';

export const SupplierRepository = {
  async list(): Promise<Supplier[]> {
    const { data } = await api.get<Supplier[]>('/suppliers');
    return data;
  },

  async get(id: string): Promise<Supplier> {
    const { data } = await api.get<Supplier>(`/suppliers/${id}`);
    return data;
  },

  async create(supplier: Partial<Supplier>): Promise<Supplier> {
    const { data } = await api.post<Supplier>('/suppliers', supplier);
    return data;
  },

  async update(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
    const { data } = await api.patch<Supplier>(`/suppliers/${id}`, supplier);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/suppliers/${id}`);
  },
};
