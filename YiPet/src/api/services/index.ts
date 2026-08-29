/**
 * API service aggregator — single entry point for all API domains.
 *
 * Layer 4 barrel export. Consume via:
 *   import { createApiServices } from '@/api';
 *   const api = createApiServices({ baseUrl: 'http://localhost:10086' });
 *   const result = await api.sessions.list();
 */

export { AgentService } from './agent';
export { AuthService } from './auth';
export { BugService } from './bug';
export { ChatService } from './chat';
export { DatabaseService } from './database';
export { KnowledgeService } from './knowledge';
export { RagService } from './rag';
export { SessionService } from './sessions';
export { WeWorkService } from './wework';

import { type ApiClient, type ApiClientConfig, createApiClient } from '../client';
import { AgentService } from './agent';
import { AuthService } from './auth';
import { BugService } from './bug';
import { ChatService } from './chat';
import { DatabaseService } from './database';
import { KnowledgeService } from './knowledge';
import { RagService } from './rag';
import { SessionService } from './sessions';
import { WeWorkService } from './wework';

export interface ApiServices {
  client: ApiClient;
  auth: AuthService;
  sessions: SessionService;
  chat: ChatService;
  agent: AgentService;
  database: DatabaseService;
  knowledge: KnowledgeService;
  rag: RagService;
  bug: BugService;
  wework: WeWorkService;
}

/**
 * Create all API services bound to a single client instance.
 * Call once at app startup; pass the services object down to components.
 */
export function createApiServices(config: ApiClientConfig): ApiServices {
  const client = createApiClient(config);
  return {
    client,
    auth: new AuthService(client),
    sessions: new SessionService(client),
    chat: new ChatService(client),
    agent: new AgentService(client),
    database: new DatabaseService(client),
    knowledge: new KnowledgeService(client),
    rag: new RagService(client),
    bug: new BugService(client),
    wework: new WeWorkService(client),
  };
}
