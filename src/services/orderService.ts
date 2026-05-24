import api from './api';
import { ApiResponse, Order, CreateOrderData } from './types';

export const orderService = {
  getOrders: async (customerName?: string): Promise<ApiResponse<Order[]>> => {
    try {
      console.log('Fetching orders for customer:', customerName);
      const params = customerName ? { customer_name: customerName } : {};
      const response = await api.get<any>('/orders', { params });
      console.log('Orders response:', JSON.stringify(response.data, null, 2));

      // Handle both API Platform format (@context/member) and custom format (success/data)
      let orders: Order[] = [];
      if (response.data.member && Array.isArray(response.data.member)) {
        // API Platform Collection format
        orders = response.data.member;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Custom API format with success/data
        orders = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        orders = response.data;
      }

      return { success: true, data: orders };
    } catch (error) {
      console.log('Orders error:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to fetch orders'
      };
    }
  },

  getOrder: async (id: number | string): Promise<ApiResponse<Order>> => {
    try {
      const response = await api.get<{ success: boolean; data: Order }>(`/orders/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Failed to fetch order' 
      };
    }
  },

  createOrder: async (orderData: CreateOrderData): Promise<ApiResponse<Order>> => {
    try {
      console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
      const response = await api.post<any>('/orders', orderData);
      console.log('Create order response:', JSON.stringify(response.data, null, 2));

      // Handle both API Platform format and custom format
      let order: Order | undefined;
      if (response.data.data) {
        order = response.data.data;
      } else if (response.data.id) {
        order = response.data;
      }

      return { success: true, data: order! };
    } catch (error) {
      console.log('Create order error:', error);
      const axiosError = error as {
        response?: {
          status?: number;
          data?: { message?: string; detail?: string; '@type'?: string; description?: string }
        }
      };
      console.log('Error response status:', axiosError.response?.status);
      console.log('Error response data:', JSON.stringify(axiosError.response?.data, null, 2));

      let message = 'Failed to create order';
      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.response?.data?.detail) {
        message = axiosError.response.data.detail;
      } else if (axiosError.response?.data?.description) {
        message = axiosError.response.data.description;
      }

      return { success: false, message };
    }
  },
};

export default orderService;
