import api from './api';

// Doctor Login - REMOVED mock data fallback
export const doctorLogin = async (email, password) => {
  try {
    const response = await api.post('/doctors/login', { email, password });
    console.log('Login response:', response.data);
    
    if (response.data.success) {
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
      localStorage.setItem('doctorUser', JSON.stringify(response.data.user));
      return response.data.user;
    }
  } catch (error) {
    console.error('Signup error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

// Doctor Logout
export const doctorLogout = async () => {
  try {
    await api.post('/doctors/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
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
    let updatedProfileData = { ...profileData };

    // Upload base64 image via dedicated profile image endpoint
    if (profileData.profileImage && profileData.profileImage.startsWith('data:image')) {
      const imgResponse = await fetch(profileData.profileImage);
      const blob = await imgResponse.blob();
      const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('profileImage', file);

      const uploadResponse = await api.put(`/doctors/profile-image/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      updatedProfileData.profileImage = uploadResponse.data.imageUrl;
    }

    const response = await api.put(`/doctors/${id}`, updatedProfileData);
    if (response.data.success) {
      const updatedUser = { ...getStoredDoctor(), ...updatedProfileData };
      localStorage.setItem('doctorUser', JSON.stringify(updatedUser));
      return updatedUser;
    }
  } catch (error) {
    console.error('Profile update error:', error);
    throw new Error('Failed to update profile');
  }
};