// API Configuration for IsherCare Multi-Service Architecture

export const API_CONFIG = {
  // Laravel Backend (Auth, Data, Products)
  LARAVEL_BASE_URL: 'https://backend.isherinvestment.com/api', // Production backend

  TIMEOUT: 60000, // Increased timeout for better connectivity (60 seconds)
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // Add retry configuration
  RETRY_ATTEMPTS: 5,
  RETRY_DELAY: 2000, // Increased delay between retries
};

export const API_ENDPOINTS = {
  // Laravel Backend Endpoints (Auth, Data, Products)
  LARAVEL: {
    REGISTER: '/register',
    LOGIN: '/login',
    LOGOUT: '/logout',
    USER: '/user',
    USERS: '/users',
    DEPENDENTS: '/dependents',
    PRODUCTS: '/products',
    ORDERS: '/orders',
    CONSULTATIONS: '/consultations',
  },
};

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: any;
  token: string;
  token_type: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Utility functions for API calls
export const makeAPICall = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_CONFIG.LARAVEL_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.HEADERS,
      ...options.headers,
    },
  };

  for (let attempt = 0; attempt < API_CONFIG.RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt === API_CONFIG.RETRY_ATTEMPTS - 1) {
        throw error;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, API_CONFIG.RETRY_DELAY)
      );
    }
  }

  throw new Error('Max retry attempts reached');
};

// Laravel Backend API calls
export const laravelAPI = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    makeAPICall<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    makeAPICall<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    makeAPICall<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    makeAPICall<T>(endpoint, { ...options, method: 'DELETE' }),
};
