import api from './api';

// Get all patients assigned to doctor
export const getMyPatients = async () => {
  try {
    const response = await api.get('/doctors/my-patients');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

// Search patients
export const searchPatients = async (query) => {
  try {
    const response = await api.get(`/doctors/search-patients?query=${encodeURIComponent(query)}`);
    return response.data.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

// Add note for patient
export const addPatientNote = async (patientId, note) => {
  try {
    const response = await api.post(`/doctors/patient-notes/${patientId}`, { note });
    return response.data.data;
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
};