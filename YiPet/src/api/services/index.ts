/**
 * API service aggregator — single entry point for all API domains.
 *
 * Layer 4 barrel export. Consume via:
 *   import { createApiServices } from '../api/services';
 *   const api = createApiServices(baseUrl);
 *   const result = await api.auth.login({ username, password });
 */

export { AuthService } from './auth';
export { SessionService } from './sessions';
export { ChatService } from './chat';
export { FAQService } from './faq';
export { ConfigService } from './config';
export { DatabaseService } from './database';

import { createApiClient, type ApiClient, type ApiClientConfig } from '../client';
import { AuthService } from './auth';
import { SessionService } from './sessions';
import { ChatService } from './chat';
import { FAQService } from './faq';
import { ConfigService } from './config';
import { DatabaseService } from './database';

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
    auth:      new AuthService(client),
    sessions:  new SessionService(client),
    chat:      new ChatService(client),
    faq:       new FAQService(client),
    config:    new ConfigService(client),
    database:  new DatabaseService(client),
  };
}
