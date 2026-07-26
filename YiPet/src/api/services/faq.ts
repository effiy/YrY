/**
 * FAQ API service — CRUD + batch reorder.
 */

import type { ApiClient, ApiResponse } from '../client';
import { FAQ } from '../endpoints';
import type {
  FAQRecord,
  FAQCreateRequest,
  FAQUpdateRequest,
  FAQBatchUpdateRequest,
  FAQReorderRequest,
} from '../types';

export class FAQService {
  constructor(private client: ApiClient) {}

  async list(): Promise<ApiResponse<FAQRecord[]>> {
    return this.client.get<FAQRecord[]>(FAQ.LIST);
  }

  async get(id: string): Promise<ApiResponse<FAQRecord>> {
    return this.client.get<FAQRecord>(FAQ.GET(id));
  }

  async create(req: FAQCreateRequest): Promise<ApiResponse<FAQRecord>> {
    return this.client.post<FAQRecord>(FAQ.CREATE, req);
  }

  async update(id: string, req: FAQUpdateRequest): Promise<ApiResponse<FAQRecord>> {
    return this.client.put<FAQRecord>(FAQ.UPDATE(id), req);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(FAQ.DELETE(id));
  }

  async batchUpdate(req: FAQBatchUpdateRequest): Promise<ApiResponse<{ updated: number }>> {
    return this.client.post<{ updated: number }>(FAQ.BATCH_UPDATE, req);
  }

  async reorder(req: FAQReorderRequest): Promise<ApiResponse<void>> {
    return this.client.post<void>(FAQ.REORDER, req);
  }
}
