/**
 * API service aggregator — single entry point for all API domains.
 *
 * Layer 4 barrel export. Consume via:
 *   import { createApiServices } from '@/api';
 *   const api = createApiServices({ baseUrl: 'http://localhost:10086' });
 *   const result = await api.sessions.list();
 */

export { AuthService } from './auth';
export { ChatService } from './chat';
export { DatabaseService } from './database';
export { SessionService } from './sessions';

import { type ApiClient, type ApiClientConfig, createApiClient } from '../client';
import { AuthService } from './auth';
import { ChatService } from './chat';
import { DatabaseService } from './database';
import { SessionService } from './sessions';

export interface ApiServices {
  client: ApiClient;
  auth: AuthService;
  sessions: SessionService;
  chat: ChatService;
  database: DatabaseService;
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
    database: new DatabaseService(client),
  };
}
