import api from './api';

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data.notifications;
};

export const markNotificationsAsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};
