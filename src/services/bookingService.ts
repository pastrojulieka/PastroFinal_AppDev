import api from './api';
import { ApiResponse, Booking } from './types';

export interface CreateBookingData {
  serviceType: string;
  bookingDate: string;
  notes?: string;
}

export const bookingService = {
  getBookings: async (): Promise<ApiResponse<Booking[]>> => {
    try {
      const response = await api.get<{ member: Booking[] }>('/bookings');
      return { 
        success: true, 
        data: response.data.member || [] 
      };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Failed to fetch bookings' 
      };
    }
  },

  getBooking: async (id: number | string): Promise<ApiResponse<Booking>> => {
    try {
      const response = await api.get<Booking>(`/bookings/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Failed to fetch booking' 
      };
    }
  },

  createBooking: async (bookingData: CreateBookingData): Promise<ApiResponse<Booking>> => {
    try {
      const response = await api.post<Booking>('/bookings', bookingData);
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Failed to create booking' 
      };
    }
  },
};

export default bookingService;
