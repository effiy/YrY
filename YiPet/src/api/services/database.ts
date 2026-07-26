/**
 * Database API service — generic collection query/create/update/delete.
 */

import type { ApiClient, ApiResponse } from '../client';
import { DATABASE } from '../endpoints';
import type {
  DatabaseQueryRequest,
  DatabaseWriteRequest,
  DatabaseUpdateRequest,
  DatabaseDeleteRequest,
  DatabaseBatchRequest,
  DatabaseResponse,
} from '../types';

export class DatabaseService {
  constructor(private client: ApiClient) {}

  async query(req: DatabaseQueryRequest): Promise<ApiResponse<DatabaseResponse>> {
    return this.client.post<DatabaseResponse>(DATABASE.QUERY, req);
  }

  async create(req: DatabaseWriteRequest): Promise<ApiResponse<DatabaseResponse>> {
    return this.client.post<DatabaseResponse>(DATABASE.CREATE, req);
  }

  async update(req: DatabaseUpdateRequest): Promise<ApiResponse<DatabaseResponse>> {
    return this.client.post<DatabaseResponse>(DATABASE.UPDATE, req);
  }

  async delete(req: DatabaseDeleteRequest): Promise<ApiResponse<DatabaseResponse>> {
    return this.client.post<DatabaseResponse>(DATABASE.DELETE, req);
  }

  async batch(req: DatabaseBatchRequest): Promise<ApiResponse<DatabaseResponse>> {
    return this.client.post<DatabaseResponse>(DATABASE.BATCH, req);
  }
}
