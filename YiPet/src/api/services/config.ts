/**
 * Config API service — application config get/update/reset.
 */

import type { ApiClient, ApiResponse } from '../client';
import { CONFIG } from '../endpoints';
import type { AppConfigRecord, ConfigUpdateRequest } from '../types';

export class ConfigService {
  constructor(private client: ApiClient) {}

  async get(): Promise<ApiResponse<AppConfigRecord[]>> {
    return this.client.get<AppConfigRecord[]>(CONFIG.GET);
  }

  async update(req: ConfigUpdateRequest): Promise<ApiResponse<void>> {
    return this.client.put<void>(CONFIG.UPDATE, req);
  }

  async reset(): Promise<ApiResponse<void>> {
    return this.client.post<void>(CONFIG.RESET);
  }
}
