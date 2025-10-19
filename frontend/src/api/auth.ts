import apiClient from './client';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '../types';

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register/', data);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login/', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout/');
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/auth/profile/');
    return response.data;
  },

  verifyEmail: async (code: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/verify-email/', { code });
    return response.data;
  },

  verifyPhone: async (code: string): Promise<{ message: string; is_fully_verified: boolean }> => {
    const response = await apiClient.post('/auth/verify-phone/', { code });
    return response.data;
  },

  resendCode: async (codeType: 'email' | 'phone'): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/resend-code/', { code_type: codeType });
    return response.data;
  },

  updateEmail: async (email: string): Promise<{ message: string; email: string; code?: string }> => {
    const response = await apiClient.put('/auth/update-email/', { email });
    return response.data;
  },

  updatePhone: async (phone_number: string): Promise<{ message: string; phone_number: string; code?: string }> => {
    const response = await apiClient.put('/auth/update-phone/', { phone_number });
    return response.data;
  },
};