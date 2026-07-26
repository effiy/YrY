/**
 * Generic RPC wrapper for the YiAi data service.
 *
 * YiAi uses a unified RPC protocol where all database operations go through:
 *   POST {API_URL}/ {"module_name":"services.database.data_service", "method_name":"...", "parameters":{...}}
 *
 * This module wraps that protocol and exposes typed convenience functions.
 */
import http from "@/api/index";
import type { YiAiEnvelope, ServicePayload, QueryDocumentsParams, QueryDocumentsData } from "@/api/interface/yiweb";

const DATA_SERVICE = "services.database.data_service";

/**
 * Call any YiAi service module method.
 * Low-level — prefer using the convenience functions below.
 */
export function callService<T = any>(module: string, method: string, params: Record<string, any> = {}): Promise<YiAiEnvelope<T>> {
  const payload: ServicePayload = {
    module_name: module,
    method_name: method,
    parameters: params
  };
  return http.post<YiAiEnvelope<T>>("", payload) as any;
}

/**
 * Query documents from a collection.
 * @param cname - collection name (e.g., "sessions", "goals", "faqs")
 */
export function queryDocuments<T = any>(params: QueryDocumentsParams): Promise<YiAiEnvelope<QueryDocumentsData<T>>> {
  return callService<QueryDocumentsData<T>>(DATA_SERVICE, "query_documents", params as unknown as Record<string, any>);
}

/**
 * Create a document in a collection.
 * @param cname - collection name
 * @param data - document data (must include a unique key)
 */
export function createDocument<T = any>(cname: string, data: Record<string, any>): Promise<YiAiEnvelope<T>> {
  return callService<T>(DATA_SERVICE, "create_document", { cname, data });
}

/**
 * Update a document in a collection.
 * @param cname - collection name
 * @param key - document key
 * @param data - fields to update
 */
export function updateDocument<T = any>(cname: string, key: string, data: Record<string, any>): Promise<YiAiEnvelope<T>> {
  return callService<T>(DATA_SERVICE, "update_document", { cname, key, data });
}

/**
 * Delete a document from a collection.
 * @param cname - collection name
 * @param key - document key
 */
export function deleteDocument<T = any>(cname: string, key: string): Promise<YiAiEnvelope<T>> {
  return callService<T>(DATA_SERVICE, "delete_document", { cname, key });
}

/**
 * Call the AI chat service (non-streaming).
 * @param payload - chat request with model, messages, system prompt, etc.
 */
export function chat(payload: Record<string, any>): Promise<YiAiEnvelope<any>> {
  return callService("services.ai.chat_service", "chat", payload);
}
