/**
 * Session API service — CRUD, search, favorites, export/import.
 */

import type { ApiClient, ApiResponse } from '../client';
import { SESSIONS } from '../endpoints';
import type {
  SessionCreateRequest,
  SessionListResponse,
  SessionRecord,
  SessionSearchRequest,
  SessionUpdateRequest,
} from '../types';

export class SessionService {
  constructor(private client: ApiClient) {}

  async list(): Promise<ApiResponse<SessionListResponse>> {
    return this.client.get<SessionListResponse>(SESSIONS.LIST);
  }

  async get(id: string): Promise<ApiResponse<SessionRecord>> {
    return this.client.get<SessionRecord>(SESSIONS.GET(id));
  }

  async create(req: SessionCreateRequest): Promise<ApiResponse<SessionRecord>> {
    return this.client.post<SessionRecord>(SESSIONS.CREATE, req);
  }

  async update(id: string, req: SessionUpdateRequest): Promise<ApiResponse<SessionRecord>> {
    return this.client.put<SessionRecord>(SESSIONS.UPDATE(id), req);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(SESSIONS.DELETE(id));
  }

  async batchDelete(ids: string[]): Promise<ApiResponse<{ deleted: number }>> {
    return this.client.post<{ deleted: number }>(SESSIONS.BATCH_DELETE, { ids });
  }

  async search(req: SessionSearchRequest): Promise<ApiResponse<SessionListResponse>> {
    return this.client.post<SessionListResponse>(SESSIONS.SEARCH, req);
  }

  async favorites(): Promise<ApiResponse<SessionRecord[]>> {
    return this.client.get<SessionRecord[]>(SESSIONS.FAVORITES);
  }

  /** Export sessions — returns JSON data. */
  async export(ids?: string[]): Promise<ApiResponse<SessionRecord[]>> {
    return this.client.post<SessionRecord[]>(SESSIONS.EXPORT, { ids });
  }

  /** Import sessions — sends JSON payload. */
  async import(data: SessionRecord[]): Promise<ApiResponse<{ imported: number }>> {
    return this.client.post<{ imported: number }>(SESSIONS.IMPORT, { sessions: data });
  }
}
