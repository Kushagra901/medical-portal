import api from './api';

// Get all patients
export const getPatients = async () => {
  try {
    const response = await api.get('/patients');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
};

// Get single patient by ID
export const getPatientById = async (id) => {
  try {
    const response = await api.get(`/patients/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching patient:', error);
    throw error;
  }
};

// Get patients by doctor ID
export const getPatientsByDoctor = async (doctorId) => {
  try {
    const response = await api.get(`/patients/doctor/${doctorId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching patients by doctor:', error);
    return [];
  }
};