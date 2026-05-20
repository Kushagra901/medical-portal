import api from './api';

export const adminLogin = async (email, password) => {
  const response = await api.post('/admin/login', { email, password });
  if (response.data.success) {
    localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
    return response.data.admin;
  }
};

export const adminLogout = async () => {
  await api.post('/admin/logout');
  localStorage.removeItem('adminUser');
};

export const getStoredAdmin = () => {
  const admin = localStorage.getItem('adminUser');
  return admin ? JSON.parse(admin) : null;
};

export const getDashboardStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data.stats;
};

export const getPendingDoctors = async () => {
  const response = await api.get('/admin/doctors/pending');
  return response.data.doctors;
};

export const verifyDoctor = async (id) => {
  const response = await api.patch(`/admin/doctors/${id}/verify`);
  return response.data;
};

export const rejectDoctor = async (id) => {
  const response = await api.delete(`/admin/doctors/${id}/reject`);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};
