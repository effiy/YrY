/**
 * Session API service — CRUD via YiAi's execution module
 * (services.database.data_service on the 'sessions' collection).
 */

import type { ApiClient, ApiResponse } from '../client';
import type {
  CreateParams,
  MutationResult,
  QueryParams,
  QueryResult,
  SessionRecord,
  UpdateParams,
} from '../types';

const DB_MODULE = 'services.database.data_service';
const COLLECTION = 'sessions';

export class SessionService {
  constructor(private client: ApiClient) {}

  /** List sessions. */
  async list(params?: { pageSize?: number }): Promise<ApiResponse<SessionRecord[]>> {
    const result = await this.client.rpc<QueryResult<SessionRecord>>(DB_MODULE, 'query_documents', {
      cname: COLLECTION,
      filter: {},
      ...(params?.pageSize ? { pageSize: params.pageSize } : {}),
    } satisfies Partial<QueryParams>);
    if (!result.ok) return result as ApiResponse<SessionRecord[]>;
    const data = result.data;
    const list = Array.isArray(data) ? data : (data?.list ?? data?.documents ?? data?.result ?? []);
    return { ...result, data: list };
  }

  /** Get a single session by key. */
  async get(id: string): Promise<ApiResponse<SessionRecord | null>> {
    const result = await this.client.rpc<QueryResult<SessionRecord>>(DB_MODULE, 'query_documents', {
      cname: COLLECTION,
      filter: { key: id },
    } satisfies Partial<QueryParams>);
    if (!result.ok) return result as ApiResponse<SessionRecord | null>;
    const data = result.data;
    const list: SessionRecord[] = Array.isArray(data)
      ? data
      : (data?.list ?? data?.documents ?? data?.result ?? []);
    return { ...result, data: list[0] ?? null };
  }

  /** Create a new session document. */
  async create(doc: Record<string, unknown>): Promise<ApiResponse<SessionRecord | null>> {
    const result = await this.client.rpc<MutationResult>(DB_MODULE, 'create_document', {
      cname: COLLECTION,
      data: doc,
    } satisfies Partial<CreateParams>);
    if (!result.ok || !result.data?.key) {
      return {
        ok: false,
        status: result.status,
        data: null,
        error: result.error || 'Create failed',
      };
    }
    return { ...result, data: { key: result.data.key, ...doc } as SessionRecord };
  }

  /** Update a session document by key. */
  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<ApiResponse<SessionRecord | null>> {
    const result = await this.client.rpc<MutationResult>(DB_MODULE, 'update_document', {
      cname: COLLECTION,
      key: id,
      data: { key: id, ...data, updatedAt: Date.now() },
    } satisfies Partial<UpdateParams>);
    if (!result.ok) return result as ApiResponse<SessionRecord | null>;
    return { ...result, data: { key: id, ...data } as SessionRecord };
  }

  /** Delete a session by key. */
  async delete(id: string): Promise<ApiResponse<boolean>> {
    const result = await this.client.rpc<MutationResult>(DB_MODULE, 'delete_document', {
      cname: COLLECTION,
      key: id,
    });
    return {
      ok: result.ok,
      status: result.status,
      data: result.data?.deleted === true,
      error: result.error,
    };
  }
}
