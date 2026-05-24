// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

// Auth Types
export interface User {
  id: number;
  email: string;
  roles: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Stock Types - matches backend API response
export interface Stock {
  id: number;
  quantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  product: {
    id: number;
    name: string;
    price: number;
    image?: string;
    material?: string;
    color?: string;
  };
  created_by?: string;
  '@id'?: string;
}

// Product Types - matches backend API response
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity?: number;  // API field name (may be outdated)
  stockQuantity?: number;  // Alternative field name
  stockStatus?: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'in_stock' | 'low_stock' | 'out_of_stock';
  material?: string;
  color?: string;
  image?: string;
  imageUrl?: string;
  category?: string;
  categories?: { id: number; name: string }[];
  stocks?: string[]; // References to /api/stocks/{id}
  '@id'?: string;
}

export interface ProductsCollection {
  member: Product[];
  totalItems: number;
}

// Order Types - matches backend API response
export interface Order {
  id: number;
  customer_name?: string;
  product_name?: string;
  material?: string;
  color?: string;
  quantity: number;
  price: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date?: string;
  delivery_date?: string;
}

export interface CreateOrderData {
  product_id: number;
  quantity: number;
  customer_name: string;
  material?: string;
  color?: string;
}

// Customer/Profile Types - matches backend API response
export interface CustomerData {
  id: number;
  name?: string;
  email_address?: string;
  phone_number?: string;
  address?: string;
}

export interface CustomerProfile {
  id: number;
  email: string;
  roles: string[];
  isVerified?: boolean;
  customer?: CustomerData;
}

export interface UpdateProfileData {
  name?: string;
  phone_number?: string;
  address?: string;
}
