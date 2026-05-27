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
      console.log('🔵 Creating order with data:', JSON.stringify(orderData, null, 2));

      // Validate required fields
      if (!orderData.product_id) {
        console.log('❌ Validation failed: Product ID is required');
        return { success: false, message: 'Product ID is required' };
      }
      if (!orderData.quantity || orderData.quantity < 1) {
        console.log('❌ Validation failed: Invalid quantity');
        return { success: false, message: 'Quantity must be at least 1' };
      }
      if (!orderData.customer_name || !orderData.customer_name.trim()) {
        console.log('❌ Validation failed: Customer name is required');
        return { success: false, message: 'Customer name is required' };
      }

      // Backend expects customer_name in request body
      const requestBody = {
        product_id: orderData.product_id,
        quantity: orderData.quantity,
        customer_name: orderData.customer_name,
        material: orderData.material || null,
        color: orderData.color || null,
      };

      console.log('📤 POST request to: /orders');
      console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

      const response = await api.post<any>('/orders', requestBody);
      console.log('✅ Create order response:', JSON.stringify(response.data, null, 2));

      // Handle both API Platform format and custom format
      let order: Order | undefined;
      if (response.data.data) {
        order = response.data.data;
      } else if (response.data.id) {
        order = response.data;
      } else if (response.data['@id']) {
        // API Platform format
        order = response.data as any;
      }

      if (!order) {
        console.log('❌ No order data in response:', response.data);
        return { success: false, message: 'No order data in response' };
      }

      console.log('✅ Order created successfully:', order.id);
      return { success: true, data: order };
    } catch (error: any) {
      console.log('❌ Create order error:', error.message);
      const axiosError = error as {
        response?: {
          status?: number;
          statusText?: string;
          data?: { message?: string; detail?: string; '@type'?: string; description?: string; violations?: any[] }
        };
        message?: string;
      };

      console.log('Error response status:', axiosError.response?.status, axiosError.response?.statusText);
      console.log('Error response data:', JSON.stringify(axiosError.response?.data, null, 2));
      console.log('Error message:', axiosError.message);

      let message = 'Failed to create order';
      if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        message = 'Authentication required. Please log in again.';
      } else if (axiosError.response?.status === 400) {
        if (axiosError.response?.data?.violations) {
          // Validation errors from API Platform
          message = axiosError.response.data.violations
            .map((v: any) => `${v.propertyPath}: ${v.message}`)
            .join(', ');
        } else if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        } else if (axiosError.response?.data?.detail) {
          message = axiosError.response.data.detail;
        } else {
          message = 'Bad request - please check your input';
        }
      } else if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.response?.data?.detail) {
        message = axiosError.response.data.detail;
      } else if (axiosError.response?.data?.description) {
        message = axiosError.response.data.description;
      }

      console.log('📌 Final error message:', message);
      return { success: false, message };
    }
  },
};

export default orderService;
