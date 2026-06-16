import api from '../services/api';

export const ImportExportRepository = {
  async export(): Promise<Blob> {
    const { data } = await api.get('/import-export/export', {
      responseType: 'blob',
    });
    return data;
  },

  async import(file: File): Promise<{ success: boolean; count: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/import-export/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};
