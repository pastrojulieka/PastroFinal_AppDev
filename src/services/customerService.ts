import api from './api';
import { ApiResponse, CustomerProfile, UpdateProfileData } from './types';

export const customerService = {
  getProfile: async (): Promise<ApiResponse<CustomerProfile>> => {
    try {
      const response = await api.get<{ success: boolean; data: CustomerProfile; message?: string }>('/profile');
      return { success: true, data: response.data.data };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Failed to fetch profile' 
      };
    }
  },

  updateProfile: async (profileData: UpdateProfileData): Promise<ApiResponse<CustomerProfile>> => {
    try {
      const response = await api.put<CustomerProfile>('/profile', profileData);
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Failed to update profile' 
      };
    }
  },
};

export default customerService;
