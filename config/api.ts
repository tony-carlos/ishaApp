// API Configuration for IsherCare Multi-Service Architecture

export const API_CONFIG = {
  // Laravel Backend (Auth, Data, Products)
  LARAVEL_BASE_URL: __DEV__
    ? 'http://192.168.1.136:8000/api' // Laravel backend with /api prefix
    : 'https://your-production-domain.com/api',

  // Python FastAPI (Face Analysis)
  PYTHON_BASE_URL: __DEV__
    ? 'http://192.168.1.136:8003' // Python FastAPI server (no /api prefix)
    : 'https://your-production-python-api.com',

  TIMEOUT: 30000, // Increased timeout for better connectivity
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // Add retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
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

  // Python FastAPI Endpoints (Face Analysis)
  PYTHON: {
    HEALTH: '/health',
    FACE_DETECTION: '/analyze/face-detection',
    SKIN_ANALYSIS: '/analyze/skin-analysis',
    FACIAL_FEATURES: '/analyze/facial-features',
    AGE_ESTIMATION: '/analyze/age-estimation',
    EXPRESSION_ANALYSIS: '/analyze/expression',
    COMPREHENSIVE_ANALYSIS: '/analyze/comprehensive',
    BATCH_ANALYSIS: '/analyze/batch',
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
  options: RequestInit = {},
  backend: 'laravel' | 'python' = 'laravel'
): Promise<T> => {
  const baseURL =
    backend === 'laravel'
      ? API_CONFIG.LARAVEL_BASE_URL
      : API_CONFIG.PYTHON_BASE_URL;
  const url = `${baseURL}${endpoint}`;

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
    makeAPICall<T>(endpoint, { ...options, method: 'GET' }, 'laravel'),

  post: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    makeAPICall<T>(
      endpoint,
      {
        ...options,
        method: 'POST',
        body: JSON.stringify(data),
      },
      'laravel'
    ),

  put: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    makeAPICall<T>(
      endpoint,
      {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data),
      },
      'laravel'
    ),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    makeAPICall<T>(endpoint, { ...options, method: 'DELETE' }, 'laravel'),
};

// Python FastAPI calls
export const pythonAPI = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    makeAPICall<T>(endpoint, { ...options, method: 'GET' }, 'python'),

  post: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    makeAPICall<T>(
      endpoint,
      {
        ...options,
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: data instanceof FormData ? {} : API_CONFIG.HEADERS,
      },
      'python'
    ),

  postFormData: <T = any>(
    endpoint: string,
    formData: FormData,
    options?: RequestInit
  ) =>
    makeAPICall<T>(
      endpoint,
      {
        ...options,
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      },
      'python'
    ),
};
