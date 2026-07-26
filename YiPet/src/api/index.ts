/**
 * API layer barrel export.
 *
 * Four-layer architecture:
 *   Layer 1 — client.ts       (fetch wrapper, error handling, retry, streaming)
 *   Layer 2 — endpoints.ts    (path constants by domain)
 *   Layer 3 — types.ts        (request/response interfaces)
 *   Layer 4 — services/*.ts   (typed domain-specific API functions)
 *
 * Usage:
 *   import { createApiServices } from './api';
 *   const api = createApiServices({ baseUrl: 'http://localhost:10086' });
 *   const result = await api.sessions.list();
 */

export { createApiClient, type ApiClient, type ApiClientConfig, type ApiResponse, type StreamChunk } from './client';
export * as endpoints from './endpoints';
export * from './types';
export { createApiServices, type ApiServices } from './services';
