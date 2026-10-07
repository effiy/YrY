/**
 * RPC protocol types for the YiAi backend.
 * The YiAi backend uses a generic RPC protocol: POST {API_URL}/
 * with { module_name, method_name, parameters }.
 */

/** Generic RPC payload sent to the YiAi data service */
export interface ServicePayload {
  module_name: string;
  method_name: string;
  parameters: Record<string, any>;
}

/** Unified response envelope from YiAi */
export interface YiAiEnvelope<T = any> {
  code: number;
  message: string;
  data: T;
}

/** Response shape from query_documents */
export interface QueryDocumentsData<T = any> {
  list: T[];
  total?: number;
}

/** Query parameters for query_documents */
export interface QueryDocumentsParams {
  cname: string;
  filter?: Record<string, any>;
  pageNum?: number;
  pageSize?: number;
  orderBy?: string;
  orderType?: "asc" | "desc";
  fields?: string[];
  excludeFields?: string[];
}