import api from './api';

// Get all medicines
export const getMedicines = async () => {
  try {
    const response = await api.get('/medicines');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching medicines:', error);
    return [
      { id: '1', name: 'Paracetamol', dosage: '500mg', use: 'Fever, Pain relief' },
      { id: '2', name: 'Amoxicillin', dosage: '500mg', use: 'Bacterial infections' },
      { id: '3', name: 'Ibuprofen', dosage: '400mg', use: 'Inflammation, Pain relief' },
      { id: '4', name: 'Cetirizine', dosage: '10mg', use: 'Allergies' },
    ];
  }
};

// Create new medicine
export const createMedicine = async (medicineData) => {
  try {
    const response = await api.post('/medicines', medicineData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating medicine:', error);
    throw error;
  }
};

// Update medicine
export const updateMedicine = async (id, medicineData) => {
  try {
    const response = await api.put(`/medicines/${id}`, medicineData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating medicine:', error);
    throw error;
  }
};

// Delete medicine
export const deleteMedicine = async (id) => {
  try {
    const response = await api.delete(`/medicines/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error deleting medicine:', error);
    throw error;
  }
};

// Suggest medicines based on keyword
export const suggestMedicines = async (keyword) => {
  try {
    const response = await api.get(`/medicines/suggest/${keyword}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error suggesting medicines:', error);
    return [];
  }
};