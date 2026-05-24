import api from './api';
import { ApiResponse, Product, ProductsCollection } from './types';

export const productService = {
  getProducts: async (): Promise<ApiResponse<Product[]>> => {
    try {
      const response = await api.get<{ success: boolean; data: Product[] }>('/products');
      console.log('Raw products response:', response.data);
      console.log('Products data array:', response.data?.data);
      console.log('Products count:', response.data?.data?.length);
      return { 
        success: true, 
        data: response.data?.data || [] 
      };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Failed to fetch products' 
      };
    }
  },

  getProduct: async (id: number | string): Promise<ApiResponse<Product>> => {
    try {
      const response = await api.get<Product>(`/products/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Failed to fetch product' 
      };
    }
  },
};

export default productService;
