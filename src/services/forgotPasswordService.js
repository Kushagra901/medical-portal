import api from './api';

export const requestPasswordOtp = async (email, role) => {
  const response = await api.post('/auth/forgot-password', { email, role });
  return response.data;
};

export const resetPassword = async (email, otp, newPassword, role) => {
  const response = await api.post('/auth/reset-password', { email, otp, newPassword, role });
  return response.data;
};
