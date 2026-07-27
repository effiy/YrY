/**
 * API service aggregator — single entry point for all API domains.
 *
 * Layer 4 barrel export. Consume via:
 *   import { createApiServices } from '../api/services';
 *   const api = createApiServices(baseUrl);
 *   const result = await api.auth.login({ username, password });
 */

export { AuthService } from './auth';
export { ChatService } from './chat';
export { ConfigService } from './config';
export { DatabaseService } from './database';
export { FAQService } from './faq';
export { SessionService } from './sessions';

import { type ApiClient, type ApiClientConfig, createApiClient } from '../client';
import { AuthService } from './auth';
import { ChatService } from './chat';
import { ConfigService } from './config';
import { DatabaseService } from './database';
import { FAQService } from './faq';
import { SessionService } from './sessions';

export interface ApiServices {
  client: ApiClient;
  auth: AuthService;
  sessions: SessionService;
  chat: ChatService;
  faq: FAQService;
  config: ConfigService;
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
    faq: new FAQService(client),
    config: new ConfigService(client),
    database: new DatabaseService(client),
  };
}
