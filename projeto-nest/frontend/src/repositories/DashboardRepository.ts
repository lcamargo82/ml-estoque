import api from '../services/api';
import type { DashboardStats } from '../types';

export const DashboardRepository = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>('/dashboard/stats');
    return data;
  },
};
