/**
 * API service aggregator — single entry point for all API domains.
 *
 * Layer 4 barrel export. Consume via:
 *   import { createApiServices } from '@/api';
 *   const api = createApiServices({ baseUrl: 'http://localhost:10086' });
 */

export { AuthService } from './auth';
export { BridgeService } from './bridge';
export { ChatService } from './chat';
export { DatabaseService } from './database';
export { KnowledgeService } from './knowledge';
export { RagService } from './rag';
export { SearchService } from './search';
export { SessionService } from './sessions';
export type { TranslationService } from './translation';
export { WeWorkService } from './wework';
export type { DashboardService, DashboardSummary, ProjectSummary, LiveSnapshot } from './dashboard';

import { type ApiClient, type ApiClientConfig, createApiClient } from '../client';
import { AuthService } from './auth';
import { BridgeService } from './bridge';
import { ChatService } from './chat';
import { DatabaseService } from './database';
import { KnowledgeService } from './knowledge';
import { RagService } from './rag';
import { SearchService } from './search';
import { SessionService } from './sessions';
import { createTranslationService, type TranslationService } from './translation';
import { WeWorkService } from './wework';
import { createDashboardService, type DashboardService } from './dashboard';

export interface ApiServices {
  client: ApiClient;
  auth: AuthService;
  bridge: BridgeService;
  sessions: SessionService;
  chat: ChatService;
  database: DatabaseService;
  knowledge: KnowledgeService;
  rag: RagService;
  search: SearchService;
  translation: TranslationService;
  wework: WeWorkService;
  dashboard: DashboardService;
}

/**
 * Create all API services bound to a single client instance.
 * Call once at app startup; pass the services object down to components.
 */
export function createApiServices(config: ApiClientConfig & { token?: string }): ApiServices {
  const client = createApiClient(config);
  return {
    client,
    auth: new AuthService(client),
    bridge: new BridgeService(client),
    sessions: new SessionService(client),
    chat: new ChatService(client),
    database: new DatabaseService(client),
    knowledge: new KnowledgeService(client),
    rag: new RagService(client),
    search: new SearchService(client),
    translation: createTranslationService(client),
    wework: new WeWorkService(client),
    dashboard: createDashboardService(client),
  };
}