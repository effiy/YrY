/**
 * CDN Utilities — single entry point, built as IIFE.
 * Attaches UrlBuilder, LoggerUtils, and YiPetApi to window.
 *
 * All three are bundled into one file at public/cdn/utils/index.js.
 * The CDN catalog references each tool's global name.
 */

import urlApi from './url';
import { LoggerUtils } from './log';
import { createApiClient } from './api-client';

// Re-export for ES module consumers
export { buildUrl, buildQueryParams, buildDatabaseUrl } from './url';
export { LoggerUtils } from './log';
export { createApiClient } from './api-client';
export type { ApiClientConfig, ApiResponse, ApiClient } from './api-client';
export { urlApi as UrlBuilder };

// Attach to window for IIFE/CDN <script> tag usage
if (typeof window !== 'undefined') {
  const w = window as unknown as Record<string, unknown>;
  w.UrlBuilder = urlApi;
  w.LoggerUtils = LoggerUtils;
  w.YiPetApi = { createClient: createApiClient };
}
