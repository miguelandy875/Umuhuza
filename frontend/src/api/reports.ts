import apiClient from './client';
import type { Report, ReportCreateData } from '../types';

export const reportsApi = {
  // Create a report
  create: async (data: ReportCreateData): Promise<{ message: string; report: Report }> => {
    const response = await apiClient.post('/reports/create/', data);
    return response.data;
  },

  // Get my reports
  getMyReports: async (): Promise<Report[]> => {
    const response = await apiClient.get('/reports/my-reports/');
    return response.data;
  },

  // Get single report
  getById: async (id: number): Promise<Report> => {
    const response = await apiClient.get(`/reports/${id}/`);
    return response.data;
  },
};
