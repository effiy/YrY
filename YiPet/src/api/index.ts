/**
 * API layer barrel export.
 *
 * Four-layer architecture:
 *   Layer 1 — client.ts       (fetch wrapper, RPC, SSE streaming)
 *   Layer 2 — endpoints.ts    (path constants by domain, matching YiAi routes)
 *   Layer 3 — types.ts        (request/response interfaces matching YiAi schemas)
 *   Layer 4 — services/*.ts   (typed domain-specific API functions)
 *
 * Usage:
 *   import { createApiServices } from '@/api';
 *   const api = createApiServices({ baseUrl: 'http://localhost:10086' });
 *   const result = await api.sessions.list();
 */

export {
  type ApiClient,
  type ApiClientConfig,
  type ApiResponse,
  createApiClient,
  type StreamChunk,
  type YiAiEnvelope,
} from './client';
export * as endpoints from './endpoints';
export type {
  AgentService,
  AuthService,
  BugService,
  ChatService,
  DatabaseService,
  KnowledgeService,
  RagService,
  SessionService,
  WeWorkService,
} from './services';
export { type ApiServices, createApiServices } from './services';
export * from './types';
