import api from './api';

// Doctor Signup
export const doctorSignup = async (doctorData) => {
  try {
    console.log('Sending to backend:', doctorData);
    
    const response = await api.post('/doctors/register', doctorData);
    console.log('Backend response:', response.data);
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('doctorUser', JSON.stringify(response.data.user));
      return response.data.user;
    }
  } catch (error) {
    console.error('Signup error details:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

// Rest of the file remains the same...

// Doctor Login
export const doctorLogin = async (email, password) => {
  try {
    const response = await api.post('/doctors/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('doctorUser', JSON.stringify(response.data.user));
      return response.data.user;
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
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
    const updatedUser = { ...getStoredDoctor(), ...profileData };
    localStorage.setItem('doctorUser', JSON.stringify(updatedUser));
    return updatedUser;
  }
};