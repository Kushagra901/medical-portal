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

// 👇 NEW: Get patient's assigned doctor
export const getMyDoctor = async () => {
  try {
    const response = await api.get('/patients/my-doctor');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching doctor:', error);
    throw error;
  }
};

// 👇 NEW: Assign patient to a doctor (for admin/doctor use)
export const assignPatientToDoctor = async (patientId, doctorId) => {
  try {
    const response = await api.put(`/patients/${patientId}/assign`, { doctorId });
    return response.data.data;
  } catch (error) {
    console.error('Error assigning patient to doctor:', error);
    throw error;
  }
};

// 👇 NEW: Get all patients for the logged-in doctor
export const getMyPatients = async () => {
  try {
    const response = await api.get('/doctors/my-patients');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching my patients:', error);
    throw error;
  }
};

// 👇 NEW: Search patients for the logged-in doctor
export const searchMyPatients = async (query) => {
  try {
    const response = await api.get(`/doctors/search-patients?query=${encodeURIComponent(query)}`);
    return response.data.data;
  } catch (error) {
    console.error('Error searching patients:', error);
    throw error;
  }
};

// 👇 NEW: Add note for a patient (by doctor)
export const addPatientNote = async (patientId, note) => {
  try {
    const response = await api.post(`/doctors/patient-notes/${patientId}`, { note });
    return response.data.data;
  } catch (error) {
    console.error('Error adding patient note:', error);
    throw error;
  }
};