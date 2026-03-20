import api from './api';

// Doctor Login - REMOVED mock data fallback
export const doctorLogin = async (email, password) => {
  try {
    const response = await api.post('/doctors/login', { email, password });
    console.log('Login response:', response.data);
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('doctorUser', JSON.stringify(response.data.user));
      return response.data.user;
    }
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Invalid email or password');
  }
};

// Doctor Signup - REMOVED mock data fallback
export const doctorSignup = async (doctorData) => {
  try {
    console.log('Sending doctor data:', doctorData);
    
    const response = await api.post('/doctors/register', doctorData);
    console.log('Signup response:', response.data);
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('doctorUser', JSON.stringify(response.data.user));
      return response.data.user;
    }
  } catch (error) {
    console.error('Signup error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

// Doctor Logout
export const doctorLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('doctorUser');
};

// Get stored doctor
export const getStoredDoctor = () => {
  const user = localStorage.getItem('doctorUser');
  return user ? JSON.parse(user) : null;
};

export const getCurrentDoctor = getStoredDoctor;

// Update doctor profile
export const updateDoctorProfile = async (id, profileData) => {
  try {
    const response = await api.put(`/doctors/${id}`, profileData);
    if (response.data.success) {
      const updatedUser = { ...getStoredDoctor(), ...profileData };
      localStorage.setItem('doctorUser', JSON.stringify(updatedUser));
      return updatedUser;
    }
  } catch (error) {
    console.error('Profile update error:', error);
    throw new Error('Failed to update profile');
  }
};