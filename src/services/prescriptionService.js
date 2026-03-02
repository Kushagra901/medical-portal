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
export const getPrescriptions = async () => {
  try {
    const response = await api.get('/prescriptions');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return [];
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
export const getPatientPrescriptions = async (patientId) => {
  try {
    const response = await api.get(`/prescriptions/patient/${patientId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    return [];
  }
};