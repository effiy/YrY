/**
 * Auth API service — login, logout, token management.
 */

import type { ApiClient, ApiResponse } from '../client';
import { AUTH } from '../endpoints';
import type { LoginRequest, LoginResponse, UserProfile } from '../types';

export class AuthService {
  constructor(private client: ApiClient) {}

  async login(req: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.client.post<LoginResponse>(AUTH.LOGIN, req);
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.client.post<void>(AUTH.LOGOUT);
  }

  async refresh(refreshToken: string): Promise<ApiResponse<LoginResponse>> {
    return this.client.post<LoginResponse>(AUTH.REFRESH, { refresh_token: refreshToken });
  }

  async profile(): Promise<ApiResponse<UserProfile>> {
    return this.client.get<UserProfile>(AUTH.PROFILE);
  }

  async validate(): Promise<ApiResponse<{ valid: boolean }>> {
    return this.client.get<{ valid: boolean }>(AUTH.VALIDATE);
  }
}
