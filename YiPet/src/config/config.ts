/**
 * Environment-aware config orchestrator.
 * Reads PET_DEFAULTS, applies env overrides, and provides API client config.
 *
 * Consumed by:
 *   - popup/data.ts       → PopupConfig adapter
 *   - api/services/index.ts → createApiServices()
 */

import type { ApiClientConfig } from '../api/client';
import { PET_DEFAULTS } from './defaults';

export type Env = 'production' | 'staging' | 'development';

export interface AppConfig {
  env: Env;
  constants: typeof PET_DEFAULTS.constants;
  pet: typeof PET_DEFAULTS.pet;
  /** Build a full URL for the given API path. */
  url(path: string): string;
  /** API client configuration — pass to createApiClient(). */
  getApiClientConfig(): ApiClientConfig;
}

export function createConfig(env: Env = 'production', apiBase?: string): AppConfig {
  const base = apiBase || PET_DEFAULTS.api.yiaiBaseUrl || 'http://localhost:10086';
  const endpoints = PET_DEFAULTS.env.endpoints[env] || PET_DEFAULTS.env.endpoints.production;

  return {
    env,
    constants: PET_DEFAULTS.constants,
    pet: PET_DEFAULTS.pet,

    url(path: string): string {
      const normPath = path.startsWith('/') ? path : '/' + path;
      const ep = (endpoints as Record<string, string>)[path];
      if (ep) return ep.startsWith('http') ? ep : `${base}${ep.startsWith('/') ? ep : '/' + ep}`;
      return `${base.replace(/\/+$/, '')}${normPath}`;
    },

    getApiClientConfig(): ApiClientConfig {
      return {
        baseUrl: base,
        timeout: 30000,
        retry: {
          maxRetries: PET_DEFAULTS.constants.RETRY.MAX_RETRIES || 3,
          baseMs: PET_DEFAULTS.constants.RETRY.INITIAL_DELAY || 500,
        },
      };
    },
  };
}

export const PET_CONFIG = createConfig(
  (import.meta.env.MODE as Env) || 'production',
  import.meta.env.RSBUILD_API_BASE,
);
