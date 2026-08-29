/**
 * UrlBuilder — CDN utility (built as IIFE, attaches window.UrlBuilder).
 *
 * Also importable as an ES module within the extension:
 *   import { buildUrl, buildQueryParams } from '../cdn/url';
 */

export interface UrlBuilderAPI {
  buildUrl(baseUrl: string, endpoint: string, params?: Record<string, unknown>): string;
  buildQueryParams(params?: Record<string, unknown>): string;
  buildDatabaseUrl(baseUrl: string, methodName: string, parameters?: Record<string, unknown>): string;
}

/** Replace :param placeholders and join with baseUrl. */
export function buildUrl(
  baseUrl: string,
  endpoint: string,
  params?: Record<string, unknown>,
): string {
  let url = endpoint;

  if (params) {
    for (const key of Object.keys(params)) {
      url = url.replace(':' + key, encodeURIComponent(String(params[key])));
    }
  }

  if (!/^https?:\/\//.test(url) && baseUrl) {
    url = baseUrl.replace(/\/$/, '') + '/' + url.replace(/^\//, '');
  }

  return url;
}

/** Build URL query string from a params object. */
export function buildQueryParams(params?: Record<string, unknown>): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  for (const key of Object.keys(params)) {
    const value = params[key];
    if (value === undefined || value === null) continue;
    if (typeof value === 'object') {
      searchParams.append(key, JSON.stringify(value));
    } else {
      searchParams.append(key, String(value));
    }
  }

  return searchParams.toString();
}

/** Build a database API URL with module/method query params. */
export function buildDatabaseUrl(
  baseUrl: string,
  methodName: string,
  parameters?: Record<string, unknown>,
): string {
  const queryParams = new URLSearchParams({
    module_name: 'services.database.data_service',
    method_name: methodName,
    parameters: JSON.stringify(parameters || {}),
  });

  return baseUrl + '/?' + queryParams.toString();
}

/* ── Global attachment (for CDN/IIFE build) ────────────────────────── */

const api: UrlBuilderAPI = { buildUrl, buildQueryParams, buildDatabaseUrl };

export default api;

// Attach to window when loaded as a plain <script> (CDN context)
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).UrlBuilder = api;
}
