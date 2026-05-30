import api from './api';
import authService from './authService';
import { ApiResponse, Order, CreateOrderData } from './types';

export type CreateOrderOptions = {
  productName?: string;
  unitPrice?: number;
};

const parseOrdersList = (data: any): Order[] => {
  if (data?.member && Array.isArray(data.member)) {
    return data.member;
  }
  if (data?.data && Array.isArray(data.data)) {
    return data.data;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

export const orderService = {
  getOrders: async (customerName?: string): Promise<ApiResponse<Order[]>> => {
    try {
      const hasJwt = await authService.ensureServerJwt();
      if (!hasJwt) {
        return {
          success: false,
          message: 'Please log in again to load orders from the server.',
        };
      }

      const params = customerName ? { customer_name: customerName } : {};
      const response = await api.get<any>('/orders', { params });
      return { success: true, data: parseOrdersList(response.data) };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to fetch orders',
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
        message: axiosError.response?.data?.message || 'Failed to fetch order',
      };
    }
  },

  createOrder: async (
    orderData: CreateOrderData,
    _options?: CreateOrderOptions
  ): Promise<ApiResponse<Order>> => {
    if (!orderData.product_id) {
      return { success: false, message: 'Product ID is required' };
    }
    if (!orderData.quantity || orderData.quantity < 1) {
      return { success: false, message: 'Quantity must be at least 1' };
    }
    if (!orderData.customer_name?.trim()) {
      return { success: false, message: 'Customer name is required' };
    }

    const hasJwt = await authService.ensureServerJwt();
    if (!hasJwt) {
      return {
        success: false,
        message:
          'Could not authenticate with the server. Log out, log in again, then place your order.',
      };
    }

    const requestBody = {
      product_id: orderData.product_id,
      quantity: orderData.quantity,
      customer_name: orderData.customer_name,
      material: orderData.material || null,
      color: orderData.color || null,
    };

    try {
      const response = await api.post<any>('/orders', requestBody);

      let order: Order | undefined;
      if (response.data?.data) {
        order = response.data.data;
      } else if (response.data?.id) {
        order = response.data;
      } else if (response.data?.['@id']) {
        order = response.data as Order;
      }

      if (!order) {
        return { success: false, message: 'No order data in response' };
      }

      return { success: true, data: order, code: 'SERVER' };
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: {
            message?: string;
            detail?: string;
            description?: string;
            violations?: { propertyPath: string; message: string }[];
          };
        };
      };

      const status = axiosError.response?.status;
      let message = 'Failed to create order';

      if (status === 401 || status === 403) {
        message = 'Session expired. Log out, log in again, then retry your order.';
      } else if (status === 400 && axiosError.response?.data?.violations) {
        message = axiosError.response.data.violations
          .map((v) => `${v.propertyPath}: ${v.message}`)
          .join(', ');
      } else if (axiosError.response?.data?.message) {
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
