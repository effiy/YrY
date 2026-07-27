/**
 * Database API service — generic collection CRUD via YiAi's execution module
 * (services.database.data_service).
 */

import type { ApiClient, ApiResponse } from '../client';
import type { CreateParams, DeleteParams, MutationResult, QueryParams, QueryResult, UpdateParams } from '../types';

const DB_MODULE = 'services.database.data_service';

export class DatabaseService {
  constructor(private client: ApiClient) {}

  async query(params: Partial<QueryParams>): Promise<ApiResponse<QueryResult>> {
    return this.client.rpc<QueryResult>(DB_MODULE, 'query_documents', params as Record<string, unknown>);
  }

  async create(params: Partial<CreateParams>): Promise<ApiResponse<MutationResult>> {
    return this.client.rpc<MutationResult>(DB_MODULE, 'create_document', params as Record<string, unknown>);
  }

  async update(params: Partial<UpdateParams>): Promise<ApiResponse<MutationResult>> {
    return this.client.rpc<MutationResult>(DB_MODULE, 'update_document', params as Record<string, unknown>);
  }

  async delete(params: Partial<DeleteParams>): Promise<ApiResponse<MutationResult>> {
    return this.client.rpc<MutationResult>(DB_MODULE, 'delete_document', params as Record<string, unknown>);
  }
}
