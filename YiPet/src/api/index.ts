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

export {
  type ApiClient,
  type ApiClientConfig,
  type ApiResponse,
  createApiClient,
  type StreamChunk,
} from './client';
export * as endpoints from './endpoints';
export { type ApiServices, createApiServices } from './services';
export * from './types';
