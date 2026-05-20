import api from './api';

// Create new prescription
export const createPrescription = async (prescriptionData) => {
  try {
    const response = await api.post('/prescriptions', prescriptionData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating prescription:', error);
    throw error;
  }
};

// Get all prescriptions for a doctor
export const getPrescriptions = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/prescriptions?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return { data: [], totalPages: 1, total: 0, page: 1, limit: 10 };
  }
};

// Get single prescription by ID
export const getPrescriptionById = async (id) => {
  try {
    const response = await api.get(`/prescriptions/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching prescription:', error);
    throw error;
  }
};

// Get prescriptions for a specific patient
export const getPatientPrescriptions = async (patientId, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/prescriptions/patient/${patientId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    return { data: [], totalPages: 1, total: 0, page: 1, limit: 10 };
  }
};