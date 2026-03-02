import api from './api';

// Patient Signup
export const patientSignup = async (patientData) => {
  try {
    console.log('Sending patient data:', patientData);
    
    const response = await api.post('/patients/register', patientData);
    console.log('Signup response:', response.data);
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('patientUser', JSON.stringify(response.data.user));
      return response.data.user;
    }
  } catch (error) {
    console.error('Signup error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

// Patient Login (Updated - removed demo access)
export const patientLogin = async (email, password) => {
  try {
    const response = await api.post('/patients/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('patientUser', JSON.stringify(response.data.user));
      return response.data.user;
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Invalid email or password');
  }
};

// Patient Logout
export const patientLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('patientUser');
};

// Get stored patient
export const getStoredPatient = () => {
  const user = localStorage.getItem('patientUser');
  return user ? JSON.parse(user) : null;
};

export const getCurrentPatient = getStoredPatient;

// Update patient profile
export const updatePatientProfile = async (id, profileData) => {
  try {
    const response = await api.put(`/patients/${id}`, profileData);
    if (response.data.success) {
      const updatedUser = { ...getStoredPatient(), ...profileData };
      localStorage.setItem('patientUser', JSON.stringify(updatedUser));
      return updatedUser;
    }
  } catch (error) {
    console.error('Profile update error:', error);
    const updatedUser = { ...getStoredPatient(), ...profileData };
    localStorage.setItem('patientUser', JSON.stringify(updatedUser));
    return updatedUser;
  }
};