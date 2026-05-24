import api from './api';
import { ApiResponse, Stock } from './types';

export const stockService = {
  getAllStocks: async (): Promise<ApiResponse<Stock[]>> => {
    try {
      const response = await api.get<{ success: boolean; data: Stock[] }>('/stocks');
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Failed to fetch stocks' 
      };
    }
  },

  getStockById: async (id: number | string): Promise<ApiResponse<Stock>> => {
    try {
      const response = await api.get<{ success: boolean; data: Stock }>(`/stocks/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Failed to fetch stock' 
      };
    }
  },

  getStocksByProduct: async (productId: number | string): Promise<ApiResponse<Stock[]>> => {
    try {
      const response = await api.get<{ success: boolean; data: Stock[] }>(`/stocks/product/${productId}`);
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Failed to fetch product stocks' 
      };
    }
  },

  getLowStockItems: async (): Promise<ApiResponse<Stock[]>> => {
    try {
      const response = await api.get<{ success: boolean; data: Stock[] }>('/stocks/low-stock');
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Failed to fetch low stock items' 
      };
    }
  },

  getOutOfStockItems: async (): Promise<ApiResponse<Stock[]>> => {
    try {
      const response = await api.get<{ success: boolean; data: Stock[] }>('/stocks/out-of-stock');
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Failed to fetch out of stock items' 
      };
    }
  },
};

export default stockService;
