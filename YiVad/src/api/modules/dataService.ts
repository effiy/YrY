/**
 * Generic RPC wrapper for the YiAi data service.
 *
 * YiAi uses a unified RPC protocol where all database operations go through:
 *   POST {API_URL}/ {"module_name":"services.database.data_service", "method_name":"...", "parameters":{...}}
 *
 * This module wraps that protocol and exposes typed convenience functions.
 */
import http from "@/api/index";
import type { YiAiEnvelope, ServicePayload, QueryDocumentsParams, QueryDocumentsData } from "@/api/interface/yiAi";

const DATA_SERVICE = "services.database.data_service";

/**
 * Call any YiAi service module method.
 * Low-level — prefer using the convenience functions below.
 */
export function callService<T = any>(
  module: string,
  method: string,
  params: Record<string, any> = {},
  opts: { timeout?: number; signal?: AbortSignal } = {}
): Promise<YiAiEnvelope<T>> {
  const payload: ServicePayload = {
    module_name: module,
    method_name: method,
    parameters: params
  };
  const cfg: Record<string, any> = { cancel: false };
  if (opts.timeout) cfg.timeout = opts.timeout;
  if (opts.signal) cfg.signal = opts.signal;
  return http.post<YiAiEnvelope<T>>("", payload, cfg) as any;
}

export interface QueryDocumentsOpts {
  timeout?: number;
  signal?: AbortSignal;
}

export function queryDocuments<T = any>(
  params: QueryDocumentsParams,
  opts: QueryDocumentsOpts = {}
): Promise<YiAiEnvelope<QueryDocumentsData<T>>> {
  return callService<QueryDocumentsData<T>>(
    DATA_SERVICE,
    "query_documents",
    params as unknown as Record<string, any>,
    { timeout: opts.timeout ?? 15_000, signal: opts.signal }
  );
}

export function createDocument<T = any>(
  cname: string,
  data: Record<string, any>,
  opts: QueryDocumentsOpts = {}
): Promise<YiAiEnvelope<T>> {
  return callService<T>(
    DATA_SERVICE,
    "create_document",
    { cname, data },
    { timeout: opts.timeout ?? 15_000, signal: opts.signal }
  );
}

export function updateDocument<T = any>(
  cname: string,
  key: string,
  data: Record<string, any>,
  opts: QueryDocumentsOpts = {}
): Promise<YiAiEnvelope<T>> {
  return callService<T>(
    DATA_SERVICE,
    "update_document",
    { cname, key, data: { ...data, key } },
    { timeout: opts.timeout ?? 15_000, signal: opts.signal }
  );
}

export function countDocuments(
  cname: string,
  filter?: Record<string, any>,
  groupBy?: string,
  opts: QueryDocumentsOpts = {}
): Promise<YiAiEnvelope<{ count?: number; groups?: Array<{ value: any; count: number }>; total?: number }>> {
  return callService(
    DATA_SERVICE,
    "count_documents",
    { cname, ...(filter ? { filter } : {}), ...(groupBy ? { groupBy } : {}) },
    { timeout: opts.timeout ?? 10_000, signal: opts.signal }
  );
}

export function deleteDocument<T = any>(
  cname: string,
  key: string,
  opts: QueryDocumentsOpts = {}
): Promise<YiAiEnvelope<T>> {
  return callService<T>(
    DATA_SERVICE,
    "delete_document",
    { cname, key },
    { timeout: opts.timeout ?? 15_000, signal: opts.signal }
  );
}
