/**
 * API Client with comprehensive logging
 * Wraps fetch with automatic logging and error handling
 */

import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import testLogger from './testLogger';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 
                     process.env.EXPO_PUBLIC_API_BASE_URL || 
                     'http://192.168.100.91:8000';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    testLogger.info('API_CLIENT', 'Initialized', { baseUrl });
  }

  async request<T = any>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      requiresAuth = false
    } = options;

    const url = `${this.baseUrl}${endpoint}`;

    // Log request
    testLogger.apiRequest(method, endpoint, body);

    try {
      // Add auth token if required
      if (requiresAuth) {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          testLogger.warning('API_CLIENT', 'Auth required but no token found');
        }
      }

      // Add content type for JSON
      if (body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      // Make request
      const startTime = Date.now();
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      const duration = Date.now() - startTime;
      testLogger.info('API_CLIENT', `Request completed in ${duration}ms`);

      // Parse response
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Log response
      testLogger.apiResponse(method, endpoint, response.status, data);

      // Return formatted response
      if (response.ok) {
        return {
          success: true,
          data,
          status: response.status
        };
      } else {
        return {
          success: false,
          error: data?.detail || data?.message || 'Request failed',
          status: response.status
        };
      }

    } catch (error: any) {
      // Log error
      testLogger.apiError(method, endpoint, error);

      return {
        success: false,
        error: error.message || 'Network error',
        status: 0
      };
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, requiresAuth = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }

  async post<T = any>(endpoint: string, body?: any, requiresAuth = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, requiresAuth });
  }

  async put<T = any>(endpoint: string, body?: any, requiresAuth = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, requiresAuth });
  }

  async delete<T = any>(endpoint: string, requiresAuth = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
  }

  async patch<T = any>(endpoint: string, body?: any, requiresAuth = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, requiresAuth });
  }
}

// Singleton instance
const apiClient = new ApiClient();

export default apiClient;
export { ApiClient, ApiResponse };
