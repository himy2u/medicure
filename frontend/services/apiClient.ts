import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:8000';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
  user_id: string;
}

export interface SignupResponse {
  access_token: string;
  token_type: string;
  role: string;
  user_id: string;
}

class ApiClient {
  private async getAuthHeader(): Promise<Record<string, string>> {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }

  async signup(name: string, email: string, password: string, role: string): Promise<SignupResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!response.ok) {
      throw new Error('Signup failed');
    }

    return response.json();
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Failed to send reset email');
    }
  }

  async storeToken(token: string, role: string): Promise<void> {
    await SecureStore.setItemAsync('auth_token', token);
    await SecureStore.setItemAsync('user_role', role);
  }

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('auth_token');
  }

  async getUserRole(): Promise<string | null> {
    return await SecureStore.getItemAsync('user_role');
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_role');
  }
}

export const apiClient = new ApiClient();
