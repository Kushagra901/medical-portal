import api from './api';

// Get all database info for exporting Excel
export const exportAllData = async () => {
  try {
    const response = await api.get('/export/all-data');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching export data:', error);
    throw error;
  }
};
