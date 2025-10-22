import apiClient from './client';
import type { Notification, NotificationsResponse } from '../types';

export const notificationsApi = {
  // Get all notifications
  getAll: async (): Promise<NotificationsResponse> => {
    const response = await apiClient.get('/notifications/');
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/notifications/unread-count/');
    return response.data.unread_count;
  },

  // Mark one as read
  markAsRead: async (id: number): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read/`);
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all/');
  },

  // Delete one notification
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/notifications/${id}/`);
  },

  // Clear all read notifications
  clearAll: async (): Promise<void> => {
    await apiClient.delete('/notifications/clear-all/');
  },
};
