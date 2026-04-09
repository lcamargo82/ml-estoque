import api from '../services/api';
import type { User } from '../types';

export const UserRepository = {
  async list(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  async get(id: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  async create(user: Partial<User>): Promise<User> {
    const { data } = await api.post<User>('/users', user);
    return data;
  },

  async update(id: string, user: Partial<User>): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, user);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
