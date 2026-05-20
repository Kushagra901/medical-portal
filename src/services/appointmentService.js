import api from './api';

export const getAvailableSlots = async (doctorId, date) => {
  const response = await api.get('/appointments/slots', { params: { doctorId, date } });
  return response.data;
};

export const createAppointment = async (appointmentData) => {
  const response = await api.post('/appointments', appointmentData);
  return response.data;
};

export const getDoctorAppointments = async (status = '', date = '', page = 1, limit = 10) => {
  const params = { page, limit };
  if (status) params.status = status;
  if (date)   params.date   = date;
  const response = await api.get('/appointments/doctor', { params });
  return response.data;
};

export const getPatientAppointments = async (page = 1, limit = 10) => {
  const response = await api.get('/appointments/patient', { params: { page, limit } });
  return response.data;
};

export const confirmAppointment = async (id) => {
  const response = await api.patch(`/appointments/${id}/confirm`);
  return response.data.appointment;
};

export const cancelAppointment = async (id) => {
  const response = await api.patch(`/appointments/${id}/cancel`);
  return response.data.appointment;
};

export const completeAppointment = async (id, notes) => {
  const response = await api.patch(`/appointments/${id}/complete`, { notes });
  return response.data.appointment;
};
