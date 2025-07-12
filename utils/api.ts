import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  API_CONFIG,
  API_ENDPOINTS,
  ApiResponse,
  AuthResponse,
} from '@/config/api';

// Destructure endpoints for easier access
const { LARAVEL: LARAVEL_ENDPOINTS, PYTHON: PYTHON_ENDPOINTS } = API_ENDPOINTS;

class ApiService {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.LARAVEL_BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = API_CONFIG.HEADERS;
  }

  private async getAuthToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async getHeaders(
    includeAuth: boolean = true
  ): Promise<Record<string, string>> {
    const headers = { ...this.defaultHeaders };

    if (includeAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true,
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = await this.getHeaders(includeAuth);

      const config: RequestInit = {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      };

      const response = await fetch(url, config);

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Request failed' };
        }
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('API Request Error:', error);

      // Check if it's a network error and retry if configured
      if (
        error.name === 'TypeError' &&
        error.message.includes('Network request failed')
      ) {
        if (retryCount < (API_CONFIG.RETRY_ATTEMPTS || 3)) {
          console.log(
            `Retrying request (${retryCount + 1}/${
              API_CONFIG.RETRY_ATTEMPTS || 3
            })...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, API_CONFIG.RETRY_DELAY || 1000)
          );
          return this.makeRequest(
            endpoint,
            options,
            includeAuth,
            retryCount + 1
          );
        }
      }

      throw error;
    }
  }

  // Auth methods
  async register(userData: any): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>(
      LARAVEL_ENDPOINTS.REGISTER,
      {
        method: 'POST',
        body: JSON.stringify(userData),
      },
      false
    );
    return response as AuthResponse;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>(
      LARAVEL_ENDPOINTS.LOGIN,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      false
    );
    return response as AuthResponse;
  }

  async logout(): Promise<ApiResponse> {
    return this.makeRequest(LARAVEL_ENDPOINTS.LOGOUT, {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.makeRequest(LARAVEL_ENDPOINTS.USER);
  }

  // User methods
  async getUsers(): Promise<ApiResponse> {
    return this.makeRequest(LARAVEL_ENDPOINTS.USERS);
  }

  async getUser(id: string): Promise<ApiResponse> {
    return this.makeRequest(`${LARAVEL_ENDPOINTS.USERS}/${id}`);
  }

  async updateUser(id: string, userData: any): Promise<ApiResponse> {
    return this.makeRequest(`${LARAVEL_ENDPOINTS.USERS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Dependent methods
  async getDependents(userId?: string): Promise<ApiResponse> {
    const endpoint = userId
      ? `${LARAVEL_ENDPOINTS.DEPENDENTS}?user_id=${userId}`
      : LARAVEL_ENDPOINTS.DEPENDENTS;
    return this.makeRequest(endpoint);
  }

  async createDependent(dependentData: any): Promise<ApiResponse> {
    return this.makeRequest(LARAVEL_ENDPOINTS.DEPENDENTS, {
      method: 'POST',
      body: JSON.stringify(dependentData),
    });
  }

  async updateDependent(id: string, dependentData: any): Promise<ApiResponse> {
    return this.makeRequest(`${LARAVEL_ENDPOINTS.DEPENDENTS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dependentData),
    });
  }

  async deleteDependent(id: string): Promise<ApiResponse> {
    return this.makeRequest(`${LARAVEL_ENDPOINTS.DEPENDENTS}/${id}`, {
      method: 'DELETE',
    });
  }

  // Skin Analysis methods
  async getSkinAnalyses(userId?: string): Promise<ApiResponse> {
    if (!userId) {
      throw new Error('User ID is required to get skin analyses');
    }
    const endpoint = `/users/${userId}/skin-analyses`;
    return this.makeRequest(endpoint);
  }

  async createSkinAnalysis(analysisData: any): Promise<ApiResponse> {
    // This should use the Python API for face analysis
    return this.makeRequest('/skin-analyses', {
      method: 'POST',
      body: JSON.stringify(analysisData),
    });
  }

  async analyzeImage(formData: FormData): Promise<ApiResponse> {
    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Use Python API for face analysis
    const pythonBaseURL = API_CONFIG.PYTHON_BASE_URL;
    return fetch(`${pythonBaseURL}${PYTHON_ENDPOINTS.COMPREHENSIVE_ANALYSIS}`, {
      method: 'POST',
      headers,
      body: formData,
    }).then((response) => response.json());
  }

  async analyzeSkin(imageUri: string): Promise<ApiResponse> {
    // Create FormData for image upload
    const formData = new FormData();

    // Add the image file
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'face_scan.jpg',
    } as any);

    // Add analysis parameters
    formData.append('analysis_type', 'comprehensive');
    formData.append('include_recommendations', 'true');

    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const pythonBaseURL = API_CONFIG.PYTHON_BASE_URL;
      const response = await fetch(
        `${pythonBaseURL}${PYTHON_ENDPOINTS.COMPREHENSIVE_ANALYSIS}`,
        {
          method: 'POST',
          headers,
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Skin analysis completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Skin analysis failed:', error);
      throw error;
    }
  }

  // Utility methods
  async healthCheck(): Promise<ApiResponse> {
    return this.makeRequest(PYTHON_ENDPOINTS.HEALTH, {}, false);
  }

  async checkConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
      await this.healthCheck();
      return { connected: true };
    } catch (error: any) {
      return {
        connected: false,
        error: error.message || 'Connection failed',
      };
    }
  }

  async saveAuthToken(token: string): Promise<void> {
    this.token = token;
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error saving auth token:', error);
    }
  }

  async clearAuthToken(): Promise<void> {
    this.token = null;
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  }

  async hasAuthToken(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  }

  // Product methods
  async getProducts(params?: {
    category?: string;
    concerns?: string[];
    skin_types?: string[];
    search?: string;
    sort_by?: string;
    sort_order?: string;
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => queryParams.append(`${key}[]`, item));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';

    return this.makeRequest(endpoint, {}, false);
  }

  async getProduct(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/products/${id}`);
  }

  async getProductCategories(): Promise<ApiResponse> {
    return this.makeRequest('/products/categories', {}, false);
  }

  async getProductRecommendations(): Promise<ApiResponse> {
    return this.makeRequest('/products/recommendations');
  }

  async createProduct(productData: any): Promise<ApiResponse> {
    return this.makeRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any): Promise<ApiResponse> {
    return this.makeRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin methods
  async adminLogin(email: string, password: string): Promise<ApiResponse> {
    return this.makeRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async adminLogout(): Promise<ApiResponse> {
    return this.makeRequest('/admin/logout', {
      method: 'POST',
    });
  }

  async createSuperAdmin(adminData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    full_name: string;
    phone_number?: string;
    location?: string;
  }): Promise<ApiResponse> {
    return this.makeRequest('/admin/create-super-admin', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  }

  async getAdminDashboard(): Promise<ApiResponse> {
    return this.makeRequest('/admin/dashboard');
  }

  async getAdminUsers(params?: {
    search?: string;
    sort_by?: string;
    sort_order?: string;
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/admin/users?${queryString}`
      : '/admin/users';

    return this.makeRequest(endpoint);
  }

  async updateUserRole(userId: string, role: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
