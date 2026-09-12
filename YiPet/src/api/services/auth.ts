/**
 * Auth API service — login, logout via YiAi's REST endpoints.
 */

import type { ApiClient, ApiResponse } from '../client';
import { AUTH } from '../endpoints';
import type { LoginRequest, LoginResponse } from '../types';

export class AuthService {
  constructor(private client: ApiClient) {}

  async login(req: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.client.post<LoginResponse>(AUTH.LOGIN, req);
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.client.post<void>(AUTH.LOGOUT);
  }
}
